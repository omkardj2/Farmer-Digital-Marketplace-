const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const farmerModel = require("../../models/farmerModel");
const customerModel = require("../../models/customerModel");
const generateToken = require('../../utils/generateToken');

async function login(req, res) {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let user;
        if (role === "farmer") {
            user = await farmerModel.findOne({ email });
        } else if (role === "customer") {
            user = await customerModel.findOne({ email });
        }

        if (!user) {
            return res.status(400).json({ message: `${role} not found` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = generateToken(user);
            res.cookie("authToken", token, {
                httpOnly: true,
                sameSite: 'Lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return res.status(200).json({ 
                message: "Login successful", 
                role: role,
                user: {
                    id: user._id,
                    email: user.email,
                    role: role
                }
            });
        } else {
            return res.status(400).json({ message: "Invalid email or password" });
        }

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
}

module.exports = login;