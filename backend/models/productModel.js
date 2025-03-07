const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: Number,
    quantity: Number,
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmer'
    }
});

module.exports = mongoose.model('product', productSchema);