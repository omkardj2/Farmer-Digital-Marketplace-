const bcrypt = require('bcrypt');

const mongoose_connection = require('../config/mongoose-connection')
const customerModel = require("../models/customerModel");
const farmerModel = require("../models/farmerModel");

function register(req , res){
    let{firstName , lastName , email , password , contact , role} = req.body;
    if(!firstName || !lastName || !email || !password || !contact || !role){
        return res.status(400).json({message: "All fields are required"});
    }
    
    if(role == "farmer"){
        try{
            bcrypt.genSalt(10 , function( err , salt ){
                bcrypt.hash(password , salt , async function(err , hash){
                    let farmer = await farmerModel.create({
                        firstName,
                        lastName,
                        email,
                        password: hash,
                        contact
                    });
                    return res.status(201).json(farmer);
                })
            })
        }catch(err){
            res.send(err).status(500);
        }
    }else if(role == "customer"){
        try{
            bcrypt.genSalt(10 , function( err , salt ){
                bcrypt.hash(password , salt , async function(err , hash){
                    let customer = await customerModel.create({
                        firstname,
                        lastname,
                        email,
                        password: hash,
                        contact
                    })
                    return res.status(201).json(customer)
                })
            })
        }catch(err){
            return res.status(500).json({message: "Server Error" , error:err});
        }
    }
}

async function login(req , res){
    let{email , password , role} = req.body;
    if( !email || !password || !role){
        return res.status(400).json({message: "All fields are required"});
    }
    
    if(role == "farmer"){
        try{
            let farmer = await farmerModel.findOne({email});

            bcrypt.compare(password , farmer.password , function(err , result){
                res.send(result);
            })
        }catch(err){
            res.send(err).status(500);
        }
    }else if(role == "customer"){
        try{
            let customer = customerModel.findOne({email});

            bcrypt.compare(password , farmer.password , function(err , result){
                res.send(result);
            })
        }catch(err){
            return res.status(500).json({message: "Server Error" , error:err});
        }
    }
}

module.exports = {register , login};