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
                total: order.total,
                status: order.status,
                date: order.date
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

async function getFarmerOrder(req, res) {
    const farmerId = req.user.id;
    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId)
            .populate('customer', 'firstName lastName email')
            .populate('items.product', 'name price image');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order contains any of the farmer's products
        const farmerProducts = await Product.find({ farmer: farmerId }).select('_id');
        const productIds = farmerProducts.map(product => product._id);

        const containsFarmerProduct = order.items.some(item =>
            productIds.some(id => id.equals(item.product._id))
        );

        if (!containsFarmerProduct) {
            return res.status(403).json({ message: 'This order does not contain your products.' });
        }

        // Filter the order items to show only the farmer's products
        const farmerItems = order.items.filter(item =>
            productIds.some(id => id.equals(item.product._id))
        );

        const processedOrder = {
            _id: order._id,
            customer: order.customer,
            items: farmerItems,
            total: order.total, // You might want to recalculate the total based on farmer's items if needed
            status: order.status,
            date: order.date
        };

        res.json(processedOrder);

    } catch (error) {
        console.error('Get farmer order error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Order ID' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getFarmerOrders, getFarmerOrder };