const db = require('./config/db');

async function testInsert() {
    try {
        console.log("Testing insert...");
        await db.execute(
            'INSERT INTO inventory (item_name, total_quantity, available_quantity) VALUES (?, ?, ?)',
            ['Rifle 2mm', 1, 1]
        );
        console.log("Insert successful!");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit();
    }
}

testInsert();
