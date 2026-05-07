const db = require('../config/db');

exports.getCadetProfile = async (req, res) => {
    const id = req.user.cadet_ref_id || req.params.id;
    try {
        const [cadets] = await db.execute('SELECT * FROM cadets WHERE id = ?', [id]);
        if (cadets.length === 0) return res.status(404).json({ message: 'Cadet not found' });
        res.json(cadets[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
    }
};

exports.getAllCadets = async (req, res) => {
    try {
        const [cadets] = await db.execute('SELECT * FROM cadets');
        res.json(cadets);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch cadets', error: err.message });
    }
};

exports.evaluateRank = async (req, res) => {
    const { id } = req.params;
    try {
        const [cadets] = await db.execute('SELECT * FROM cadets WHERE id = ?', [id]);
        if (cadets.length === 0) return res.status(404).json({ message: 'Cadet not found' });

        const cadet = cadets[0];
        let newRank = cadet.rank;

        if (cadet.performance_score >= 100) newRank = 'SGT';
        else if (cadet.performance_score >= 70) newRank = 'CPL';
        else if (cadet.performance_score >= 40) newRank = 'L/CPL';

        if (newRank !== cadet.rank) {
            await db.execute('UPDATE cadets SET `rank` = ? WHERE id = ?', [newRank, id]);
            return res.json({ message: `Rank upgraded to ${newRank}`, rank: newRank });
        }

        res.json({ message: 'No rank upgrade available', rank: cadet.rank });
    } catch (err) {
        res.status(500).json({ message: 'Evaluation failed', error: err.message });
    }
};
