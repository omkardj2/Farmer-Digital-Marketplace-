const Order = require('../../../models/orderModel');
const Cart = require('../../../models/cartModel');
const Wishlist = require('../../../models/wishlistModel');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalOrders = await Order.countDocuments({ customer: userId });
        
        // Get cart items count from the cart array
        const cart = await Cart.findOne({ customer: userId });
        const cartItems = cart ? cart.items.length : 0;
        
        const wishlistItems = await Wishlist.countDocuments({ customer: userId });

        const totalSpent = await Order.aggregate([
            { $match: { customer: userId } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.status(200).json({
            totalOrders,
            cartItems,
            wishlistItems,
            totalSpent: totalSpent[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};