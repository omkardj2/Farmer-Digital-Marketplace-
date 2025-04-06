const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const farmerModel = require("../../models/farmerModel");
const customerModel = require("../../models/customerModel");
const adminModel = require("../../models/adminModel");
const generateToken = require('../../utils/generateToken');

async function login(req, res) {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let user;
        if (role === "admin") {
            user = await adminModel.findOne({ email });
        } else if (role === "farmer") {
            user = await farmerModel.findOne({ email });
        } else if (role === "customer") {
            user = await customerModel.findOne({ email });
        }

        if (!user) {
            return res.status(400).json({ message: `${role} not found` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = generateToken(user, role);

        // Set cookie with specific options
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Send response after cookie is set
        return res.status(200).json({
            success: true,
            message: "Login successful",
            role: role,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
}

module.exports = login;