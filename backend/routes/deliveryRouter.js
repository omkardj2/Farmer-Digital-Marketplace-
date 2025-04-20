const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/api/delivery/deliveryController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const checkRole = require('../middlewares/checkRole');

// Apply authentication middleware
router.use(isLoggedIn);
router.use(checkRole(['delivery']));

// Get assigned deliveries
router.get('/deliveries', deliveryController.getAssignedDeliveries);

// Update delivery status
router.put('/deliveries/:orderId/status', deliveryController.updateDeliveryStatus);

// Verify delivery OTP
router.post('/deliveries/verify', deliveryController.verifyDeliveryOTP);

// Update location
router.put('/location', deliveryController.updateLocation);

module.exports = router; 