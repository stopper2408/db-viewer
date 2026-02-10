# 🗄️ DB Viewer Enhanced

**The Ultimate SQLite Database Explorer for VS Code**

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=community-dev.db-viewer-enhanced)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/Built%20for-VS%20Code-007ACC.svg)](https://code.visualstudio.com/)

---

## 🚀 Overview

**DB Viewer Enhanced** is a powerful community-maintained extension that brings a full-featured SQLite database manager directly into Visual Studio Code. 

It transforms your editor into a comprehensive data studio. Whether you are debugging a local application, analyzing complex datasets, or visualizing statistics, this extension provides a native, high-performance interface to explore and modify your data without ever leaving your editor.

> **Note:** This is an enhanced fork of the original DB Viewer, featuring direct data editing, advanced charting capabilities, and polished UI improvements.

---

## ✨ Key Features

### ✏️ Data Editing & Management
*   **Direct Cell Editing**: Double-click any cell to edit its value physically in the database file.
*   **Schema Inspection**: View detailed table structures including column types, default values, and primary keys.
*   **Safe Writes**: Changes are written securely to the disk, ensuring data integrity.

### 📈 Advanced Data Visualization
*   **Instant Charting**: Turn your table data into beautiful visualizations with a single click.
*   **Multiple Chart Types**: Support for **Bar**, **Line**, **Pie**, **Doughnut**, and **Scatter** charts.
*   **Smart Aggregation**: Automatically group and sum data (e.g., "Sales by Region") or plot raw values.
*   **Export Charts**: Save your visualizations as transparent PNG images.
*   **Theme Integration**: Charts automatically adapt to your VS Code theme (Dark/Light) or can use custom color palettes like "Ocean" or "Warm".

### 📊 Interactive Data Explorer
*   **Smart Table Navigation**: Sidebar with real-time row counts for all tables.
*   **Server-Side Filtering**: Use the search bar to filter thousands of rows instantly.
*   **Pagination**: Efficiently handle large datasets with customizable page sizes (50 to 1000 rows).
*   **Cell Inspection**: Single-click to copy, view detailed content for large text/JSON blobs.

### 🛠️ Query & Export Tools
*   **SQL Query Editor**: Run custom SQL queries with a history-aware editor.
*   **Export Options**: Export entire tables or query results to **CSV** or **JSON**.
*   **Clipboard Support**: Shortcuts to copy single cells or the entire visible dataset (`Ctrl+Shift+C`).

---

## 📂 Supported File Formats

DB Viewer automatically detects and handles a wide range of SQLite file extensions:

| Extension | Description |
| :--- | :--- |
| `.db` | Generic Database File |
| `.sqlite` | SQLite Database |
| `.sqlite3` | SQLite 3 Database |
| `.db3` | Database File v3 |
| `.s3db` | SQLite 3 Database |
| `.sl3` | SQLite 3 Database |
| `.sdb` | Simple Database |
| `.sqlitedb`| SQLite Database |

---

## 📖 How to Use

### Opening a Database
1.  Locate your database file in the VS Code File Explorer.
2.  Click the file to open it in **DB Viewer Enhanced**.

### Editing Data
1.  **Double-click** any cell in the table view.
2.  Modify the content in the input field.
3.  Press **Enter** to save changes to disk, or **Esc** to cancel.

### Visualizing Data (Charting)
1.  Open a table with numeric data.
2.  Click the **Chart** button in the top toolbar.
3.  Select your **X Axis** (category) and **Y Axis** (value).
4.  Switch between **Raw Mode** (plot rows) or **Aggregate Mode** (sum values by category).

### Running SQL Queries
1.  Expand the **"SQL Query Editor"** panel at the top.
2.  Type your query (e.g., `SELECT * FROM sales WHERE amount > 100`).
3.  Click **Execute Query**. Results are displayed in the grid and can also be charted!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + R` / `F5` | Refresh current table data |
| `Ctrl + F` | Focus the search/filter input |
| `Ctrl + Shift + C` | Copy all visible data to clipboard |
| `Enter` (in edit mode) | Save cell value |
| `Esc` (in edit mode) | Cancel edit |

---

## ⌨️ Development & Contributing

We welcome contributions!

1.  **Clone the repository**
    ```bash
    git clone https://github.com/stopper2408/db-viewer.git
    cd db-viewer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run in Debug Mode**
    *   Press `F5` in VS Code to launch the Extension Development Host.

4.  **Build**
    ```bash
    npm run compile
    ```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

