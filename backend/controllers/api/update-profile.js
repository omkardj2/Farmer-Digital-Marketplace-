const farmerModel = require('../../models/farmerModel');
const jwt = require('jsonwebtoken');

module.exports = async function updateProfile(req,res){
    try{
        let token = req.cookies.authToken;
        let {firstName , lastName ,email , contact , location} = req.body;

        if(!token){res.json({message:'no token found'})};

        let decoded = await jwt.verify(token , process.env.JWT_KEY);
        let farmer = await farmerModel.findOneAndUpdate({_id:decoded.id} , {
            firstName,
            lastName,
            email,
            contact,
            address: location
        });

        if(!farmer){return res.status(400).json({message:'Farmer not found'})};

        res.status(200).json({message:'Profile updated successfully' , farmer:farmer});

    }catch(error){
        res.status(500).json({message:'server error' , error:error});
    }
}