const Order = require('../../../models/orderModel');
const Cart = require('../../../models/cartModel');
const mongoose = require('mongoose');

async function createOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { deliveryDetails, paymentMethod } = req.body;
        const userId = req.user.id;

        console.log('Request Body:', req.body);
        console.log('User ID:', req.user.id);

        // Validate required fields
        if (!deliveryDetails || !paymentMethod) {
            return res.status(400).json({ 
                message: 'Delivery details and payment method are required' 
            });
        }
 
        console.log('Delivery Details:', deliveryDetails);
        console.log('Payment Method:', paymentMethod);

        // Get cart items
        console.log(req.user.id);
        const cart = await Cart.findOne({ customer: req.user.id }).populate('items.product');
        console.log(cart);
        

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ 
                message: 'Cart is empty' 
            });
        }

        console.log('Cart Items:', cart.items);

        // Calculate totals and format order items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            farmer: item.product.farmer
        }));

        const total = orderItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);

        

        // Create order
        const order = await Order.create([{
            customer: userId,
            items: orderItems,
            total: total,
            deliveryDetails: {
                name: deliveryDetails.name,
                phone: deliveryDetails.phone,
                address: deliveryDetails.address,
                city: deliveryDetails.city,
                pincode: deliveryDetails.pincode
            },
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
            status: 'pending',
            date: new Date()
        }], { session });

        console.log('Order Created:', order);

        // Clear cart after order creation
        await Cart.findOneAndUpdate(
            { customer: userId },
            { $set: { items: [] } },
            { session }
        );

        await session.commitTransaction();

        // Notify farmers about the new order
        try {
            const notifyResponse = await fetch(
                `${req.protocol}://${req.get('host')}/api/orders/${order[0]._id}/notify-farmers`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': req.headers.cookie // Forward auth cookie
                    }
                }
            );

            if (!notifyResponse.ok) {
                console.error('Failed to notify farmers:', await notifyResponse.text());
            }
        } catch (notifyError) {
            console.error('Error notifying farmers:', notifyError);
            // Don't throw error here - order is already created
        }

        res.status(201).json({
            message: 'Order created successfully',
            orderId: order[0]._id,
            orderDetails: {
                total,
                items: orderItems.length,
                status: 'pending'
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Create order error:', error);
        res.status(500).json({ 
            message: 'Failed to create order',
            error: error.message 
        });
    } finally {
        session.endSession();
    }
}

module.exports = createOrder;