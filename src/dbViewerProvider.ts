import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import initSqlJs, { Database } from 'sql.js';

export class DbViewerProvider implements vscode.CustomReadonlyEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new DbViewerProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            DbViewerProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                }
            }
        );
        return providerRegistration;
    }

    private static readonly viewType = 'db-viewer.dbViewer';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return {
            uri,
            dispose: () => { }
        };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        // Load database and send data to webview
        this.loadDatabase(document.uri, webviewPanel.webview);

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(
            async message => {
                switch (message.type) {
                    case 'getTableData':
                        await this.loadTableData(document.uri, message.tableName, webviewPanel.webview);
                        break;
                }
            }
        );
    }

    private async loadDatabase(uri: vscode.Uri, webview: vscode.Webview) {
        try {
            console.log(`[DB Viewer] Loading database: ${uri.fsPath}`);
            
            const SQL = await initSqlJs({
                locateFile: file => {
                    return path.join(__dirname, file);
                }
            });

            const buffer = fs.readFileSync(uri.fsPath);
            console.log(`[DB Viewer] File size: ${buffer.length} bytes`);
            
            const db = new SQL.Database(buffer);
            
            // Get all tables
            const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
            const tableNames: string[] = result.length > 0 ? result[0].values.map(row => row[0] as string) : [];

            console.log(`[DB Viewer] Found ${tableNames.length} tables: ${tableNames.join(', ')}`);
            
            db.close();

            webview.postMessage({
                type: 'databaseLoaded',
                tables: tableNames
            });

        } catch (error) {
            console.error('[DB Viewer] Error loading database:', error);
            webview.postMessage({
                type: 'error',
                message: `Failed to open database: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private async loadTableData(uri: vscode.Uri, tableName: string, webview: vscode.Webview) {
        try {
            console.log(`[DB Viewer] Loading table: ${tableName}`);
            
            const SQL = await initSqlJs({
                locateFile: file => {
                    return path.join(__dirname, file);
                }
            });

            const buffer = fs.readFileSync(uri.fsPath);
            const db = new SQL.Database(buffer);

            // Get table schema (use double quotes to escape table names)
            const schemaResult = db.exec(`PRAGMA table_info("${tableName}")`);
            const schema = schemaResult.length > 0 ? schemaResult[0].values : [];

            // Get table data (limit to 1000 rows for performance)
            const dataResult = db.exec(`SELECT * FROM "${tableName}" LIMIT 1000`);
            
            // Get row count
            const countResult = db.exec(`SELECT COUNT(*) as count FROM "${tableName}"`);
            const rowCount = countResult.length > 0 ? countResult[0].values[0][0] as number : 0;

            console.log(`[DB Viewer] Table ${tableName}: ${rowCount} total rows, ${schema.length} columns`);

            // Convert sql.js result format to JSON objects
            const data: any[] = [];
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

            db.close();

            webview.postMessage({
                type: 'tableData',
                tableName: tableName,
                schema: schema,
                data: data,
                rowCount: rowCount
            });

        } catch (error) {
            console.error(`[DB Viewer] Error loading table ${tableName}:`, error);
            webview.postMessage({
                type: 'error',
                message: `Failed to load table data: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 40px);
        }

        .header {
            margin-bottom: 20px;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }

        .content {
            display: flex;
            flex: 1;
            gap: 20px;
            overflow: hidden;
        }

        .sidebar {
            width: 250px;
            background-color: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .sidebar-header {
            padding: 12px 16px;
            background-color: var(--vscode-sideBarSectionHeader-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            font-weight: 600;
            font-size: 13px;
        }

        .table-list {
            list-style: none;
        }

        .table-item {
            padding: 8px 16px;
            cursor: pointer;
            transition: background-color 0.1s;
            font-size: 13px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .table-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .table-item.active {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .table-info {
            margin-bottom: 12px;
            padding: 12px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }

        .table-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .table-stats {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .table-container {
            flex: 1;
            overflow: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        thead {
            position: sticky;
            top: 0;
            background-color: var(--vscode-editor-background);
            z-index: 10;
        }

        th {
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid var(--vscode-panel-border);
            background-color: var(--vscode-editorGroupHeader-tabsBackground);
            white-space: nowrap;
        }

        td {
            padding: 8px 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        tbody tr:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--vscode-descriptionForeground);
            font-size: 14px;
        }

        .error {
            padding: 12px;
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
            color: var(--vscode-errorForeground);
            margin-bottom: 12px;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-activeBackground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Database Viewer</h1>
        </div>
        <div class="content">
            <div class="sidebar">
                <div class="sidebar-header">Tables</div>
                <ul class="table-list" id="tableList">
                    <li class="loading">Loading tables...</li>
                </ul>
            </div>
            <div class="main-content">
                <div id="errorContainer"></div>
                <div id="tableContent" class="placeholder">
                    Select a table from the sidebar to view its contents
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTable = null;

        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'databaseLoaded':
                    displayTables(message.tables);
                    break;
                case 'tableData':
                    displayTableData(message.tableName, message.schema, message.data, message.rowCount);
                    break;
                case 'error':
                    showError(message.message);
                    break;
            }
        });

        function displayTables(tables) {
            const tableList = document.getElementById('tableList');
            tableList.innerHTML = '';
            
            if (tables.length === 0) {
                tableList.innerHTML = '<li class="table-item">No tables found</li>';
                return;
            }

            tables.forEach(tableName => {
                const li = document.createElement('li');
                li.className = 'table-item';
                li.textContent = tableName;
                li.onclick = () => selectTable(tableName, li);
                tableList.appendChild(li);
            });
        }

        function selectTable(tableName, element) {
            // Remove active class from all items
            document.querySelectorAll('.table-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to selected item
            element.classList.add('active');
            
            currentTable = tableName;
            
            // Request table data from extension
            vscode.postMessage({
                type: 'getTableData',
                tableName: tableName
            });

            // Show loading state
            const tableContent = document.getElementById('tableContent');
            tableContent.innerHTML = '<div class="loading">Loading table data...</div>';
        }

        function displayTableData(tableName, schema, data, rowCount) {
            const tableContent = document.getElementById('tableContent');
            
            if (data.length === 0) {
                tableContent.innerHTML = '<div class="placeholder">Table is empty</div>';
                return;
            }

            // Create table info section
            const infoHtml = \`
                <div class="table-info">
                    <div class="table-name">\${tableName}</div>
                    <div class="table-stats">
                        \${rowCount} rows | \${schema.length} columns
                        \${rowCount > 1000 ? ' (showing first 1000 rows)' : ''}
                    </div>
                </div>
            \`;

            // Create table
            const columns = Object.keys(data[0]);
            const tableHtml = \`
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                \${columns.map(col => \`<th>\${escapeHtml(col)}</th>\`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            \${data.map(row => \`
                                <tr>
                                    \${columns.map(col => \`<td>\${escapeHtml(formatValue(row[col]))}</td>\`).join('')}
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
            \`;

            tableContent.innerHTML = infoHtml + tableHtml;
        }

        function formatValue(value) {
            if (value === null) {
                return 'NULL';
            }
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return String(value);
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        function showError(message) {
            const errorContainer = document.getElementById('errorContainer');
            errorContainer.innerHTML = \`
                <div class="error">
                    <strong>Error:</strong> \${escapeHtml(message)}
                </div>
            \`;
        }
    </script>
</body>
</html>`;
    }
}
