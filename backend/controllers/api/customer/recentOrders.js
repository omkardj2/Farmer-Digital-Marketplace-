const Order = require('../../../models/orderModel');

exports.getRecentOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ customer: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id createdAt items total status');

        res.status(200).json([
            {
                _id: 'order123',
                items: ['item1', 'item2'],
                total: 100,
                status: 'Delivered',
                date: '2025-04-06',
            },
        ]);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ message: 'Failed to fetch recent orders' });
    }
};