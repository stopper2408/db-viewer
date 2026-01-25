const fs = require('fs');
const initSqlJs = require('sql.js');

async function main() {
    try {
        const SQL = await initSqlJs();
        const db = new SQL.Database();

        console.log('Generating feature_test.db...');

        // 1. PAGINATION & SORTING DATA
        // Creates 150 rows. Page size is usually 100, so this forces a second page.
        console.log('- Creating "LargeTable" (150 rows)...');
        db.run("CREATE TABLE LargeTable (id INTEGER PRIMARY KEY, name TEXT, score INTEGER, category TEXT)");
        db.run("BEGIN TRANSACTION");
        for (let i = 1; i <= 150; i++) {
            const category = i % 3 === 0 ? 'A' : (i % 3 === 1 ? 'B' : 'C');
            const score = Math.floor(Math.random() * 1000);
            db.run("INSERT INTO LargeTable VALUES (?, ?, ?, ?)", [i, `Item ${i}`, score, category]);
        }
        db.run("COMMIT");

        // 2. SEARCH DATA
        // Creating specific strings to search for.
        console.log('- Creating "SearchableTable"...');
        db.run("CREATE TABLE SearchableTable (id INTEGER, description TEXT, notes TEXT)");
        db.run("INSERT INTO SearchableTable VALUES (1, 'Apple Device', 'First item')");
        db.run("INSERT INTO SearchableTable VALUES (2, 'Banana Fruit', 'Yellow and sweet')");
        db.run("INSERT INTO SearchableTable VALUES (3, 'Cherry Pie', 'Dessert item')");
        db.run("INSERT INTO SearchableTable VALUES (4, 'Date Fruit', 'Sweet dried fruit')");

        // 3. ESCAPING & COMPLEX NAMES
        // Tests the fix for "User "Data"" and columns with quotes
        console.log('- Creating "ComplexNames" tables...');
        const crazyTable = 'User "Data"';
        const escapedTable = '"' + crazyTable.replace(/"/g, '""') + '"';
        db.run(`CREATE TABLE ${escapedTable} (id INTEGER, "Col ""Name""" TEXT)`);
        db.run(`INSERT INTO ${escapedTable} VALUES (1, 'Success!')`);

        // 4. TYPES
        db.run("CREATE TABLE TypesTest (t_int INTEGER, t_real REAL, t_text TEXT, t_blob BLOB)");
        db.run("INSERT INTO TypesTest VALUES (1, 1.1, 'One', NULL)");
        db.run("INSERT INTO TypesTest VALUES (2, 2.22, 'Two', NULL)");

        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync('feature_test.db', buffer);
        
        console.log('✅ Created "feature_test.db"');

    } catch (e) {
        console.error('Error:', e);
    }
}

main();