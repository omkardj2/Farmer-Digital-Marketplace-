const Product = require('../../models/productModel');

module.exports = async function productDetail (req, res){
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'firstName lastName address');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Format the response
        const formattedProduct = {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            image: product.image,
            farmer: {
                firstName: product.farmer.firstName,
                lastName: product.farmer.lastName,
                location: product.farmer.address
            }
        };

        res.status(200).json(formattedProduct);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product details' });
    }
};