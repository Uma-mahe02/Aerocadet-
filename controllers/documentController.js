const db = require('../config/db');

exports.uploadDocument = async (req, res) => {
    const { type } = req.body;
    const cadet_id = req.user.cadet_ref_id;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const file_path = `/uploads/documents/${req.file.filename}`;
        await db.execute(
            'INSERT INTO documents (cadet_id, type, file_path) VALUES (?, ?, ?)',
            [cadet_id, type, file_path]
        );
        res.status(201).json({ message: 'Document uploaded successfully', file_path });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        let query = 'SELECT d.*, c.name as cadet_name FROM documents d JOIN cadets c ON d.cadet_id = c.id';
        const params = [];

        if (req.user.role === 'Student') {
            query += ' WHERE d.cadet_id = ?';
            params.push(req.user.cadet_ref_id);
        }

        const [docs] = await db.execute(query, params);
        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
    }
};

exports.verifyDocument = async (req, res) => {
    const { id, status } = req.body; // status: Verified or Rejected

    try {
        await db.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Document ${status.toLowerCase()} successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Verification failed', error: err.message });
    }
};
