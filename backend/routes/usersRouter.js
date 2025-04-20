const express = require("express");
const router = express.Router();
const productController = require('../controllers/api/productController');
const addToCart = require("../controllers/api/customer/addToCart");
const getCart = require("../controllers/api/customer/cart");
const removefromCart = require('../controllers/api/customer/removefromCart');
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require('../middlewares/checkRole');

const customerInfo = require('../controllers/api/customer/customer-info');
const customerOrders = require('../controllers/api/customer/customer-orders');
const updateCustomerProfile = require('../controllers/api/customer/update-customer-profile')

const createOrder = require('../controllers/api/customer/createOrder');
const { getRecentOrders } = require('../controllers/api/customer/recentOrders');
const { getDashboardStats } = require('../controllers/api/customer/dashboardStats');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/api/customer/wishlist');

router.use(isLoggedIn);

router.get('/customer-info', checkRole(['customer']), customerInfo);
router.get('/customer/orders', checkRole(['customer']), customerOrders);
router.post('/customer/update-profile', checkRole(['customer']), updateCustomerProfile);

router.get('/api/products', productController.getAllProducts);
router.get('/api/products/search', productController.searchProducts);
router.get('/api/products/:id', productController.getProductById);
router.post('/cart/add', addToCart);
router.get('/cart', getCart);
router.delete('/cart/remove/:productId', removefromCart);

router.post('/orders/create', createOrder);

// Route to fetch recent orders
router.get('/recent-orders', getRecentOrders);

// Route to fetch dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Routes for wishlist
router.get('/wishlist', wishlistController.getWishlist);
router.post('/wishlist/add', wishlistController.addToWishlist);
router.delete('/wishlist/remove/:productId', wishlistController.removeFromWishlist);

module.exports = router;