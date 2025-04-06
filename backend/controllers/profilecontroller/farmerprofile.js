const farmerModel = require('../../models/farmerModel');
const jwt = require('jsonwebtoken')

module.exports = async function profiledata(req,res){
    try{
    
    let token = req.cookies.authToken;

    let decoded = jwt.verify(token,process.env.JWT_KEY);
    let farmer = await farmerModel.findById(decoded.id);
    
    res.send(farmer);
    }
    catch(err){
        res.status(500).json({message:"server error"});
    }
}