const customerModel = require('../../../models/customerModel');
const jwt = require('jsonwebtoken');

module.exports = async function customerInfo(req, res) {
    try {
        const authToken = req.cookies.authToken;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        const customer = await customerModel.findById(decoded.id);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            contact: customer.contact,
            address: customer.address
        });
    } catch (error) {
        console.error("Error fetching customer info:", error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};