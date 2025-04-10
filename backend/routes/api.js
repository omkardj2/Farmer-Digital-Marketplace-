const express = require('express');
const router = express.Router();

const farmerInfo = require('../controllers/api/farmer/farmer-profile');
const products = require('../controllers/api/farmer/farmerProducts');
const addProduct = require('../controllers/api/farmer/addProduct');
const updateProfile = require('../controllers/api/update-profile');
const productDetail = require('../controllers/api/productDetail');
const notifyFarmers = require('../controllers/api/orders/notifyFarmers');
const isLoggedIn = require('../middlewares/isLoggedIn');
const createOrder = require('../controllers/api/orders/createOrder');

const upload = require('../utils/multerConfig');

const checkRole = require('../middlewares/checkRole');

const profileUpload = require('../utils/profileUpload');

// Farmer routes
router.use('/farmer-info', checkRole(['farmer']));
router.use('/products', checkRole(['farmer' , 'customer']));
router.use('/addProduct', checkRole(['farmer']));
router.use('/update-profile', checkRole(['farmer']));

router.use(isLoggedIn);

router.get('/farmer-info' , farmerInfo);
router.get('/products' , products);
router.post('/addProduct', upload.single('image'), addProduct);
router.post('/update-profile' , updateProfile);
router.get('/products/:id', checkRole(['customer', 'farmer', 'admin']), productDetail);

// Profile routes
router.post('/update-profile', 
    profileUpload.single('profilePhoto'),
    updateProfile
);

// Order notification routes
router.post('/orders/:orderId/notify-farmers', 
    isLoggedIn, 
    checkRole(['customer', 'admin']), 
    notifyFarmers
);

router.post('/orders/create' , createOrder);

module.exports = router;