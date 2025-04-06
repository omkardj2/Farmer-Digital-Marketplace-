const customerModel = require('../../../models/customerModel');
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
        
        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product is in stock
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Find customer and update cart
        const customer = await customerModel.findById(decoded.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if product already exists in cart
        const existingCartItem = customer.cart.find(item => 
            item.product.toString() === productId
        );

        if (existingCartItem) {
            // Update quantity if product already in cart
            await customerModel.updateOne(
                { 
                    _id: decoded.id,
                    'cart.product': productId 
                },
                { 
                    $set: { 
                        'cart.$.quantity': existingCartItem.quantity + quantity 
                    }
                }
            );
        } else {
            // Add new product to cart
            await customerModel.findByIdAndUpdate(
                decoded.id,
                { 
                    $push: { 
                        cart: {
                            product: productId,
                            quantity: quantity
                        }
                    }
                }
            );
        }

        // Get updated cart with populated product details
        const updatedCustomer = await customerModel.findById(decoded.id)
            .populate('cart.product');

        res.status(200).json({
            message: 'Product added to cart successfully',
            cart: updatedCustomer.cart
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