const Order = require('../../../models/orderModel');
const Product = require('../../../models/productModel');

async function getFarmerOrders(req, res) {
    try {
        const farmerId = req.user.id;
        const { status } = req.query;

        // Find all products by this farmer
        const farmerProducts = await Product.find({ farmer: farmerId }).select('_id');
        const productIds = farmerProducts.map(product => product._id);

        // Build query based on status
        let query = {
            'items.product': { $in: productIds }
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        // Find orders containing farmer's products
        const orders = await Order.find(query)
            .populate('customer', 'firstName lastName email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        // Process orders to include only farmer's items
        const processedOrders = orders.map(order => {
            const farmerItems = order.items.filter(item => 
                productIds.some(id => id.equals(item.product._id))
            );

            return {
                _id: order._id,
                customer: order.customer,
                items: farmerItems,
                total: farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                status: order.status,
                date: order.createdAt
            };
        });

        res.json(processedOrders);

    } catch (error) {
        console.error('Get farmer orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
        });
    }
}

module.exports = getFarmerOrders;