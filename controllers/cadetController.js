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

exports.removeCadet = async (req, res) => {
    const { id } = req.params;
    try {
        // Because of FOREIGN KEY ... ON DELETE SET NULL, the related user will remain but detached.
        // We could delete the user directly if we want to erase everything.
        // Let's delete the user who references this cadet first, then the cadet.
        await db.execute('DELETE FROM users WHERE cadet_ref_id = ?', [id]);
        
        const [result] = await db.execute('DELETE FROM cadets WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cadet not found' });
        
        res.json({ message: 'Squadron member and portal access permanently removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove cadet', error: err.message });
    }
};
