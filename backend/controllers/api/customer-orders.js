const customerModel = require('../../models/customerModel');
const jwt = require('jsonwebtoken');

module.exports = async function customerOrders(req, res) {
    try {
        const authToken = req.cookies.authToken;

        if (!authToken) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_KEY);
        
        const customer = await customerModel.findById(decoded.id)
            .populate({
                path: 'orders',
                populate: {
                    path: 'items.product',
                    model: 'product'
                }
            });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Format orders for frontend
        const formattedOrders = customer.orders.map(order => ({
            _id: order._id,
            date: order.date,
            status: order.status,
            total: order.total,
            items: order.items.map(item => ({
                product: {
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image
                },
                quantity: item.quantity,
                subtotal: item.quantity * item.product.price
            }))
        }));

        res.status(200).json(formattedOrders);

    } catch (error) {
        console.error("Error fetching customer orders:", error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};