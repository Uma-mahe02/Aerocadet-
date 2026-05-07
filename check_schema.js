require('dotenv').config();
const db = require('./config/db');

async function checkSchema() {
    try {
        console.log("-- DESC users --");
        const [users] = await db.query('DESC users');
        console.log(users);
        
        console.log("-- DESC cadets --");
        const [cadets] = await db.query('DESC cadets');
        console.log(cadets);

        process.exit(0);
    } catch(err) {
        console.error("Schema check failed: ", err);
        process.exit(1);
    }
}
checkSchema();
