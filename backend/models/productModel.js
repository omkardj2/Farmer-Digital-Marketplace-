const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    image: {
        type: String,
        required: true,
    },
    cloudinary_id: {
        type: String,
        required: true,
    },
    description: String,
    price: Number,
    quantity: Number,
    category: {
        type: String,
        default: 'Uncategorized', // Default value
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmer',
    },
});

module.exports = mongoose.model('product', productSchema);