const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/adminControllers/adminController');

// Protect all admin routes
router.use(isAdmin);

// Dashboard routes
router.get('/verify', adminController.verifyAdmin);
router.get('/dashboard-stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Product management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order management
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/orders/:id', adminController.getOrderDetails);

// Farmer approvals
router.get('/approvals', adminController.getPendingApprovals);
router.put('/approvals/:id/approve', adminController.approveFarmer);
router.put('/approvals/:id/reject', adminController.rejectFarmer);

module.exports = router;