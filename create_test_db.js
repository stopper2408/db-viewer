const fs = require('fs');
const initSqlJs = require('sql.js');

async function main() {
    try {
        const SQL = await initSqlJs();
        const db = new SQL.Database();

        console.log('Generating test database with complex identifiers...');

        // 1. Table with double quotes in the name
        // This simulates the case: TABLE names User "Data"
        const tableWithQuotes = 'User "Data"';
        // We must escape it manually here to create it validly in the first place
        const escapedTableQuotes = '"' + tableWithQuotes.replace(/"/g, '""') + '"';
        
        db.run(`CREATE TABLE ${escapedTableQuotes} (id INTEGER PRIMARY KEY, name TEXT)`);
        db.run(`INSERT INTO ${escapedTableQuotes} (name) VALUES ('Test User 1')`);
        db.run(`INSERT INTO ${escapedTableQuotes} (name) VALUES ('Tes "ting" User')`);

        // 2. Table with SQL keywords and weird chars
        const tableWithKeywords = 'SELECT * FROM "Crazy"';
        const escapedTableKeywords = '"' + tableWithKeywords.replace(/"/g, '""') + '"';
        
        db.run(`CREATE TABLE ${escapedTableKeywords} (id INTEGER, "Column ""Name""" TEXT)`);
        db.run(`INSERT INTO ${escapedTableKeywords} VALUES (1, 'Complex Data')`);

        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync('test_escaping.db', buffer);
        
        console.log('✅ Created "test_escaping.db" successfully.');
        console.log('   Contains tables:');
        console.log(`   1. ${tableWithQuotes}`);
        console.log(`   2. ${tableWithKeywords}`);

    } catch (e) {
        console.error('Error creating database:', e);
    }
}

main();
