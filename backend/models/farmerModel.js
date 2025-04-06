const mongoose = require('mongoose');

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
    }
});

module.exports = mongoose.model('farmer', farmerSchema);