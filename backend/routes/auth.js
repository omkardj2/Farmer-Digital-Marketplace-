const express = require('express');
const router = express.Router();

const login = require('../controllers/authControllers/login')
const register = require('../controllers/authControllers/registration')

router.post('/register', register);
router.post('/login', login);

module.exports = router;