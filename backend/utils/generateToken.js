const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign(
        {
            email: user.email,
            id: user._id,
            // Add role based on the model being used
            role: user.constructor.modelName.toLowerCase() // This will give 'farmer' or 'customer'
        },
        process.env.JWT_KEY
    );
}

module.exports = generateToken;