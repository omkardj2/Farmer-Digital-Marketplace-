const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
.connect(MONGODB_URI , {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(function(){
    console.log("Connected to MongoDB");
})
.catch(function(err){
    console.log("Error connecting to MongoDB", err);
});

module.exports = mongoose.connection;