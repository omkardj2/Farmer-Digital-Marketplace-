const Product = require('../../../models/productModel');
const cloudinary = require('../../../utils/cloudinaryConfig');

async function deleteProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image from Cloudinary
        if (product.cloudinary_id) {
            await cloudinary.uploader.destroy(product.cloudinary_id);
        }

        // Delete product from database
        await product.remove();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
}

module.exports = deleteProduct;