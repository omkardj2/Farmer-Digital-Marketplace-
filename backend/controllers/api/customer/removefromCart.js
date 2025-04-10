const Cart = require('../../../models/cartModel');
const jwt = require('jsonwebtoken');

module.exports = async function removeFromCart(req, res) {
    try {
        const authToken = req.cookies.authToken;
        const { productId } = req.params;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        const customerId = decoded.id;

        // Find the customer's cart and remove the item
        const updatedCart = await Cart.findOneAndUpdate(
            { customer: customerId },
            { $pull: { items: { product: productId } } },
            { new: true }
        ).populate('items.product');

        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart not found for customer' });
        }

        res.status(200).json({
            message: 'Item removed from cart',
            cart: updatedCart.items
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};
