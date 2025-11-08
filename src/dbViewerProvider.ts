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
        /* Base Variables and Reset for VS Code Integration */
        :root {
            /* Map VS Code Theme colors to design variables */
            --primary: var(--vscode-editorActiveTab-activeBackground); 
            --primary-dark: var(--vscode-list-activeSelectionBackground);
            --secondary-button-color: var(--vscode-button-background);
            --secondary-button-hover: var(--vscode-button-hoverBackground);
            --accent: var(--vscode-errorForeground);
            --light: var(--vscode-editor-background);
            --dark: var(--vscode-foreground);
            --gray: var(--vscode-descriptionForeground);
            --border-color: var(--vscode-panel-border);
            --sidebar-bg: var(--vscode-sideBar-background);
            
            /* Dedicated variable for the table header background */
            --table-header-bg: var(--vscode-terminal-ansiBrightBlue, #4C6A9E); 
            --sidebar-padding: 15px; /* Define a consistent padding value */
            --item-spacing: 4px; /* Define spacing between non-active list items */

            --border-radius: 8px; 
            --transition: all 0.2s ease;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            --shadow-hover: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            margin: 0;
            padding: 15px; 
            background-color: var(--vscode-editor-background); 
            color: var(--dark);
            min-height: 100vh;
            overflow: hidden; 
            display: flex;
        }

        .layout {
            display: flex;
            gap: 20px;
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            flex: 1;
            overflow: hidden;
        }
        
        /* --- Sidebar (Table Selector) --- */
        .sidebar {
            width: 220px; 
            /* FIXED: Removed horizontal padding to allow links to span full width */
            padding: var(--sidebar-padding) 0; 
            background: var(--sidebar-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            flex-shrink: 0;
            overflow-y: auto;
            max-height: calc(100vh - 30px);
        }
        
        .sidebar-header {
            display: flex;
            align-items: center;
            gap: 10px;
            /* Added horizontal padding here */
            padding: 0 var(--sidebar-padding) 8px var(--sidebar-padding); 
            margin-bottom: 10px; 
            border-bottom: 1px solid var(--border-color);
        }
        
        .sidebar h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--dark);
        }
        
        .sidebar ul {
            list-style: none;
            padding: 0; 
            /* Adjusted margin to bring list closer to header */
            margin: 5px 0 0 0; 
        }
        
        .sidebar ul li {
            /* KEY FIX: Removed all vertical margin on the LI element */
            margin-bottom: 0; 
            border-radius: 0; 
            overflow: visible; 
        }
        
        .table-item-link {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: var(--dark);
            font-size: 13px;
            padding: 10px 12px;
            transition: var(--transition);
            cursor: pointer;
            border-radius: 6px; 
            /* Added margin here to provide vertical separation between *non-active* items */
            margin: var(--item-spacing) var(--sidebar-padding) 0 var(--sidebar-padding); 
        }
        
        .table-item-link i {
            width: 18px;
            text-align: center;
            color: var(--gray);
            font-size: 14px;
        }
        
        .table-item-link:hover {
            background-color: var(--vscode-list-hoverBackground);
            color: var(--dark);
        }
        
        .table-item-link.active {
            background-color: var(--primary); 
            color: white;
            font-weight: 500;
            /* FINAL FIX: Remove all margins to sit flush against surrounding elements */
            margin: 0; 
            /* Set padding to match header indentation */
            padding: 10px var(--sidebar-padding); 
            border-radius: 0; 
        }
        
        .table-item-link.active i {
            color: white;
            margin-left: 0; 
        }
        
        /* Active selection indicator */
        .table-item-link .selection-arrow {
            display: none;
            margin-right: 5px;
            font-weight: 700;
            font-size: 15px;
            width: 10px;
        }

        .table-item-link.active .selection-arrow {
            display: inline-block;
        }


        /* --- Main Content Area --- */
        .container {
            flex: 1;
            background: var(--light);
            padding: 25px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
        }
        
        h1 {
            margin: 0;
            font-weight: 700;
            font-size: 24px;
            color: var(--dark);
        }

        h1.table-name-heading {
            background: linear-gradient(135deg, var(--vscode-terminal-ansiBrightBlue), var(--vscode-terminal-ansiCyan));
            color: white; 
            -webkit-background-clip: text;
            -webkit-text-fill-color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5); 
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-button {
            padding: 10px 18px;
            background-color: var(--secondary-button-color); 
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .action-button.secondary {
            background-color: transparent;
            color: var(--secondary-button-color);
            border: 1px solid var(--secondary-button-color);
        }
        
        .action-button:hover {
            background-color: var(--secondary-button-hover);
            transform: translateY(-1px);
        }

        .action-button.secondary:hover {
            background-color: rgba(127, 92, 255, 0.1); 
            border-color: var(--secondary-button-hover);
            color: var(--secondary-button-hover);
            transform: translateY(-1px);
        }
        
        /* --- Table View --- */
        .data-panel {
            flex: 1;
            overflow-y: auto;
            border-radius: 6px;
        }

        .table-info-bar {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
        }

        .table-stats {
            color: var(--gray);
            font-size: 12px;
            font-style: italic;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            min-width: 100%;
        }
        
        th, td {
            padding: 14px 16px; 
            text-align: left;
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        th {
            background-color: var(--table-header-bg); 
            color: white; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            border-bottom: none; 
            position: sticky;
            top: 0;
            z-index: 5;
        }
        
        /* Zebra Striping */
        tr:nth-child(even) {
            background-color: var(--vscode-list-hoverBackground);
        }

        tr:nth-child(odd) {
            background-color: var(--light);
        }
        
        tr:hover {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        td {
            border-bottom: 1px solid var(--border-color);
            font-size: 13px;
        }
        
        tr:last-child td {
            border-bottom: none; 
        }

        /* Highlight NULL values */
        td[data-value="NULL"] { 
            color: var(--vscode-editorUnnecessary-foreground); 
            font-style: italic; 
        }
        
        .placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--gray);
            font-size: 14px;
            text-align: center;
        }

        .error {
            padding: 10px;
            background-color: var(--vscode-errorBackground);
            border: 1px solid var(--vscode-errorForeground);
            border-radius: 4px;
            color: var(--vscode-errorForeground);
            margin-bottom: 15px;
        }

        /* --- Modal (Schema View) --- */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 100;
        }

        .modal-content {
            background-color: var(--light);
            padding: 25px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .modal-header h2 {
            font-size: 18px;
            font-weight: 600;
        }

        .close-button {
            background: none;
            border: none;
            color: var(--dark);
            font-size: 24px;
            cursor: pointer;
            padding: 0 5px;
            line-height: 1;
        }

        .schema-table {
            width: 100%;
            border-collapse: collapse;
        }

        .schema-table th, .schema-table td {
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            text-align: left;
            font-size: 13px;
        }
        .schema-table th {
            background-color: var(--vscode-sideBarSectionHeader-background);
            font-weight: 600;
            text-transform: uppercase;
        }

    </style>
</head>
<body>
    <div class="layout">
        <div class="sidebar">
            <div class="sidebar-header">
                <i class="fas fa-database"></i>
                <h3>Tables</h3>
            </div>
            <ul id="tableList">
                <li><a class="table-item-link"><i class="fas fa-spinner fa-spin"></i> Loading tables...</a></li>
            </ul>
        </div>

        <div class="container">
            <div class="header">
                <h1 id="mainHeading">Database Viewer</h1>
                <div class="header-actions">
                    <button id="viewSchemaButton" class="action-button secondary" style="display:none;" onclick="openSchemaModal()">
                        <i class="fas fa-info-circle"></i> View Schema
                    </button>
                    <button class="action-button" disabled>
                        <i class="fas fa-redo"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div id="errorContainer"></div>

            <div class="data-panel" id="tableContent">
                <div class="placeholder">
                    <p>Select a table from the sidebar to view its contents.</p>
                </div>
            </div>
        </div>
    </div>

    <div id="schemaModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTableName">Table Schema</h2>
                <button class="close-button" onclick="closeSchemaModal()">&times;</button>
            </div>
            <div id="schemaTableContainer">
                </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTable = null;
        let currentSchema = []; 
        const mainHeading = document.getElementById('mainHeading');

        // --- Message Handling from Extension ---
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'databaseLoaded':
                    displayTables(message.tables);
                    break;
                case 'tableData':
                    currentSchema = message.schema; 
                    displayTableData(message.tableName, message.schema, message.data, message.rowCount);
                    break;
                case 'error':
                    showError(message.message);
                    break;
            }
        });

        // --- Sidebar Functionality ---
        function displayTables(tables) {
            const tableList = document.getElementById('tableList');
            tableList.innerHTML = '';
            
            if (tables.length === 0) {
                tableList.innerHTML = '<li><a class="table-item-link"><i class="fas fa-exclamation-circle"></i> No tables found</a></li>';
                return;
            }

            tables.forEach(tableName => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'table-item-link';
                // Add the arrow span here
                link.innerHTML = \`<span class="selection-arrow">></span><i class="fas fa-table"></i> \${escapeHtml(tableName)}\`; 
                link.onclick = (e) => {
                    e.preventDefault();
                    selectTable(tableName, link);
                };
                li.appendChild(link);
                tableList.appendChild(li);
            });
        }

        function selectTable(tableName, element) {
            document.querySelectorAll('.table-item-link').forEach(item => {
                item.classList.remove('active');
            });
            
            element.classList.add('active');
            
            currentTable = tableName;
            document.getElementById('viewSchemaButton').style.display = 'none'; // Hide button while loading
            
            // Set the main heading to the table name and apply the custom style
            mainHeading.textContent = escapeHtml(tableName);
            mainHeading.classList.add('table-name-heading'); 

            vscode.postMessage({
                type: 'getTableData',
                tableName: tableName
            });

            // Show loading state
            const tableContent = document.getElementById('tableContent');
            tableContent.innerHTML = \`
                <div class="placeholder">
                    <i class="fas fa-sync fa-spin" style="margin-right: 10px;"></i>
                    <span>Loading data for **\${escapeHtml(tableName)}**...</span>
                </div>\`;
            document.getElementById('errorContainer').innerHTML = '';
        }

        // --- Table View Functionality ---
        function displayTableData(tableName, schema, data, rowCount) {
            const tableContent = document.getElementById('tableContent');
            document.getElementById('viewSchemaButton').style.display = 'flex'; // Show button
            
            if (data.length === 0) {
                let emptyMessage = rowCount > 0 
                    ? 'Table data could not be loaded or is filtered.'
                    : 'The table is empty. No rows found.';
                tableContent.innerHTML = \`<div class="placeholder"><p>\${emptyMessage}</p></div>\`;
                return;
            }

            // Table Info Bar (Stats only)
            const infoBarHtml = \`
                <div class="table-info-bar">
                    <span></span> 
                    <span class="table-stats">
                        \${rowCount} rows (\${data.length} shown) | \${schema.length} columns
                        \${rowCount > 1000 ? ' (Showing first 1000 rows)' : ''}
                    </span>
                </div>
            \`;

            // Table Data Grid
            const columns = Object.keys(data[0]);
            const tableGridHtml = \`
                <table>
                    <thead>
                        <tr>
                            \${columns.map(col => \`<th>\${escapeHtml(col)}</th>\`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        \${data.map(row => \`
                            <tr>
                                \${columns.map(col => \`<td data-value="\${formatValue(row[col])}">\${escapeHtml(formatValue(row[col]))}</td>\`).join('')}
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;

            // Combine and render
            tableContent.innerHTML = infoBarHtml + tableGridHtml;
        }

        // --- Schema Modal, Utility Functions (omitted for brevity, remain unchanged) ---
        function openSchemaModal() {
            if (!currentTable || currentSchema.length === 0) {
                showError('Could not load schema data for the selected table.');
                return;
            }
            document.getElementById('modalTableName').textContent = \`Schema for: \${currentTable}\`;
            const schemaContainer = document.getElementById('schemaTableContainer');
            // PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
            const schemaHtml = \`
                <table class="schema-table">
                    <thead>
                        <tr>
                            <th>CID</th><th>Name</th><th>Type</th><th>Not Null</th><th>Default</th><th>PK</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${currentSchema.map(col => \`
                            <tr>
                                <td>\${col[0]}</td><td>\${escapeHtml(col[1])}</td><td>\${escapeHtml(col[2])}</td>
                                <td>\${col[3] == 1 ? 'YES' : 'NO'}</td><td>\${formatValue(col[4])}</td><td>\${col[5] == 1 ? 'KEY' : ''}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
            schemaContainer.innerHTML = schemaHtml;
            document.getElementById('schemaModal').style.display = 'flex';
        }

        function closeSchemaModal() {
            document.getElementById('schemaModal').style.display = 'none';
        }

        function formatValue(value) {
            if (value === null || value === undefined) { return 'NULL'; }
            if (typeof value === 'object') { try { return JSON.stringify(value); } catch { return '[Object]'; } }
            return String(value);
        }

        function escapeHtml(text) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        function showError(message) {
            const errorContainer = document.getElementById('errorContainer');
            errorContainer.innerHTML = \`<div class="error"><strong>Error:</strong> \${escapeHtml(message)}</div>\`;
            document.getElementById('tableContent').innerHTML = '<div class="placeholder">An error occurred. Please check the extension logs.</div>';
        }
    </script>
</body>
</html>`;
}
}