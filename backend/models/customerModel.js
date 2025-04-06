const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    contact: String,
    address: String,
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
    ],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
            quantity: Number,
        },
    ],
});

module.exports = mongoose.model('customer', customerSchema);