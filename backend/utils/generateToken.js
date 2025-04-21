const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_KEY = process.env.JWT_KEY || 'your-secret-key';

const generateToken = (user) => {
    try {
        if (!JWT_KEY) {
            throw new Error('JWT_KEY is not configured');
        }

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, JWT_KEY, {
            expiresIn: '24h'
        });
    } catch (error) {
        console.error('Token generation error:', error);
        throw error;
    }
};

module.exports = { generateToken };