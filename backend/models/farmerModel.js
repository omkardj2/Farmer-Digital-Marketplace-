const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['new_order', 'order_cancelled', 'payment_received']
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    items: [{
        product: String,
        quantity: Number,
        price: Number
    }],
    customerName: String,
    orderTotal: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const farmerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    contact: Number,
    address: String,
    profilepic:{
        type:String,
        default: '/uploads/profiles/default-avatar.png'
    },
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
    ],
    location: {
        lat: {
            type: Number,
            required: false // Make it required if location is always needed
        },
        lng: {
            type: Number,
            required: false
        }
    },
    notifications: [notificationSchema]
});

module.exports = mongoose.model('farmer', farmerSchema);