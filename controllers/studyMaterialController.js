const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.uploadMaterial = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No document uploaded' });
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Document title is required' });

        const filePath = `/uploads/${req.file.filename}`;
        await db.execute(
            'INSERT INTO study_materials (title, file_path, uploaded_by) VALUES (?, ?, ?)',
            [title, filePath, req.user.id]
        );
        res.status(201).json({ message: 'Study material uploaded successfully', file_path: filePath });
    } catch (err) {
        res.status(500).json({ message: 'Document upload failed', error: err.message });
    }
};

exports.getMaterials = async (req, res) => {
    try {
        const [materials] = await db.execute(`
            SELECT s.*, u.name as uploader_name 
            FROM study_materials s
            LEFT JOIN users u ON s.uploaded_by = u.id
            ORDER BY s.created_at DESC
        `);
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
    }
};

exports.deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT file_path FROM study_materials WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Material not found' });

        const filePath = path.join(__dirname, '..', 'public', rows[0].file_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.execute('DELETE FROM study_materials WHERE id = ?', [id]);
        res.json({ message: 'Material deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete material', error: err.message });
    }
};
