const express = require('express');
const router = express.Router();

const farmerInfo = require('../controllers/api/farmer-profile');
const products = require('../controllers/api/getProducts');
const addProduct = require('../controllers/api/addProduct');
const updateProfile = require('../controllers/api/update-profile');

router.get('/farmer-info' , farmerInfo);
router.get('/products' , products);
router.post('/addProduct' , addProduct);
router.post('/update-profile' , updateProfile);

module.exports = router;