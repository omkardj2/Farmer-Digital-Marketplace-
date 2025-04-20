const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');

const farmerController = {
    async getDashboardStats(req, res) {
        try {
            const farmerId = req.farmer._id;

            // Get products count
            const totalProducts = await Product.countDocuments({ farmer: farmerId });

            // Get orders stats
            const orders = await Order.find({
                'items.product': { 
                    $in: await Product.find({ farmer: farmerId }).select('_id') 
                }
            });

            // Calculate stats
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

            // Calculate monthly revenue
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyRevenue = orders
                .filter(order => 
                    order.status === 'delivered' && 
                    order.date >= monthStart
                )
                .reduce((sum, order) => {
                    const farmerItems = order.items.filter(item => 
                        item.product.farmer.toString() === farmerId.toString()
                    );
                    return sum + farmerItems.reduce((itemSum, item) => 
                        itemSum + (item.price * item.quantity), 0
                    );
                }, 0);

            // Get chart data
            const chartData = await getChartData(farmerId);

            res.json({
                totalProducts,
                activeOrders,
                totalRevenue,
                monthlyRevenue,
                chartData
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard stats' });
        }
    }
};

async function getChartData(farmerId) {
    // Get last 7 days data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await Order.find({
        'items.product': { 
            $in: await Product.find({ farmer: farmerId }).select('_id') 
        },
        date: { $gte: sevenDaysAgo },
        status: 'delivered'
    }).populate('items.product');

    // Process data for charts
    const salesByDay = {};
    const productSales = {};

    orders.forEach(order => {
        // Daily sales for farmer's products only
        const farmerItems = order.items.filter(item => 
            item.product.farmer.toString() === farmerId.toString()
        );

        const dayTotal = farmerItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        const day = new Date(order.date).toLocaleDateString();
        salesByDay[day] = (salesByDay[day] || 0) + dayTotal;

        // Product sales
        farmerItems.forEach(item => {
            const productName = item.product.name;
            productSales[productName] = (productSales[productName] || 0) + item.quantity;
        });
    });

    return {
        salesLabels: Object.keys(salesByDay),
        salesData: Object.values(salesByDay),
        productLabels: Object.keys(productSales).slice(0, 5), // Top 5 products
        productData: Object.values(productSales).slice(0, 5)
    };
}

module.exports = farmerController;