const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose_connection = require('../../config/mongoose-connection')
const customerModel = require("../../models/customerModel");
const farmerModel = require("../../models/farmerModel");
const deliveryPersonModel = require("../../models/deliveryPersonModel");

const cookieParser = require('cookie-parser');
const generateToken = require('../../utils/generateToken')

async function register(req , res){
    let{firstName , lastName , email , password , contact , role , vehicleNumber , vehicleType} = req.body;
    if(!firstName || !lastName || !email || !password || !role){
        return res.status(400).json({message: "All fields are required"});
    }
    
    try {
        let existing;
        let userModel;
        let userData = {
            firstName,
            lastName,
            email,
            password,
            contact,
            profilepic: '../../uploads/profiles/avatar.png'
        };

        if(role == "farmer"){
            existing = await farmerModel.findOne({email});
            userModel = farmerModel;
        }else if(role == "delivery"){
            existing = await deliveryPersonModel.findOne({email});
            userModel = deliveryPersonModel;
            userData.vehicleNumber = vehicleNumber;
            userData.vehicleType = vehicleType;
        }else{
            existing = await customerModel.findOne({email});
            userModel = customerModel;
        }

        if(existing) return res.status(400).json({message:"user already exists"});

        bcrypt.genSalt(10 , function( err , salt ){
            bcrypt.hash(password , salt , async function(err , hash){
                try {
                    userData.password = hash;
                    const user = await userModel.create(userData);
                    
                    const token = generateToken(user, role);
                    
                    res.cookie("authToken", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Lax',
                        path: '/',
                        maxAge: 24 * 60 * 60 * 1000
                    });

                    return res.status(201).json({
                        success: true,
                        message: "Registration successful",
                        user: {
                            id: user._id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: role
                        }
                    });
                } catch (err) {
                    return res.status(500).json({ 
                        success: false,
                        message: "Server Error", 
                        error: err.message 
                    });
                }
            })
        })
    } catch (err) {
        return res.status(500).json({ 
            success: false,
            message: "Server Error", 
            error: err.message 
        });
    }
}

module.exports = register;