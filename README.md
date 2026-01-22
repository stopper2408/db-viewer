# DB Viewer

**A beautiful, intuitive SQLite database viewer built right into Visual Studio Code**

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 📌 About This Version

This is a community-maintained fork of the original [DB Viewer](https://github.com/thedatascientiist/db-viewer) extension created by **Mujeeb ur Rehman**. The original repository no longer seems to be active, so this version has been published to ensure the extension continues to be available, compatible with modern VS Code versions, and maintained with bug fixes and improvements. We are grateful to the original author for their work.

*Your all-in-one solution for exploring SQLite databases without leaving VS Code.*

---

## Preview

![DB Viewer Interface](https://raw.githubusercontent.com/stopper2408/db-viewer/master/view.png)

## Why DB Viewer?

Tired of switching between VS Code and external database tools? **DB Viewer** brings the power of SQLite database exploration directly into your favorite editor. With a beautiful, native interface that feels like part of VS Code itself, you can instantly inspect and understand your database structure and data.

## ✨ Features

### 🎨 Beautiful & Intuitive Interface
- **Smart Table Navigation** - Clean sidebar with all tables and row counts
- **Real-time Search** - Filter tables instantly by name
- **Row Count Badges** - See table sizes at a glance
- **Smooth Animations** - Delightful transitions and loading states

### 🔍 Advanced Data Exploration
- **Sortable Columns** - Click any column header to sort (ascending/descending)
- **Data Filtering** - Real-time search across all columns
- **Cell Preview** - Click any cell to view full content
- **Copy Cell Values** - One-click copy of any data cell
- **Pagination Controls** - Navigate large tables with customizable page sizes (50/100/200/500 rows)
- **Responsive Table View** - Horizontal scrolling for wide tables
- **Data Type Color Coding** - Visual distinction for numbers, strings, NULL values

### 💾 Export Capabilities
- **CSV Export** - Download table data as CSV with one click
- **JSON Export** - Export data in JSON format for APIs or scripts
- **Copy All Data** - Copy entire table to clipboard

### 🚀 SQL Query Editor
- **Custom Queries** - Run any SQL query on your database
- **Collapsible Panel** - Built-in query editor
- **Query Results** - View results in the same beautiful table format
- **Safe Read-Only** - All queries are read-only for data safety

### ⌨️ Keyboard Shortcuts
- `Ctrl+R` or `F5` - Refresh current table
- `Ctrl+F` - Focus search input
- `Ctrl+Shift+C` - Copy all table data

### 🎯 Native VS Code Experience
- Seamless integration with VS Code themes
- Responsive design that adapts to your workspace
- Auto dark mode support
- Professional Microsoft Blue color scheme

## 🚀 Quick Start

Getting started takes seconds:

1. **Locate your database file** in VS Code's Explorer
2. **Click on any SQLite database file** (`.db`, `.sqlite`, `.sqlite3`, etc.)
3. **The database opens automatically** in the beautiful viewer

That's it! Your database will open in an interactive viewer.

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to **Extensions** (`Ctrl+Shift+X`)
3. Search for **"DB Viewer"**
4. Click **Install**

### From Command Line

```bash
code --install-extension MJStudio.db-viewer
```

## 🎯 Supported File Types

| Extension | Description |
|-----------|-------------|
| `.db` | SQLite Database |
| `.sqlite` | SQLite Database |
| `.sqlite3` | SQLite 3 Database |
| `.db3` | SQLite 3 Database |
| `.s3db` | SQLite 3 Database |
| `.sl3` | SQLite 3 Database |
| `.sdb` | SQLite Database |
| `.sqlitedb` | SQLite Database |

## 📖 Usage Guide

### Opening Databases

- **Click File** - Simply click any supported database file to open it
- **Right-Click** - Right-click file → "Open with Database Viewer"
- **Command Palette** - `Ctrl+Shift+P` → "Open Database"

### Exploring Your Data

1. **Browse Tables** - See all tables in the left sidebar with row counts
2. **View Data** - Click any table to view its contents
3. **Sort & Filter** - Click column headers to sort, use search to filter
4. **Copy Data** - Click any cell to copy its value
5. **Export** - Use export buttons for CSV or JSON downloads
6. **Run Queries** - Open SQL editor panel to run custom queries

### Interface Overview

```
┌─────────────────────────────────────────────────┐
│  Tables Sidebar    │    Main Data Viewer        │
│  ─────────────     │    ─────────────────       │
│  🔍 Search         │    Filter: [________]      │
│                    │                            │
│  📊 users (1,243)  │    ┌─────┬─────┬──────┐   │
│  📊 posts (892)    │    │ id  │name │email │   │
│  📊 comments (...)  │    ├─────┼─────┼──────┤   │
│                    │    │  1  │John │...   │   │
│                    │    │  2  │Jane │...   │   │
│                    │    └─────┴─────┴──────┘   │
│                    │                            │
│                    │    [Prev] Page 1/10 [Next] │
└─────────────────────────────────────────────────┘
```

## 🎨 Performance & Optimization

DB Viewer is optimized for smooth performance:

| Feature | Capability |
|---------|------------|
| **Pagination** | 50-500 rows per page |
| **Sorting** | All columns, instant sorting |
| **Filtering** | Real-time search with instant results |
| **Export** | Full table export in CSV/JSON |
| **SQL Queries** | Full SELECT query support |
| **Responsive** | Handles wide tables with horizontal scroll |

## 🔧 Troubleshooting

### Database won't open
- Verify file is a valid SQLite database
- Check file permissions
- Try reloading VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

### Tables appear empty
- Verify table contains data using SQLite CLI
- Check database isn't corrupted
- Try refreshing with `Ctrl+R`

### UI looks broken
- Reload VS Code window
- Check for extension updates
- Try switching VS Code theme

## 🆕 What's New in v1.0.2

- ✅ **Copy Cell Functionality** - Click any cell to copy value
- ✅ **Copy All Data** - Copy entire table to clipboard
- ✅ **Refresh Button** - Reload table data with one click
- ✅ **Responsive Tables** - Better handling of wide tables
- ✅ **Improved Copy Button** - Cleaner, more professional tooltip
- ✅ **Data Type Color Coding** - Visual distinction for different data types
- ✅ **Keyboard Shortcuts** - Quick access to common actions
- ✅ **Table Alignment** - Perfect alignment between header and data

## 📝 Changelog

### Version 1.0.2 (Latest)
- Added cell copy functionality
- Added copy all data feature
- Added refresh button
- Improved responsive table design
- Enhanced copy button styling
- Added data type color coding
- Added keyboard shortcuts

### Version 1.0.1
- SQL Query Interface
- CSV & JSON Export
- Data Filtering & Sorting
- Pagination support
- Table search in sidebar

### Version 1.0.0
- Initial release
- Basic SQLite viewer
- Table browsing
- Data display

## 🛣️ Roadmap

- [ ] Schema visualization with ER diagrams
- [ ] Query history and saved queries
- [ ] Advanced column-specific filters
- [ ] Binary data preview (images)
- [ ] Multiple table tabs
- [ ] Query templates and snippets
- [ ] Database statistics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Support

If you find this extension helpful:
- ⭐ Rate it on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MJStudio.db-viewer)
- 🐛 Report bugs on [GitHub Issues](https://github.com/stopper2408/db-viewer/issues)
- 💡 Suggest features on [GitHub Discussions](https://github.com/stopper2408/db-viewer/discussions)

---

**Maintained by [stopper2408](https://github.com/stopper2408)**

*Originally created with ❤️ by [Mujeeb ur Rehman](https://github.com/thedatascientiist)*

*Making database exploration beautiful and accessible*

