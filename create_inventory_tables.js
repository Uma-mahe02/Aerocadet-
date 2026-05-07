require('dotenv').config();
const db = require('./config/db');

async function createTables() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(255) NOT NULL,
                total_quantity INT NOT NULL,
                available_quantity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Created inventory table");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS inventory_issued (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                cadet_id INT NOT NULL,
                issue_date DATE NOT NULL,
                return_code VARCHAR(10) NOT NULL,
                status ENUM('Issued', 'Returned') DEFAULT 'Issued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE,
                FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE
            )
        `);
        console.log("Created inventory_issued table");

        process.exit(0);
    } catch(err) {
        console.error("Error creating tables", err);
        process.exit(1);
    }
}

createTables();
