const express = require('express');
const router = express.Router();

const addProduct = require('../controllers/api/addProduct');
const getProducts = require('../controllers/api/getProducts');
const profiledata = require('../controllers/profilecontroller/farmerprofile');

router.post('/addproduct' , addProduct)
router.get('/products' , getProducts)
router.get('/profile/:id' , profiledata)
module.exports = router;