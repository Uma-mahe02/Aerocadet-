const express = require('express');
const router = express.Router();
const certController = require('../controllers/certController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.post('/generate', auth, authorize(['Admin', 'CTO']), certController.generateCertificate);
router.get('/', auth, certController.getCertificates);

module.exports = router;
