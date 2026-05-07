const db = require('../config/db');

exports.createAnnouncement = async (req, res) => {
    const { title, content, role_target } = req.body;
    try {
        await db.execute(
            'INSERT INTO announcements (title, content, role_target) VALUES (?, ?, ?)',
            [title, content, role_target]
        );
        res.status(201).json({ message: 'Announcement published successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to publish announcement', error: err.message });
    }
};

exports.getAnnouncements = async (req, res) => {
    const { role } = req.user;
    try {
        const [announcements] = await db.execute(
            'SELECT * FROM announcements WHERE role_target = "All" OR role_target = ? ORDER BY created_at DESC',
            [role]
        );
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch announcements', error: err.message });
    }
};
