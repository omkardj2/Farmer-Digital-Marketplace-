const express = require("express");
const router = express.Router();
const productController = require('../controllers/api/productController');
const addToCart = require("../controllers/api/addToCart");
const getCart = require("../controllers/api/cart");
const removefromCart = require('../controllers/api/removefromCart');
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require('../middlewares/checkRole');

const customerInfo = require('../controllers/api/customer-info');
const customerOrders = require('../controllers/api/customer-orders');
const updateCustomerProfile = require('../controllers/api/update-customer-profile')

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

module.exports = router;