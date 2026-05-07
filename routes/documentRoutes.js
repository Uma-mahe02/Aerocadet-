const express = require('express');
const router = express.Router();
const docController = require('../controllers/documentController');
const { auth, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', auth, authorize('Student'), upload.single('document'), docController.uploadDocument);
router.get('/', auth, docController.getDocuments);
router.put('/verify', auth, authorize(['Admin', 'CTO']), docController.verifyDocument);

module.exports = router;
