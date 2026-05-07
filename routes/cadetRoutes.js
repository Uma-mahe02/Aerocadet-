const express = require('express');
const router = express.Router();
const cadetController = require('../controllers/cadetController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.get('/profile', auth, cadetController.getCadetProfile);
router.get('/all', auth, authorize(['Admin', 'CTO']), cadetController.getAllCadets);
router.get('/:id/evaluate', auth, authorize(['Admin', 'CTO']), cadetController.evaluateRank);
router.delete('/:id', auth, authorize(['Admin']), cadetController.removeCadet); // Only Admins can remove cadets

module.exports = router;
