const Product = require('../../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().select('name category price quantity image');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'firstName lastName address');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

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

exports.searchProducts = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, location } = req.query;
        
        let filter = {};
        
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (category) {
            filter.category = category;
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (location) {
            filter['farmer.location'] = { $regex: location, $options: 'i' };
        }
        
        const products = await Product.find(filter)
            .populate('farmer', 'firstName lastName location')
            .select('name description price image quantity farmer');
            
        res.status(200).json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products' });
    }
};