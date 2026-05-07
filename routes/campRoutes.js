const express = require('express');
const router = express.Router();
const campController = require('../controllers/campController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.post('/', auth, authorize(['Admin', 'CTO']), campController.createCamp);
router.get('/', auth, campController.getCamps);
router.post('/register', auth, authorize('Student'), campController.registerForCamp);
router.get('/:camp_id/participants', auth, authorize(['Admin', 'CTO']), campController.getCampParticipation);
router.put('/attendance', auth, authorize(['Admin', 'CTO']), campController.updateAttendance);

module.exports = router;
