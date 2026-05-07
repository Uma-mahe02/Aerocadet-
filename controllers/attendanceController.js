const db = require('../config/db');

// Save or Update Attendance for a Specific Date
exports.markAttendance = async (req, res) => {
    const { date, session_type, records } = req.body;
    // records should be an array of objects: { cadet_id, status }
    
    if (!date || !session_type || !records || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Invalid payload schema. Require date, session_type, and an array of records' });
    }

    try {
        // Upsert strategy using ON DUPLICATE KEY UPDATE
        for (const record of records) {
            await db.execute(
                `INSERT INTO attendance (date, session_type, cadet_id, status) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE status = ?`,
                [date, session_type, record.cadet_id, record.status, record.status]
            );
        }
        res.json({ message: `Attendance for ${date} (${session_type}) successfully recorded!` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to record attendance', error: err.message });
    }
};

// Fetch Attendance records for a Specific Date and Session Type
exports.getAttendanceByDate = async (req, res) => {
    const { date, session_type } = req.params;
    try {
        const [attendance] = await db.execute(
            `SELECT a.*, c.name, c.cadet_id as official_id 
             FROM attendance a 
             JOIN cadets c ON a.cadet_id = c.id 
             WHERE a.date = ? AND a.session_type = ?`,
            [date, session_type]
        );
        res.json(attendance); // Returns array of matched records or empty array
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
    }
};

// Get stats for a specific Cadet (Student Login)
exports.getCadetAttendanceStats = async (req, res) => {
    try {
        // Find the linked cadet_id based on the logged in User
        const [users] = await db.execute('SELECT cadet_ref_id FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0 || !users[0].cadet_ref_id) {
            return res.status(404).json({ message: 'Student profile not properly linked.' });
        }
        
        const cadetId = users[0].cadet_ref_id;
        
        // Aggregate the stats
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as leave_count
            FROM attendance 
            WHERE cadet_id = ?
        `, [cadetId]);

        const data = stats[0];
        let percentage = 0;
        
        // Calculate percentage (based on total marked days)
        if (data.total_classes > 0) {
            // "On Leave" is generally excluded from penalty but included in total classes? 
            // Or often percentage is (Present) / (Total - Leave) * 100
            // We'll proceed with basic (Present / Total) * 100 for simplicity as requested
            percentage = Math.round((data.present_count / data.total_classes) * 100);
        }

        res.json({
            total_classes: data.total_classes || 0,
            present_count: data.present_count || 0,
            absent_count: data.absent_count || 0,
            leave_count: data.leave_count || 0,
            attendance_percentage: percentage
        });

    } catch (err) {
        res.status(500).json({ message: 'Failed to calculate attendance stats', error: err.message });
    }
};
