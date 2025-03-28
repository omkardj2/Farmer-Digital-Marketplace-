const express = require('express');
const router = express.Router();

const addProduct = require('../controllers/api/addProduct');
const getProducts = require('../controllers/api/farmerProducts');
const profiledata = require('../controllers/profilecontroller/farmerprofile');
const isLoggedIn = require('../middlewares/isLoggedIn');

router.use(isLoggedIn);

router.post('/addproduct' , addProduct)
router.get('/products' , getProducts)
router.get('/profile/:id' , profiledata)
module.exports = router;