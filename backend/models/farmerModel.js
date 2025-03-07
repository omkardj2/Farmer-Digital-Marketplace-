const mongoose = require('mongoose');

const farmerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    contact: Number,
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
    ]
});

module.exports = mongoose.model('farmer', farmerSchema);