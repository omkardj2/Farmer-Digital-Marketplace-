const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose_connection = require('../config/mongoose-connection')
const customerModel = require("../models/customerModel");
const farmerModel = require("../models/farmerModel");

const cookieParser = require('cookie-parser');
const generateToken = require('../utils/generateToken')

function register(req , res){
    let{firstName , lastName , email , password , contact , role} = req.body;
    if(!firstName || !lastName || !email || !password || !role){
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
                        firstName,
                        lastName,
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

async function login(req, res) {
    let { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        if (role == "farmer") {
            let farmer = await farmerModel.findOne({ email });
            if (!farmer) {
                return res.status(400).json({ message: "Farmer not found" });
            }

            bcrypt.compare(password, farmer.password, function (err, result) {
                if (result) {
                    const token = generateToken(farmer);
                    res.cookie("authToken", token, { httpOnly: true, sameSite: 'Lax' });
                    res.status(200).json({ message: "Login successful", token, role: "farmer" });
                } else {
                    return res.status(400).json({ message: "Invalid password or email" });
                }
            });

        } else if (role == "customer") {
            let customer = await customerModel.findOne({ email });
            if (!customer) {
                return res.status(400).json({ message: "Customer not found" });
            }

            bcrypt.compare(password, customer.password, function (err, result) {
                if (result) {
                    const token = generateToken(customer);
                    res.cookie('authToken', token, {
                        httpOnly: true,
                        //secure: true, // Set to true in production (HTTPS)
                        expires: new Date(Date.now() + 900000), // 15 minutes
                        path: '/'
                      });
                    res.status(200).json({ message: "Login successful", token, role: "customer" });
                } else {
                    return res.status(400).json({ message: "Invalid email or password" });
                }
            });

        }
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
}

module.exports = { register, login };