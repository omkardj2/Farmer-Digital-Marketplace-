const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    contact: Number,
    cart: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product',
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                }
            }
        ],
        default: []
    },
    orders: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('customer', customerSchema);