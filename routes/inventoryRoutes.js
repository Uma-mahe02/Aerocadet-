const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Admin Routes
router.get('/', auth, authorize(['Admin', 'CTO']), inventoryController.getInventory);
router.post('/add', auth, authorize(['Admin', 'CTO']), inventoryController.addStock);
router.delete('/delete/:id', auth, authorize(['Admin', 'CTO']), inventoryController.deleteStock);
router.post('/issue', auth, authorize(['Admin', 'CTO']), inventoryController.issueItem);
router.get('/issued', auth, authorize(['Admin', 'CTO']), inventoryController.getIssuedGear);
router.post('/return/:issue_id', auth, authorize(['Admin', 'CTO']), inventoryController.returnItem);

// Cadet Routes
router.get('/mygear', auth, authorize(['Student']), inventoryController.getMyGear);

module.exports = router;
