const express = require('express');
const router = express.Router();

const addProduct = require('../controllers/productControllers/addProduct');

router.post('/addproduct' , addProduct)

module.exports = router;