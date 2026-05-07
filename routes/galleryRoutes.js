const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { auth, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/gallery');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'squadron-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

// Everyone can view
router.get('/', auth, galleryController.getGallery);

// Only admins can modify
router.post('/upload', auth, authorize(['Admin', 'CTO']), upload.single('photo'), galleryController.uploadPhoto);
router.delete('/:id', auth, authorize(['Admin', 'CTO']), galleryController.deletePhoto);

module.exports = router;
