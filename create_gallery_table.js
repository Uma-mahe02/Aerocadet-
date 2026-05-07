require('dotenv').config();
const db = require('./config/db');

async function createGalleryTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                description TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Created gallery table successfully.");
        process.exit(0);
    } catch(err) {
        console.error("Error creating gallery table", err);
        process.exit(1);
    }
}

createGalleryTable();
