const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    }
});

const customerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contact: String,
    address: String,
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    orders: [orderSchema]
});

module.exports = mongoose.model('customer', customerSchema);