const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Admin Routes
router.post('/log', auth, authorize(['Admin', 'CTO']), assessmentController.logScore);
router.get('/cadet/:cadet_id', auth, authorize(['Admin', 'CTO']), assessmentController.getScoresByCadet);

// Cadet Routes
router.get('/myscores', auth, authorize(['Student']), assessmentController.getMyScores);

module.exports = router;
