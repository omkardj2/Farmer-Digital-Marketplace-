const farmerModel = require('../../models/farmerModel');

module.exports = async function profiledata(req,res){
    try{
    let roken = req.cookie.authtoken;

    let farmer = await farmerModel.findById(farmer_id);

    res.send(farmer);
    }
    catch(err){
        res.status(500).json({message:"server error"});
    }
}