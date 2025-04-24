const orderModel = require('../../../models/orderModel');
const jwt = require('jsonwebtoken');
const Order = require('../../../models/orderModel');

module.exports = {
    confirmOrder: async function confirmOrder(req, res) {
        try {
            const authToken = req.cookies.authToken;

            if (!authToken) {
                return res.status(401).json({ message: 'No token found' });
            }

            const decoded = jwt.verify(authToken, process.env.JWT_KEY);
            const { orderId } = req.body;

            if (!orderId) {
                return res.status(400).json({ message: 'Order ID is required' });
            }

            const order = await orderModel.findOne({ _id: orderId, customer: decoded.id });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.status = 'Confirmed';
            order.confirmationDate = new Date();

            await order.save();

            res.status(200).json({
                message: 'Order confirmed successfully',
                order: {
                    _id: order._id,
                    status: order.status,
                    confirmationDate: order.confirmationDate,
                    total: order.total
                }
            });

        } catch (error) {
            console.error("Error confirming order:", error);
            res.status(500).json({
                message: 'Server error',
                error: error.message
            });
        }
    },

    getOrderDetails: async function getOrderDetails(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await Order.findById(orderId)
                .populate('items.product')
                .populate('customer', 'firstName lastName email');

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Calculate subtotal and shipping fee if not stored in the database
            const subtotal = order.items.reduce((sum, item) => {
                return sum + item.product.price * item.quantity;
            }, 0);

            const shippingFee = order.shippingFee || 40; // Default shipping fee if not stored
           
            res.status(200).json({
                ...order.toObject(),
                subtotal,
                shippingFee
            });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).json({ message: 'Failed to fetch order details' });
        }
    }
};
