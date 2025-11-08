// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DbViewerProvider } from './dbViewerProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('DB Viewer extension is now active!');

	// Register the custom editor provider for database files
	context.subscriptions.push(DbViewerProvider.register(context));

	// Register command to open database files
	const openDatabaseCommand = vscode.commands.registerCommand('db-viewer.openDatabase', async () => {
		const files = await vscode.window.showOpenDialog({
			canSelectMany: false,
			openLabel: 'Open Database',
			filters: {
				'Database files': ['db', 'sqlite', 'sqlite3']
			}
		});

		if (files && files.length > 0) {
			await vscode.commands.executeCommand('vscode.openWith', files[0], 'db-viewer.dbViewer');
		}
	});

	context.subscriptions.push(openDatabaseCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
