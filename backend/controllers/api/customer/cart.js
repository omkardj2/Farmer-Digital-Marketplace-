const Cart = require('../../../models/cartModel');
const jwt = require('jsonwebtoken');

module.exports = async function getCart(req, res) {
    try {
        const authToken = req.cookies.authToken;
        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Verify the token and get the customer ID
        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        const customerId = decoded.id;

        // Fetch the cart for the customer from the Cart model
        const cart = await Cart.findOne({ customer: customerId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ items: [] }); // Return an empty cart if no items exist
        }

        // Map the cart items to include product details
        const cartItems = cart.items.map(item => ({
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