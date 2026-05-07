const db = require('../config/db');

// --- ADMIN ENDPOINTS ---

// Log a new assessment score for a cadet
exports.logScore = async (req, res) => {
    const { cadet_id, assessment_title, score, max_score, date } = req.body;
    try {
        if (!cadet_id || !assessment_title || score === undefined || !max_score || !date) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        await db.execute(
            'INSERT INTO assessments (cadet_id, assessment_title, score, max_score, date) VALUES (?, ?, ?, ?, ?)',
            [cadet_id, assessment_title, score, max_score, date]
        );
        res.json({ message: 'Assessment score logged successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to log score', error: err.message });
    }
};

// Get all scores for a specific cadet (Admin view)
exports.getScoresByCadet = async (req, res) => {
    const { cadet_id } = req.params;
    try {
        const [scores] = await db.execute('SELECT * FROM assessments WHERE cadet_id = ? ORDER BY date DESC', [cadet_id]);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch cadet scores', error: err.message });
    }
};


// --- CADET ENDPOINTS ---

// Cadet views their own scores
exports.getMyScores = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT cadet_ref_id FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0 || !users[0].cadet_ref_id) {
            return res.status(404).json({ message: 'Student profile not properly linked.' });
        }
        
        const cadetId = users[0].cadet_ref_id;

        const [scores] = await db.execute('SELECT * FROM assessments WHERE cadet_id = ? ORDER BY date DESC', [cadetId]);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch personal scores', error: err.message });
    }
};
