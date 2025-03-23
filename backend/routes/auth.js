const express = require('express');
const router = express.Router();

const login = require('../controllers/authControllers/login');
const register = require('../controllers/authControllers/registration');
const verify = require('../controllers/authControllers/verify');
const logout = require('../controllers/authControllers/logout');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);
router.get('/logout' , logout);

module.exports = router;