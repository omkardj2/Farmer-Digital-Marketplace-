const farmerModel = require('../models/farmerModel')
const productModel = require('../models/productModel');
const jwt = require('jsonwebtoken')

module.exports = async function addProduct(req,res){
    let{name,image,description,price,quantity} = req.body;

    try{
        let token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }

        let decoded = jwt.verify(token , process.env.JWT_KEY);
        let farmer = await farmerModel.findById(decoded.id);
        
        let product = await productModel.create({
            name,
            image,
            description,
            price,
            quantity,
            farmer: farmer._id
        })

        farmer.products.push(product._id);
        await farmer.save();
        res.status(201).json({farmer,product});
    }catch(err){
        return res.status(500).json({message:"internal server error" , error:err});
    }
};