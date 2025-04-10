const Product = require('../../../models/productModel');
const Order = require('../../../models/orderModel');

async function getDashboardStats(req, res) {
    try {
        const farmerId = req.user.id;

        // Get basic stats
        const totalProducts = await Product.countDocuments({ farmer: farmerId });
        const activeProducts = await Product.countDocuments({ 
            farmer: farmerId, 
            quantity: { $gt: 0 } 
        });

        // Calculate revenue and orders
        const orders = await Order.find({
            'items.product': { 
                $in: await Product.find({ farmer: farmerId }).select('_id') 
            }
        }).populate('items.product');

        const activeOrders = orders.filter(order => 
            ['pending', 'processing'].includes(order.status)).length;

        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => {
                const farmerItems = order.items.filter(item => 
                    item.product.farmer.toString() === farmerId.toString()
                );
                return sum + farmerItems.reduce((itemSum, item) => 
                    itemSum + (item.price * item.quantity), 0
                );
            }, 0);

        // Send response
        console.log(totalProducts);
        res.json({
            success: true,
            stats: {
                totalProducts,
                activeProducts,
                activeOrders,
                totalRevenue,
                recentOrders: orders.slice(0, 5) // Last 5 orders
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch dashboard stats' 
        });
    }
}

module.exports = getDashboardStats;