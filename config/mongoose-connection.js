const mongoose = require('mongoose');

mongoose
.connect("mongodb://localhost:27017/farmerdigitalmarketplace")
.then(function(){
    console.log("Connected to MongoDB");
})
.catch(function(err){
    console.log("Error connecting to MongoDB", err);
});

module.exports = mongoose.connection;