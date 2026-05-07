const db = require('./config/db');

async function checkAnnouncements() {
    try {
        const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkAnnouncements();
