const db = require('./config/db');

async function deleteOrders() {
    try {
        // Deleting the bottom two orders shown in the UI (id 1 and id 2)
        const [result] = await db.query('DELETE FROM announcements WHERE id IN (1, 2)');
        console.log(`Deleted ${result.affectedRows} orders successfully.`);
    } catch (err) {
        console.error('Error deleting orders:', err);
    } finally {
        process.exit();
    }
}

deleteOrders();
