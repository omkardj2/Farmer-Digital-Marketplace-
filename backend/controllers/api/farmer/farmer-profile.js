const farmerModel = require('../../../models/farmerModel');
const jwt = require('jsonwebtoken');

module.exports = async function farmerInfo(req, res) {
    try {
        let authToken = req.cookies.authToken;

        if (!authToken) {
            return res.status(400).json({ message: 'No token found' });
        }

        let decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        let farmer = await farmerModel.findById(decoded.id);
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        res.status(200).json({
            firstName: farmer.firstName,
            lastName: farmer.lastName,
            email: farmer.email,
            contact: farmer.contact,
            address: farmer.address
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
