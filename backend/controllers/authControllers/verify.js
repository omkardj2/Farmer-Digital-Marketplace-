const jwt = require('jsonwebtoken');

module.exports = async function verifyToken(req, res) {
    try {
        // ✅ Check if the cookie exists
        const token = req.cookies?.authToken;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // ✅ Verify the token using async/await
        const decoded = await jwt.verify(token, process.env.JWT_KEY);
        
        // ✅ Send consistent response format
        res.status(200).json({
            success: true,
            verified: true,
            userId: decoded.id,
            role: decoded.role
        });

    } catch (error) {
        console.error('Token verification error:', error);

        // ✅ Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }

        // ✅ Generic error handler
        res.status(500).json({ 
            success: false, 
            message: 'Server error during verification' 
        });
    }
};
