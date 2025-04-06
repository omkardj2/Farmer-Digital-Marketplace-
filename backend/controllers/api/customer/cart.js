const customerModel = require('../../../models/customerModel');
const jwt = require('jsonwebtoken');

module.exports = async function getCart(req, res) {
    try {
        const authToken = req.cookies.authToken;
        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        const customer = await customerModel.findById(decoded.id)
            .populate('cart.product');

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const cartItems = customer.cart.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            description: item.product.description
        }));

        res.status(200).json(cartItems);

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Error fetching cart items' });
    }
};