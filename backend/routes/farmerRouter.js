const express = require('express');
const router = express.Router();

const addProduct = require('../controllers/api/farmer/addProduct');
const getProducts = require('../controllers/api/farmer/farmerProducts');
const profiledata = require('../controllers/profilecontroller/farmerprofile');
const getDashboardStats = require('../controllers/api/farmer/farmerDashboardStats');
const getFarmerOrders = require('../controllers/api/farmer/farmerOrders');
const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../utils/multerConfig');

router.use(isLoggedIn);

router.post('/addProduct', upload.single('image'), addProduct);
router.get('/products', getProducts);
router.get('/profile', profiledata);
router.get('/dashboard-stats', getDashboardStats);
router.get('/orders', getFarmerOrders);

module.exports = router;