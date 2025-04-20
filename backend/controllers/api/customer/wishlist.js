const customerModel = require('../../../models/customerModel');
const productModel = require('../../../models/productModel');
const jwt = require('jsonwebtoken');

module.exports = {
    async getWishlist(req, res) {
        try {
            const authToken = req.cookies.authToken;
            if (!authToken) {
                return res.status(401).json({ message: 'No token found' });
            }

            const decoded = jwt.verify(authToken, process.env.JWT_KEY);
            const customer = await customerModel.findById(decoded.id).populate('wishlist');

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.status(200).json(customer.wishlist);
        } catch (error) {
            console.error('Get wishlist error:', error);
            res.status(500).json({ message: 'Error fetching wishlist' });
        }
    },

    async addToWishlist(req, res) {
        try {
            const authToken = req.cookies.authToken;
            if (!authToken) {
                return res.status(401).json({ message: 'No token found' });
            }

            const decoded = jwt.verify(authToken, process.env.JWT_KEY);
            const customer = await customerModel.findById(decoded.id);

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            const productId = req.body.productId;
            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (customer.wishlist.includes(productId)) {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }

            customer.wishlist.push(productId);
            await customer.save();

            res.status(200).json({ message: 'Product added to wishlist' });
        } catch (error) {
            console.error('Add to wishlist error:', error);
            res.status(500).json({ message: 'Error adding to wishlist' });
        }
    },

    async removeFromWishlist(req, res) {
        try {
            const authToken = req.cookies.authToken;
            if (!authToken) {
                return res.status(401).json({ message: 'No token found' });
            }

            const decoded = jwt.verify(authToken, process.env.JWT_KEY);
            const customer = await customerModel.findById(decoded.id);

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            const productId = req.params.productId;
            customer.wishlist = customer.wishlist.filter(
                (item) => item.toString() !== productId
            );
            await customer.save();

            res.status(200).json({ message: 'Product removed from wishlist' });
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            res.status(500).json({ message: 'Error removing from wishlist' });
        }
    },
};