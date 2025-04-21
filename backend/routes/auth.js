const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generateToken');
const { register } = require('../controllers/authControllers/registration');
const Farmer = require('../models/farmerModel');
const Customer = require('../models/customerModel');
const DeliveryPerson = require('../models/deliveryPersonModel');
const Admin = require('../models/adminModel');

// Import controllers
const { login, logout, verify } = require('../controllers/authControllers/registration');

// Registration route
router.post('/register', async (req, res) => {
    try {
        await register(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // Select the appropriate model based on role
        let UserModel;
        switch (role.toLowerCase()) {
            case 'farmer':
                UserModel = Farmer;
                break;
            case 'customer':
                UserModel = Customer;
                break;
            case 'delivery':
                UserModel = DeliveryPerson;
                break;
            case 'admin':
                UserModel = Admin;
                break;
            default:
                return res.status(400).json({ error: 'Invalid role' });
        }

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            message: 'Login successful',
            role: user.role,
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify token route
router.get('/verify', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        res.status(200).json({ message: 'Token is valid' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;