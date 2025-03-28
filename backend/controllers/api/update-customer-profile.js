const customerModel = require('../../models/customerModel');
const jwt = require('jsonwebtoken');

module.exports = async function updateCustomerProfile(req, res) {
    try {
        const authToken = req.cookies.authToken;
        const { firstName, lastName, email, contact, address } = req.body;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        const updatedCustomer = await customerModel.findByIdAndUpdate(
            decoded.id,
            {
                firstName,
                lastName,
                email,
                contact,
                address
            },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            customer: {
                firstName: updatedCustomer.firstName,
                lastName: updatedCustomer.lastName,
                email: updatedCustomer.email,
                contact: updatedCustomer.contact,
                address: updatedCustomer.address
            }
        });
    } catch (error) {
        console.error("Error updating customer profile:", error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};