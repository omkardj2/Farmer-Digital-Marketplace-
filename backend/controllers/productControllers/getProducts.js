const productModel = require('../../models/productModel')

module.exports = async function getProducts(req,res){
    try{
        let products = await productModel.find();
        res.json(products);
    }catch(err){
        return res.status(500).json({message:"server error" , error:err});
    }
};