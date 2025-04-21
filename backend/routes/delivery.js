const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const deliveryPersonModel = require('../models/deliveryPersonModel');
const orderModel = require('../models/orderModel');

// Get active deliveries for a delivery person
router.get('/active', auth, async (req, res) => {
    try {
        const deliveryPerson = await deliveryPersonModel.findById(req.user.id)
            .populate('assignedOrders');
        
        if (!deliveryPerson) {
            return res.status(404).json({ message: 'Delivery person not found' });
        }

        const activeDeliveries = deliveryPerson.assignedOrders.map(order => ({
            order_id: order._id,
            customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
            delivery_address: order.shippingAddress,
            status: order.status,
            latitude: order.deliveryLocation?.coordinates[1],
            longitude: order.deliveryLocation?.coordinates[0]
        }));

        res.json(activeDeliveries);
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update delivery person location
router.post('/update-location', auth, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        await deliveryPersonModel.findByIdAndUpdate(req.user.id, {
            currentLocation: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Confirm delivery with OTP
router.post('/confirm', auth, async (req, res) => {
    try {
        const { order_id, otp } = req.body;
        
        const order = await orderModel.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.deliveryOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Update order status
        order.status = 'delivered';
        order.deliveryDate = new Date();
        await order.save();

        // Update delivery person stats
        const deliveryPerson = await deliveryPersonModel.findById(req.user.id);
        deliveryPerson.assignedOrders = deliveryPerson.assignedOrders.filter(id => id.toString() !== order_id);
        deliveryPerson.completedOrders.push(order_id);
        deliveryPerson.totalDeliveries += 1;
        await deliveryPerson.save();

        res.json({ message: 'Delivery confirmed successfully' });
    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get delivery history
router.get('/history', auth, async (req, res) => {
    try {
        const deliveryPerson = await deliveryPersonModel.findById(req.user.id)
            .populate('completedOrders');
        
        if (!deliveryPerson) {
            return res.status(404).json({ message: 'Delivery person not found' });
        }

        const deliveryHistory = deliveryPerson.completedOrders.map(order => ({
            order_id: order._id,
            customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
            delivery_address: order.shippingAddress,
            status: order.status,
            delivery_date: order.deliveryDate
        }));

        res.json(deliveryHistory);
    } catch (error) {
        console.error('Error fetching delivery history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 