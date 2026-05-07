const db = require('../config/db');
const path = require('path');

// Get all gallery photos (Available to Admins and Cadets)
exports.getGallery = async (req, res) => {
    try {
        const [photos] = await db.execute('SELECT * FROM gallery ORDER BY uploaded_at DESC');
        res.json(photos);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch gallery', error: err.message });
    }
};

// Upload new photo (Admin only)
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        const title = req.body.title || 'Untitled Photo';
        const description = req.body.description || '';
        
        // Path relative to public directory for frontend access
        const imageUrl = '/uploads/gallery/' + req.file.filename;

        await db.execute(
            'INSERT INTO gallery (title, image_url, description) VALUES (?, ?, ?)',
            [title, imageUrl, description]
        );

        res.status(201).json({ message: 'Photo uploaded to Squadron Gallery successfully!', imageUrl });
    } catch (err) {
        res.status(500).json({ message: 'Database error during upload', error: err.message });
    }
};

// Delete a photo (Admin only)
exports.deletePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        // Technically we should also delete the file using fs.unlinkSync here
        await db.execute('DELETE FROM gallery WHERE id = ?', [id]);
        res.json({ message: 'Photo removed from gallery.' });
    } catch(e) {
        res.status(500).json({ message: 'Failed to delete photo', error: e.message });
    }
};
