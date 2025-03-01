const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/farmerdigitalmarketplace');

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String
});

module.exports = mongoose.model('User', userSchema);