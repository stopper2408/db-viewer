# 🗄️ DB Viewer Enhanced

**The Ultimate SQLite Database Explorer for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.6-blue.svg)](https://marketplace.visualstudio.com/items?itemName=community-dev.db-viewer-enhanced)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/Built%20for-VS%20Code-007ACC.svg)](https://code.visualstudio.com/)

---

## 🚀 Overview

**DB Viewer Enhanced** is a powerful community-maintained extension that brings a full-featured SQLite database manager directly into Visual Studio Code. 

Whether you are debugging a local application, analyzing data, or just need to quickly peek into a `.db` file, this extension provides a beautiful, native-feeling interface to explore your data without ever leaving your editor.

> **Note:** This is an enhanced fork of the original DB Viewer, updated for modern VS Code compatibility, improved performance, and new features.

---

## ✨ Key Features

### 📊 Interactive Data Explorer
*   **Smart Table Navigation**: Quickly switch between tables using the sidebar with real-time row counts.
*   **Sorting & Filtering**: Click headers to sort columns and use the search bar to filter data instantly.
*   **Pagination**: Efficiently handle large datasets with customizable page sizes (50, 100, 200, 500 rows).
*   **Cell Inspection**: Click any cell to view deep content, ideal for examining large text blobs or JSON data.

### 🛠️ Data Management Tools
*   **SQL Query Editor**: Run custom SQL queries in a built-in editor with syntax highlighting.
*   **Export Options**: Export table data or query results to **CSV** or **JSON** for use in other applications.
*   **Copy Support**: One-click copy for individual cells or entire tables.

### 🎨 Seamless Integration
*   **Native Look & Feel**: Designed to match your VS Code theme (Dark/Light mode supported).
*   **Read-Only Safety**: By default, the viewer opens in a safe mode to prevent accidental data modification.
*   **Responsive Design**: Smooth scrolling and responsive layouts for wide tables.

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
2.  Simply **click** on the file to open it in the DB Viewer.
3.  Alternatively, right-click the file and select **"Open With..."** -> **"DB Viewer Enhanced"**.

### Running SQL Queries
1.  Open the **"Execute SQL"** panel at the top of the viewer.
2.  Type your SQL query (e.g., `SELECT * FROM users WHERE active = 1`).
3.  Click **Run Query** to see the results in the table view.

### Exporting Data
1.  Navigate to the table or query result you want to save.
2.  Click the **Export CSV** or **Export JSON** buttons in the toolbar.
3.  Choose a location to save your file.

---

## ⌨️ Development & Contributing

We welcome contributions! If you want to run the extension locally or contribute to the code:

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

---

## 🙏 Acknowledgements

*   Original work by [Mujeeb ur Rehman](https://github.com/thedatascientiist).
*   Powered by [sql.js](https://github.com/sql-js/sql.js).

