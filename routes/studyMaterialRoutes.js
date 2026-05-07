const express = require('express');
const router = express.Router();
const controller = require('../controllers/studyMaterialController');
const { auth, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', auth, authorize(['Admin', 'CTO']), upload.single('document'), controller.uploadMaterial);
router.get('/', auth, controller.getMaterials);
router.delete('/:id', auth, authorize(['Admin', 'CTO']), controller.deleteMaterial);

module.exports = router;
