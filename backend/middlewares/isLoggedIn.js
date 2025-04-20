const jwt = require('jsonwebtoken');

module.exports = async function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        
        // Add role check if needed
        if (req.baseUrl.includes('farmer') && decoded.role !== 'farmer') {
            return res.status(403).json({ message: 'Access denied: Farmer only' });
        }
        
        if (req.baseUrl.includes('customer') && decoded.role !== 'customer') {
            return res.status(403).json({ message: 'Access denied: Customer only' });
        }

        req.user = decoded; // Add user info to request object
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};