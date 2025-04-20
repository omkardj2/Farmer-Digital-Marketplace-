const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['bike', 'scooter', 'car']
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    assignedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    }],
    completedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    }],
    rating: {
        type: Number,
        default: 0
    },
    totalDeliveries: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

deliveryPersonSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('deliveryPerson', deliveryPersonSchema); 