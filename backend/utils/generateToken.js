const jwt = require('jsonwebtoken');

function generateToken(user, role) {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY is not configured');
    }

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: role // Use the explicit role passed from login
        },
        process.env.JWT_KEY,
        { expiresIn: '24h' }
    );
}

module.exports = generateToken;