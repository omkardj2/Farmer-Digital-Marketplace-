const Order = require('../../../models/orderModel');

exports.getRecentOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ customer: userId })
            .sort({ createdAt: -1 })
            .select('_id date items total status');

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ message: 'Failed to fetch recent orders' });
    }
};