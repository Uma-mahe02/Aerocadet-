const db = require('../config/db');
const nodemailer = require('nodemailer');

// --- ADMIN ENDPOINTS ---

exports.getInventory = async (req, res) => {
    try {
        const [inventory] = await db.execute('SELECT * FROM inventory');
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch inventory', error: err.message });
    }
};

exports.addStock = async (req, res) => {
    const { item_name, quantity } = req.body;
    try {
        await db.execute(
            'INSERT INTO inventory (item_name, total_quantity, available_quantity) VALUES (?, ?, ?)',
            [item_name, quantity, quantity]
        );
        res.json({ message: 'Stock added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add stock', error: err.message });
    }
};

exports.deleteStock = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM inventory WHERE id = ?', [id]);
        res.json({ message: 'Stock removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove stock', error: err.message });
    }
};

exports.issueItem = async (req, res) => {
    const { item_id, cadet_id, issue_date } = req.body;
    try {
        // Check availability
        const [items] = await db.execute('SELECT available_quantity FROM inventory WHERE id = ?', [item_id]);
        if (items.length === 0 || items[0].available_quantity <= 0) {
            return res.status(400).json({ message: 'Item out of stock' });
        }

        const return_code = Math.floor(100000 + Math.random() * 900000).toString();

        // Issue it
        const [result] = await db.execute(
            'INSERT INTO inventory_issued (item_id, cadet_id, issue_date, return_code) VALUES (?, ?, ?, ?)',
            [item_id, cadet_id, issue_date, return_code]
        );
        const issue_id = result.insertId;

        // Deduct
        await db.execute('UPDATE inventory SET available_quantity = available_quantity - 1 WHERE id = ?', [item_id]);

        // Email Notification
        try {
            const [usr] = await db.execute('SELECT c.name, COALESCE(c.email, u.username) AS email FROM cadets c LEFT JOIN users u ON u.cadet_ref_id = c.id WHERE c.id = ? LIMIT 1', [cadet_id]);
            const [itm] = await db.execute('SELECT item_name FROM inventory WHERE id = ?', [item_id]);
            if(usr.length > 0 && itm.length > 0) {
                const cadetEmail = usr[0].email;
                const txt = `Dear Cadet ${usr[0].name},\n\nYou have been issued: ${itm[0].item_name} on ${issue_date}.\nYour unique Issue ID is #${issue_id}.\n*** YOUR SECURE RETURN OTP IS: ${return_code} ***\nYou must provide this OTP to the Quartermaster when returning the equipment.\nPlease keep your equipment well maintained.\n\nRegards,\nAirWing Quartermaster`;
                
                nodemailer.createTestAccount((err, account) => {
                    if (err) return console.error("Failed to create Ethereal test account");
                    let transporter = nodemailer.createTransport({
                        host: account.smtp.host,
                        port: account.smtp.port,
                        secure: account.smtp.secure,
                        auth: { user: account.user, pass: account.pass }
                    });

                    transporter.sendMail({
                        from: '"Quartermaster HQ" <qm@airwingncc.com>',
                        to: cadetEmail,
                        subject: "Equipment Dispatch Order: " + itm[0].item_name,
                        text: txt
                    }, (err, info) => {
                        if (err) {
                            console.error("Email delivery failed:", err);
                        } else {
                            console.log(`\n\n=== SECURE OTP DISPATCHED TO CADET ${cadetEmail} ===`);
                            console.log(`Click to view the Cadet's inbox: ${nodemailer.getTestMessageUrl(info)}`);
                            console.log(`====================================================\n\n`);
                        }
                    });
                });
            }
        } catch (emErr) { console.error("Email notification failed:", emErr); }

        res.json({ message: 'Item issued successfully', issue_id, return_code });
    } catch (err) {
        res.status(500).json({ message: 'Failed to issue item', error: err.message });
    }
};

exports.returnItem = async (req, res) => {
    const { issue_id } = req.params;
    const { return_code } = req.body;
    try {
        // Find which item was returned
        const [issued] = await db.execute('SELECT item_id, return_code FROM inventory_issued WHERE id = ? AND status = "Issued"', [issue_id]);
        if (issued.length === 0) return res.status(404).json({ message: 'Record not found or already returned' });

        if (issued[0].return_code !== return_code) {
            return res.status(400).json({ message: 'Invalid Return Code (OTP)' });
        }

        const item_id = issued[0].item_id;

        // Mark returned
        await db.execute('UPDATE inventory_issued SET status = "Returned" WHERE id = ?', [issue_id]);

        // Add back to inventory
        await db.execute('UPDATE inventory SET available_quantity = available_quantity + 1 WHERE id = ?', [item_id]);

        res.json({ message: 'Item returned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to return item', error: err.message });
    }
}

exports.getIssuedGear = async (req, res) => {
    try {
        const [issued] = await db.execute(`
            SELECT ii.id as issue_id, i.item_name, c.name as cadet_name, ii.issue_date, ii.status 
            FROM inventory_issued ii 
            JOIN inventory i ON ii.item_id = i.id 
            JOIN cadets c ON ii.cadet_id = c.id
            WHERE ii.status = 'Issued'
            ORDER BY ii.issue_date DESC
        `);
        res.json(issued);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch issued gear', error: err.message });
    }
};

// --- CADET ENDPOINTS ---

exports.getMyGear = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT cadet_ref_id FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0 || !users[0].cadet_ref_id) {
            return res.status(404).json({ message: 'Student profile not properly linked.' });
        }
        
        const cadetId = users[0].cadet_ref_id;

        const [gear] = await db.execute(`
            SELECT i.item_name, ii.issue_date, ii.status 
            FROM inventory_issued ii 
            JOIN inventory i ON ii.item_id = i.id 
            WHERE ii.cadet_id = ? AND ii.status = 'Issued'
        `, [cadetId]);

        res.json(gear);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch personal gear', error: err.message });
    }
};
