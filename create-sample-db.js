const initSqlJs = require('sql.js');
const fs = require('fs');

initSqlJs().then(SQL => {
    const db = new SQL.Database();
    
    // Create tables
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TEXT
    )`);
    
    db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL,
        stock INTEGER,
        category TEXT
    )`);
    
    db.run(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        order_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
    
    // Insert sample data
    db.run(`INSERT INTO users (id, name, email, created_at) VALUES 
        (1, 'John Doe', 'john@example.com', '2024-01-15'),
        (2, 'Jane Smith', 'jane@example.com', '2024-02-20'),
        (3, 'Bob Wilson', 'bob@example.com', '2024-03-10'),
        (4, 'Alice Brown', 'alice@example.com', '2024-04-05'),
        (5, 'Charlie Davis', 'charlie@example.com', '2024-05-12')`);
    
    db.run(`INSERT INTO products (id, name, price, stock, category) VALUES 
        (1, 'Laptop', 999.99, 15, 'Electronics'),
        (2, 'Mouse', 29.99, 50, 'Electronics'),
        (3, 'Keyboard', 79.99, 30, 'Electronics'),
        (4, 'Monitor', 299.99, 20, 'Electronics'),
        (5, 'Desk Chair', 199.99, 10, 'Furniture'),
        (6, 'Desk Lamp', 49.99, 25, 'Furniture'),
        (7, 'USB Cable', 9.99, 100, 'Accessories'),
        (8, 'Webcam', 89.99, 18, 'Electronics')`);
    
    db.run(`INSERT INTO orders (id, user_id, product_id, quantity, order_date) VALUES 
        (1, 1, 1, 1, '2024-05-01'),
        (2, 1, 2, 2, '2024-05-01'),
        (3, 2, 3, 1, '2024-05-15'),
        (4, 3, 1, 1, '2024-06-01'),
        (5, 4, 5, 1, '2024-06-10'),
        (6, 2, 4, 1, '2024-06-15'),
        (7, 5, 7, 3, '2024-07-01'),
        (8, 1, 8, 1, '2024-07-20')`);
    
    // Export database to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync('sample.db', buffer);
    
    console.log('Sample database created successfully!');
    console.log('Tables: users (5 rows), products (8 rows), orders (8 rows)');
});
