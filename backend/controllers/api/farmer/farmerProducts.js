const Product = require('../../../models/productModel');

async function getProducts(req, res) {
    try {
        const farmerId = req.user.id; // Ensure `req.user` is populated by authentication middleware
        const products = await Product.find({ farmer: farmerId })
            .select('name description price quantity category image')
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
}

module.exports = getProducts;
