const Order = require('../../../models/orderModel');
const Farmer = require('../../../models/farmerModel');
const mongoose = require('mongoose');

async function notifyFarmers(req, res) {
    try {
        const orderId = req.params.orderId;

        // Validate orderId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                populate: {
                    path: 'farmer',
                    select: 'firstName lastName email notifications'
                }
            })
            .populate('customer', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Group items by farmer
        const farmerOrders = {};
        order.items.forEach(item => {
            if (!item.product || !item.product.farmer) {
                console.error('Invalid product or farmer data:', item);
                return;
            }

            const farmerId = item.product.farmer._id.toString();
            if (!farmerOrders[farmerId]) {
                farmerOrders[farmerId] = {
                    items: [],
                    farmerDetails: item.product.farmer
                };
            }
            farmerOrders[farmerId].items.push({
                product: item.product.name,
                quantity: item.quantity,
                price: item.price
            });
        });

        // Create notifications for each farmer
        const notifications = [];
        for (const farmerId in farmerOrders) {
            const notification = {
                type: 'new_order',
                orderId: orderId,
                message: `New order received from ${order.customer.firstName} ${order.customer.lastName}`,
                items: farmerOrders[farmerId].items,
                customerName: `${order.customer.firstName} ${order.customer.lastName}`,
                customerEmail: order.customer.email,
                orderTotal: farmerOrders[farmerId].items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0),
                status: 'pending',
                createdAt: new Date()
            };

            try {
                await Farmer.findByIdAndUpdate(farmerId, {
                    $push: {
                        notifications: notification
                    }
                });

                notifications.push({
                    farmerId,
                    notification
                });
            } catch (updateError) {
                console.error(`Failed to notify farmer ${farmerId}:`, updateError);
            }
        }

        if (notifications.length === 0) {
            return res.status(400).json({ 
                message: 'No farmers to notify',
                details: 'No valid farmers found for the order items'
            });
        }

        res.status(200).json({ 
            message: 'Farmers notified successfully',
            notifications,
            orderDetails: {
                orderId: order._id,
                customerName: `${order.customer.firstName} ${order.customer.lastName}`,
                totalItems: order.items.length
            }
        });

    } catch (error) {
        console.error('Error notifying farmers:', error);
        res.status(500).json({ 
            message: 'Failed to notify farmers',
            error: error.message
        });
    }
}

module.exports = notifyFarmers;