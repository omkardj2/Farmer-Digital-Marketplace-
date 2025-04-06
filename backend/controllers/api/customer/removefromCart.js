const customerModel = require('../../../models/customerModel');
const jwt = require('jsonwebtoken');

module.exports = async function removeFromCart(req, res) {
    try {
        const authToken = req.cookies.authToken;
        const { productId } = req.params;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        const result = await customerModel.findByIdAndUpdate(
            decoded.id,
            { 
                $pull: { 
                    cart: { 
                        product: productId 
                    } 
                } 
            },
            { new: true }
        );

        res.status(200).json({ message: 'Item removed from cart' });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Error removing item from cart' });
    }
};