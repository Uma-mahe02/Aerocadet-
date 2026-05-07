const db = require('./config/db');

async function migrate() {
    try {
        await db.execute('ALTER TABLE inventory_issued ADD COLUMN return_code VARCHAR(10) DEFAULT NULL');
        console.log("Migration successful: Added return_code column.");
    } catch(err) {
        console.log("Migration skipped/error: ", err.message);
    }
    process.exit();
}

migrate();
