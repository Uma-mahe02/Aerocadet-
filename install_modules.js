const db = require('./config/db');

async function deployTables() {
    try {
        console.log("Deploying Inventory table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(255) NOT NULL,
                total_quantity INT NOT NULL DEFAULT 0,
                available_quantity INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Deploying Inventory Issued table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS inventory_issued (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                cadet_id INT NOT NULL,
                issue_date DATE NOT NULL,
                status ENUM('Issued', 'Returned') DEFAULT 'Issued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE,
                FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE
            );
        `);

        console.log("Deploying Assessments table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cadet_id INT NOT NULL,
                assessment_title VARCHAR(255) NOT NULL,
                score INT NOT NULL,
                max_score INT NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE
            );
        `);

        console.log("Deploying PT Logs table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS pt_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cadet_id INT NOT NULL,
                month VARCHAR(50) NOT NULL,
                run_time VARCHAR(50) NOT NULL,
                pushups INT NOT NULL,
                situps INT NOT NULL,
                overall_grade VARCHAR(50) NOT NULL,
                date_logged DATE NOT NULL,
                FOREIGN KEY (cadet_id) REFERENCES cadets(id) ON DELETE CASCADE
            );
        `);

        console.log("Deploying Gallery table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                description TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ All Expansion Modules tables initialized successfully.");
    } catch (e) {
        console.error("❌ DB Deployment Error:", e);
    }
    process.exit();
}
deployTables();
