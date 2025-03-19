const express = require("express");
const router = express.Router();

const getProducts = require('../controllers/productControllers/getProducts')


router.get('/getproducts' , getProducts);

module.exports = router; 