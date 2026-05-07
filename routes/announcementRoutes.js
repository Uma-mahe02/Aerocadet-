const express = require('express');
const router = express.Router();
const annController = require('../controllers/announcementController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.post('/', auth, authorize(['Admin', 'CTO']), annController.createAnnouncement);
router.get('/', auth, annController.getAnnouncements);

module.exports = router;
