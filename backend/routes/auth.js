const express = require('express');
const router = express.Router();
const passport = require('passport');

const login = require('../controllers/authControllers/login');
const register = require('../controllers/authControllers/registration');
const verify = require('../controllers/authControllers/verify');
const logout = require('../controllers/authControllers/logout');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);
router.post('/logout' , logout);

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.redirect('/product-list.html');
    }
);

module.exports = router;