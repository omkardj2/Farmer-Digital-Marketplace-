const Cart = require('../../../models/cartModel');
const productModel = require('../../../models/productModel');
const jwt = require('jsonwebtoken');

module.exports = async function addToCart(req, res) {
    try {
        const authToken = req.cookies.authToken;
        const { productId, quantity } = req.body;

        // Validate inputs
        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid product ID or quantity' });
        }

        // Verify token and get customer ID
        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        const customerId = decoded.id;

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product is in stock
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Find or create the cart for the customer
        let cart = await Cart.findOne({ customer: customerId });
        if (!cart) {
            cart = new Cart({
                customer: customerId,
                items: []
            });
        }

        // Check if product already exists in the cart
        const existingCartItem = cart.items.find(item => 
            item.product.toString() === productId
        );

        if (existingCartItem) {
            // Update quantity if product already in cart
            existingCartItem.quantity += quantity;
        } else {
            // Add new product to cart
            cart.items.push({
                product: productId,
                quantity: quantity
            });
        }

        // Save the cart
        await cart.save();

        // Populate product details in the response
        const updatedCart = await Cart.findOne({ customer: customerId })
            .populate('items.product');

        res.status(200).json({
            message: 'Product added to cart successfully',
            cart: updatedCart.items
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ 
            message: 'Error adding product to cart',
            error: error.message 
        });
    }
};