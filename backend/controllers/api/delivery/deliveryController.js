const Order = require('../../../models/orderModel');
const DeliveryPerson = require('../../../models/deliveryPersonModel');
const { generateOTP } = require('../../../utils/otpGenerator');

const deliveryController = {
    // Get assigned deliveries for a delivery person
    async getAssignedDeliveries(req, res) {
        try {
            const deliveryPersonId = req.user.id;
            const deliveries = await Order.find({
                deliveryPerson: deliveryPersonId,
                status: { $in: ['out-for-delivery', 'processing'] }
            }).populate('customer', 'firstName lastName phone');

            res.json(deliveries);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch deliveries' });
        }
    },

    // Update delivery status
    async updateDeliveryStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, location } = req.body;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Add to tracking history
            order.trackingHistory.push({
                status,
                location: {
                    type: 'Point',
                    coordinates: location
                }
            });

            order.status = status;
            await order.save();

            res.json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update status' });
        }
    },

    // Verify delivery OTP
    async verifyDeliveryOTP(req, res) {
        try {
            const { orderId, otp } = req.body;
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.deliveryOTP !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            order.status = 'delivered';
            order.deliveryOTP = null;
            await order.save();

            // Update delivery person stats
            await DeliveryPerson.findByIdAndUpdate(order.deliveryPerson, {
                $push: { completedOrders: orderId },
                $inc: { totalDeliveries: 1 }
            });

            res.json({ message: 'Delivery verified successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to verify delivery' });
        }
    },

    // Update delivery person location
    async updateLocation(req, res) {
        try {
            const { location } = req.body;
            await DeliveryPerson.findByIdAndUpdate(req.user.id, {
                currentLocation: {
                    type: 'Point',
                    coordinates: location
                }
            });

            res.json({ message: 'Location updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update location' });
        }
    }
};

module.exports = deliveryController; 