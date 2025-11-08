# db-viewer README

This is the README for your extension "db-viewer". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

# SQLite Database Viewer

A Visual Studio Code extension that allows you to view and explore SQLite database files (`.db`, `.sqlite`, `.sqlite3`) directly in the editor with a beautiful, intuitive table interface.

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher-name.db-viewer)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/your-publisher-name.db-viewer)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/your-publisher-name.db-viewer)

## ✨ Features

- 📊 **Visual Database Explorer** - View database contents in an easy-to-read table format
- 🗂️ **Multiple Table Support** - Sidebar navigation to quickly switch between tables
- 📈 **Schema Information** - View table structures including column names and types
- 🎨 **Theme Integration** - Automatically matches your VS Code theme (light/dark)
- 🔍 **Read-Only Access** - Safely view database contents without accidental modifications
- ⚡ **Performance Optimized** - Efficiently handles large databases (displays first 1000 rows)
- 🚀 **Pure JavaScript** - No external database drivers required

## 🚀 Usage

### Opening Database Files

There are three ways to open a database file:

1. **Direct Click**: Simply click on any `.db`, `.sqlite`, or `.sqlite3` file in the Explorer
2. **Command Palette**: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac), type "Open Database" and press Enter
3. **Right-click Menu**: Right-click on a database file → "Open With..." → "Database Viewer"

### Exploring Your Database

- **Left Sidebar**: Lists all available tables in the database
- **Click a Table**: View its contents in the main panel
- **Table Information**: See row count, column count, and column names
- **Scroll**: Navigate through your data with smooth scrolling
- **Sticky Headers**: Column headers stay visible while scrolling

## 📋 Supported File Types

- `.db` - SQLite database files
- `.sqlite` - SQLite database files  
- `.sqlite3` - SQLite database files

## 📦 Requirements

- Visual Studio Code version 1.105.0 or higher

## ⚙️ Extension Settings

This extension works out of the box with no configuration required.

## ⚠️ Known Limitations

- Displays up to 1000 rows per table (for performance)
- Read-only mode only (no editing capabilities)
- Supports SQLite databases only (no MySQL, PostgreSQL, etc.)

## 🗺️ Roadmap

Future features planned:
- Export table data to CSV/JSON
- Search and filter capabilities
- SQL query execution
- Data editing support
- Support for encrypted databases

## 📝 Release Notes

### 1.0.0

Initial release:
- Custom editor for SQLite database files
- Table listing sidebar
- Interactive table viewer with data grid
- Schema information and row counts
- Full VS Code theme integration
- Support for .db, .sqlite, and .sqlite3 files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This extension is licensed under the [MIT License](LICENSE).

## 🐛 Issues & Feedback

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/your-username/db-viewer/issues).

---

**Enjoy exploring your databases!** ⭐

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
