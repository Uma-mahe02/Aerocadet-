require('dotenv').config();
const mysql = require('mysql2/promise');

async function patchDatabase() {
    const db = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Creating study_materials table...");
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS study_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table 'study_materials' is ready!");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await db.end();
    }
}

patchDatabase();
