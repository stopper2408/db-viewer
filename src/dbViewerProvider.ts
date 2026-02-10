import * as vscode from 'vscode';
import * as path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

interface TableRow {
    [key: string]: string | number | boolean | null | Uint8Array;
}

class SqliteDocument implements vscode.CustomDocument {
    constructor(
        public readonly uri: vscode.Uri,
        public readonly db: Database
    ) { }

    dispose(): void {
        this.db.close();
    }
}

export class DbViewerProvider implements vscode.CustomReadonlyEditorProvider<SqliteDocument> {
    private static sqlJs: SqlJsStatic | undefined;

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new DbViewerProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            DbViewerProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false
            }
        );
        return providerRegistration;
    }

    private static readonly viewType = 'db-viewer.dbViewer';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    private escapeId(id: string): string {
        return '"' + id.replace(/"/g, '""') + '"';
    }

    private async getSqlJs(): Promise<SqlJsStatic> {
        if (!DbViewerProvider.sqlJs) {
             DbViewerProvider.sqlJs = await initSqlJs({
                locateFile: file => {
                    return path.join(__dirname, file);
                }
            });
        }
        return DbViewerProvider.sqlJs;
    }

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<SqliteDocument> {
        const SQL = await this.getSqlJs();
        const buffer = await vscode.workspace.fs.readFile(uri);
        const db = new SQL.Database(buffer);
        return new SqliteDocument(uri, db);
    }

    async resolveCustomEditor(
        document: SqliteDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

        // Load database and send data to webview
        this.loadDatabaseInfo(document, webviewPanel.webview);

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(
            async message => {
                switch (message.type) {
                    case 'getTableData':
                        // Pass sort parameters to the table data loader
                        await this.loadTableData(
                            document, 
                            message.tableName, 
                            webviewPanel.webview, 
                            message.page, 
                            message.pageSize, 
                            message.sortCol, 
                            message.sortDir
                        );
                        break;
                    case 'searchTable':
                        await this.searchTableData(document, message.tableName, message.searchTerm, webviewPanel.webview, message.page, message.pageSize);
                        break;
                    case 'executeQuery':
                        await this.executeCustomQuery(document, message.query, webviewPanel.webview);
                        break;
                    case 'saveFile':
                        await this.saveFile(message.content, message.filename, message.fileType);
                        break;
                    case 'updateCell':
                        await this.updateCell(document, message.tableName, message.rowId, message.column, message.value, webviewPanel.webview);
                        break;
                }
            }
        );
    }

    private async updateCell(
        document: SqliteDocument,
        tableName: string,
        rowId: number,
        column: string,
        value: string,
        webview: vscode.Webview
    ) {
        try {
            const db = document.db;
            const sql = `UPDATE ${this.escapeId(tableName)} SET ${this.escapeId(column)} = ? WHERE rowid = ?`;
            db.run(sql, [value, rowId]);
            
            // Export and Save
            const data = db.export();
            await vscode.workspace.fs.writeFile(document.uri, data);
            
            webview.postMessage({
                type: 'updateSuccess',
                tableName,
                rowId,
                column,
                value
            });
        } catch (err) {
            console.error('[DB Viewer] Update failed:', err);
            webview.postMessage({
                type: 'updateError',
                message: err instanceof Error ? err.message : String(err),
                tableName,
                rowId,
                column
            });
        }
    }

    private async saveFile(content: string, defaultFilename: string, fileType: string) {
        const filters: { [name: string]: string[] } = {};
        if (fileType === 'csv') {
            filters['CSV Files'] = ['csv'];
        } else if (fileType === 'json') {
            filters['JSON Files'] = ['json'];
        } else {
             filters['Text Files'] = ['txt'];
        }

        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(defaultFilename),
            filters: filters
        });

        if (uri) {
            try {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                vscode.window.showInformationMessage(`File saved successfully to ${uri.fsPath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    private async loadDatabaseInfo(document: SqliteDocument, webview: vscode.Webview) {
        try {
            console.log(`[DB Viewer] Loading database info for: ${document.uri.toString()}`);
            const db = document.db;

            // Get all tables
            const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
            const tableNames: string[] = result.length > 0 ? result[0].values.map(row => row[0] as string) : [];

            console.log(`[DB Viewer] Found ${tableNames.length} tables: ${tableNames.join(', ')}`);

            // Send tables immediately with undefined counts
            const initialTables = tableNames.map(name => ({ name, rowCount: undefined }));

            webview.postMessage({
                type: 'databaseLoaded',
                tables: initialTables
            });

            // Asynchronously fetch counts
            for (const tableName of tableNames) {
                // Yield to event loop to prevent freezing
                await new Promise(resolve => setTimeout(resolve, 0));
                
                try {
                    const countResult = db.exec(`SELECT COUNT(*) as count FROM ${this.escapeId(tableName)}`);
                    const rowCount = countResult.length > 0 ? countResult[0].values[0][0] as number : 0;
                    
                    webview.postMessage({
                        type: 'updateRowCount',
                        tableName: tableName,
                        rowCount: rowCount
                    });
                } catch (err) {
                    console.error(`[DB Viewer] Error getting count for ${tableName}:`, err);
                }
            }

        } catch (error) {
            console.error('[DB Viewer] Error loading database:', error);
            webview.postMessage({
                type: 'error',
                message: `Failed to open database: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private processDataForWebview(data: any[]): any[] {
        return data.map(row => {
            const newRow: any = { ...row };
            for (const key in newRow) {
                const value = newRow[key];
                if (value instanceof Uint8Array) {
                    newRow[key] = `<BLOB: ${value.length} bytes>`;
                }
            }
            return newRow;
        });
    }

    private async loadTableData(
        document: SqliteDocument,
        tableName: string,
        webview: vscode.Webview,
        page: number = 1,
        pageSize: number = 100,
        sortCol?: string,
        sortDir?: string
    ) {
        try {
            console.log(`[DB Viewer] Loading table: ${tableName} (page ${page}, size ${pageSize})`);
            const db = document.db;

            // Get table schema (use double quotes to escape table names)
            const schemaResult = db.exec(`PRAGMA table_info(${this.escapeId(tableName)})`);
            const schema = schemaResult.length > 0 ? schemaResult[0].values : [];

            // Calculate pagination
            const p = Math.max(1, parseInt(String(page)) || 1);
            const size = Math.max(1, parseInt(String(pageSize)) || 100);
            const offset = (p - 1) * size;

            // Construct sort clause
            let validSortDir = 'ASC';
            if (sortDir && sortDir.toUpperCase() === 'DESC') {
                validSortDir = 'DESC';
            }
            const sortClause = sortCol ? `ORDER BY ${this.escapeId(sortCol)} ${validSortDir}` : '';

            // Get table data with pagination and sorting
            // Use __rowid__ alias to ensure unique property access and avoid collisions
            const dataResult = db.exec(`SELECT rowid as __rowid__, * FROM ${this.escapeId(tableName)} ${sortClause} LIMIT ${size} OFFSET ${offset}`);

            // Get row count
            const countResult = db.exec(`SELECT COUNT(*) as count FROM ${this.escapeId(tableName)}`);
            const rowCount = countResult.length > 0 ? countResult[0].values[0][0] as number : 0;
            const totalPages = Math.ceil(rowCount / size);

            console.log(`[DB Viewer] Table ${tableName}: ${rowCount} total rows, ${schema.length} columns, page ${p}/${totalPages}`);

            // Convert sql.js result format to JSON objects
            let data: TableRow[] = [];
            if (dataResult.length > 0) {
                const columns = dataResult[0].columns;
                const values = dataResult[0].values;

                values.forEach(row => {
                    const obj: any = {};
                    columns.forEach((col, index) => {
                        obj[col] = row[index];
                    });
                    data.push(obj);
                });
            }
            
            // Process BLOBs
            data = this.processDataForWebview(data);

            webview.postMessage({
                type: 'tableData',
                tableName: tableName,
                schema: schema,
                data: data,
                rowCount: rowCount,
                page: p,
                pageSize: size,
                totalPages: totalPages
            });

        } catch (error) {
            console.error(`[DB Viewer] Error loading table ${tableName}:`, error);
            webview.postMessage({
                type: 'error',
                message: `Failed to load table data: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private async searchTableData(document: SqliteDocument, tableName: string, searchTerm: string, webview: vscode.Webview, page: number = 1, pageSize: number = 100) {
        try {
            console.log(`[DB Viewer] Searching table: ${tableName} for "${searchTerm}" (page ${page}, size ${pageSize})`);
            const db = document.db;

            // Get table schema (use double quotes to escape table names)
            const schemaResult = db.exec(`PRAGMA table_info(${this.escapeId(tableName)})`);
            const schema = schemaResult.length > 0 ? schemaResult[0].values : [];

            // Construct WHERE clause
            // Escape single quotes in search term to prevent SQL errors
            const safeSearchTerm = searchTerm.replace(/'/g, "''");
            const columns = schema.map((col: any) => col[1]); // col[1] is name
            const whereClause = columns.map((col: any) => `${this.escapeId(col)} LIKE '%${safeSearchTerm}%'`).join(' OR ');
            
            // Get row count
            const countQuery = `SELECT COUNT(*) as count FROM ${this.escapeId(tableName)} WHERE ${whereClause}`;
            const countResult = db.exec(countQuery);
            const rowCount = countResult.length > 0 ? countResult[0].values[0][0] as number : 0;

            // Calculate pagination
            const p = Math.max(1, parseInt(String(page)) || 1);
            const size = Math.max(1, parseInt(String(pageSize)) || 100);
            const offset = (p - 1) * size;
            const totalPages = Math.ceil(rowCount / size);

            // Get table data with pagination
            const dataQuery = `SELECT rowid as __rowid__, * FROM ${this.escapeId(tableName)} WHERE ${whereClause} LIMIT ${size} OFFSET ${offset}`;
            const dataResult = db.exec(dataQuery);

            console.log(`[DB Viewer] Search found ${rowCount} rows, page ${p}/${totalPages}`);

            // Convert sql.js result format to JSON objects
            let data: TableRow[] = [];
            if (dataResult.length > 0) {
                const columns = dataResult[0].columns;
                const values = dataResult[0].values;

                values.forEach(row => {
                    const obj: any = {};
                    columns.forEach((col, index) => {
                        obj[col] = row[index];
                    });
                    data.push(obj);
                });
            }
            
            // Process BLOBs
            data = this.processDataForWebview(data);

            webview.postMessage({
                type: 'tableData',
                tableName: tableName,
                schema: schema,
                data: data,
                rowCount: rowCount,
                page: p,
                pageSize: size,
                totalPages: totalPages
            });

        } catch (error) {
            console.error(`[DB Viewer] Error searching table ${tableName}:`, error);
            webview.postMessage({
                type: 'error',
                message: `Failed to search table data: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
    
    private async executeCustomQuery(document: SqliteDocument, query: string, webview: vscode.Webview) {
        try {
            console.log(`[DB Viewer] Executing custom query: ${query}`);
            const db = document.db;

            // Execute the query
            const result = db.exec(query);

            // Convert results to JSON format
            let data: TableRow[] = [];
            if (result.length > 0) {
                const columns = result[0].columns;
                const values = result[0].values;

                values.forEach(row => {
                    const obj: any = {};
                    columns.forEach((col, index) => {
                        obj[col] = row[index];
                    });
                    data.push(obj);
                });
            }
            
            // Process BLOBs
            data = this.processDataForWebview(data);

            webview.postMessage({
                type: 'queryResult',
                data: data,
                rowCount: data.length,
                success: true
            });

        } catch (error) {
            console.error(`[DB Viewer] Error executing query:`, error);
            webview.postMessage({
                type: 'queryResult',
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        try {
            // Try to load from dist/webview/index.html first (production/bundled)
            const distHtmlPath = vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'index.html');
            let htmlArray: Uint8Array;
            
            try {
                htmlArray = await vscode.workspace.fs.readFile(distHtmlPath);
            } catch (e) {
                // Fallback to src/webview/index.html (dev environment)
                const srcHtmlPath = vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'index.html');
                htmlArray = await vscode.workspace.fs.readFile(srcHtmlPath);
            }

            return Buffer.from(htmlArray).toString('utf-8');
        } catch (error) {
            console.error('Error loading webview HTML:', error);
            return `<!DOCTYPE html>
            <html>
                <body>
                    <h1>Error loading Database Viewer</h1>
                    <p>${error instanceof Error ? error.message : String(error)}</p>
                </body>
            </html>`;
        }
    }
}
