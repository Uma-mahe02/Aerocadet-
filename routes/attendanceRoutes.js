const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Get Cadet's own personal stats
router.get('/mystats', auth, authorize(['Student']), attendanceController.getCadetAttendanceStats);

// Get attendance for a specific date and session_type (Format: YYYY-MM-DD/SessionType)
router.get('/:date/:session_type', auth, authorize(['Admin', 'CTO']), attendanceController.getAttendanceByDate);

// Submit or update a bulk array of attendance for a specific date
router.post('/', auth, authorize(['Admin', 'CTO']), attendanceController.markAttendance);

module.exports = router;
