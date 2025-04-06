const jwt = require('jsonwebtoken');
const farmerModel = require('../models/farmerModel');

async function isFarmer(req, res, next) {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const farmer = await farmerModel.findById(decoded.id);

        if (!farmer) {
            return res.status(403).json({ message: 'Farmer access required' });
        }

        req.farmer = farmer;
        next();
    } catch (error) {
        console.error('Farmer auth error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = isFarmer;