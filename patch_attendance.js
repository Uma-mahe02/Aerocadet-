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
        console.log("Creating/Updating attendance table...");
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                session_type ENUM('Daily Class', 'Saturday Parade') DEFAULT 'Daily Class',
                cadet_id INT NOT NULL,
                status ENUM('Present', 'Absent', 'On Leave') DEFAULT 'Present',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE,
                UNIQUE KEY unique_attendance (date, session_type, cadet_id)
            )
        `);
        console.log("Table 'attendance' is ready with session_type and unique constraints!");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await db.end();
    }
}

patchDatabase();
