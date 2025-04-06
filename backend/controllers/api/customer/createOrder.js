const Order = require('../../../models/orderModel');
const Customer = require('../../../models/customerModel');
const Product = require('../../../models/productModel');
const jwt = require('jsonwebtoken');

module.exports = async function createOrder(req, res) {
    try {
        const { deliveryDetails, paymentMethod } = req.body;
        const authToken = req.cookies.authToken;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        // Get customer and cart
        const customer = await Customer.findById(decoded.id)
            .populate('cart.product');

        if (!customer || customer.cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Verify stock availability and prepare order items
        const orderItems = [];
        for (const cartItem of customer.cart) {
            const product = cartItem.product;
            if (product.quantity < cartItem.quantity) {
                return res.status(400).json({ 
                    message: `Not enough stock for ${product.name}` 
                });
            }

            orderItems.push({
                product: product._id,
                quantity: cartItem.quantity,
                price: product.price
            });

            // Update product quantity
            await Product.findByIdAndUpdate(product._id, {
                $inc: { quantity: -cartItem.quantity }
            });
        }

        // Create order
        const order = await Order.create({
            customer: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: deliveryDetails.name,
                phoneNumber: deliveryDetails.phone,
                street: deliveryDetails.address,
                city: deliveryDetails.city,
                pincode: deliveryDetails.pincode
            },
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        });

        // Clear customer's cart
        customer.cart = [];
        await customer.save();

        // Add order to customer's orders
        customer.orders.push(order._id);
        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            orderId: order._id
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};