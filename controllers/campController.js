const db = require('../config/db');
const emailService = require('../utils/emailService');

exports.createCamp = async (req, res) => {
    const { name, date, location, description } = req.body;
    try {
        await db.execute(
            'INSERT INTO camps (name, date, location, description) VALUES (?, ?, ?, ?)',
            [name, date, location, description]
        );

        const [cadets] = await db.execute('SELECT email FROM cadets WHERE email IS NOT NULL AND email != ""');
        const emails = cadets.map(c => c.email);
        if (emails.length > 0) {
            await emailService.sendCampNotice(emails, name, date).catch(err => console.error('Email failed:', err));
        }

        res.status(201).json({ message: 'Camp created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create camp', error: err.message });
    }
};

exports.getCamps = async (req, res) => {
    try {
        const [camps] = await db.execute('SELECT * FROM camps ORDER BY date DESC');
        res.json(camps);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch camps', error: err.message });
    }
};

exports.registerForCamp = async (req, res) => {
    const { camp_id } = req.body;
    const cadet_id = req.user.cadet_ref_id;

    try {
        // Check if already registered
        const [existing] = await db.execute('SELECT * FROM camp_participation WHERE camp_id = ? AND cadet_id = ?', [camp_id, cadet_id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Already registered for this camp' });

        await db.execute('INSERT INTO camp_participation (camp_id, cadet_id) VALUES (?, ?)', [camp_id, cadet_id]);
        res.status(201).json({ message: 'Registered for camp successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
};

exports.getCampParticipation = async (req, res) => {
    const { camp_id } = req.params;
    try {
        const [participants] = await db.execute(
            'SELECT cp.*, c.name, c.`rank`, c.cadet_id as official_id FROM camp_participation cp JOIN cadets c ON cp.cadet_id = c.id WHERE cp.camp_id = ?',
            [camp_id]
        );
        res.json(participants);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch participants', error: err.message });
    }
};

exports.updateAttendance = async (req, res) => {
    const { id, status } = req.body; // status: Attended, Completed
    try {
        await db.execute('UPDATE camp_participation SET status = ? WHERE id = ?', [status, id]);

        // If completed, update cadet performance score
        if (status === 'Completed') {
            const [participation] = await db.execute('SELECT cadet_id FROM camp_participation WHERE id = ?', [id]);
            if (participation.length > 0) {
                await db.execute('UPDATE cadets SET performance_score = performance_score + 10 WHERE id = ?', [participation[0].cadet_id]);
            }
        }

        res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update attendance', error: err.message });
    }
};
