const express = require('express');
const router = express.Router();

const farmerInfo = require('../controllers/api/farmer/farmer-profile');
const products = require('../controllers/api/farmer/farmerProducts');
const addProduct = require('../controllers/api/farmer/addProduct');
const updateProfile = require('../controllers/api/update-profile');
const productDetail = require('../controllers/api/productDetail');
const isLoggedIn = require('../middlewares/isLoggedIn');

const upload = require('../utils/multerConfig');

const checkRole = require('../middlewares/checkRole');

const profileUpload = require('../utils/profileUpload');

// Farmer routes
router.use('/farmer-info', checkRole(['farmer']));
router.use('/products', checkRole(['farmer']));
router.use('/addProduct', checkRole(['farmer']));
router.use('/update-profile', checkRole(['farmer']));

router.use(isLoggedIn);

router.get('/farmer-info' , farmerInfo);
router.get('/products' , products);
router.post('/addProduct', upload.single('image'), addProduct);
router.post('/update-profile' , updateProfile);
router.get('/products/:id' , productDetail);

// Profile routes
router.post('/update-profile', 
    profileUpload.single('profilePhoto'),
    updateProfile
);

module.exports = router;