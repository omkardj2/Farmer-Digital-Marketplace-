const Product = require('../../../models/productModel');
const { cloudinary } = require('../../../config/cloudinaryConfig');
const streamifier = require('streamifier');

async function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'product-images',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

async function addProduct(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload image to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

        // Create new product
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category || 'Uncategorized', // Default to 'Uncategorized' if not provided
            price: parseFloat(req.body.price),
            quantity: parseInt(req.body.quantity),
            image: cloudinaryResult.secure_url,
            cloudinary_id: cloudinaryResult.public_id,
            farmer: req.user.id,
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: product,
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add product',
        });
    }
}

module.exports = addProduct;