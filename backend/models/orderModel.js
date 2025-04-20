const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered'],
        default: 'pending'
    },
    deliveryDetails: {
        name: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliveryPerson'
    },
    deliveryOTP: {
        type: String,
        length: 6
    },
    trackingHistory: [{
        status: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number]
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

orderSchema.index({ 'trackingHistory.location': '2dsphere' });

module.exports = mongoose.model('order', orderSchema);