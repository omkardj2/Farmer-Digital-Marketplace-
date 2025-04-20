const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

async function isAdmin(req, res, next) {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const admin = await adminModel.findById(decoded.id);

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = isAdmin;