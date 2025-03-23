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
        if (role === "farmer") {
            const farmer = await farmerModel.findOne({ email });
            if (!farmer) {
                return res.status(400).json({ message: "Farmer not found" });
            }

            const isMatch = await bcrypt.compare(password, farmer.password);
            if (isMatch) {
                const token = generateToken(farmer);
                res.cookie("authToken", token, {
                    httpOnly: false,
                    sameSite: 'Lax', // Works for local development over HTTP
                    secure: false, // Set to true in production (HTTPS)
                    path: '/',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.status(200).json({ message: "Login successful", role: "farmer" });
            } else {
                return res.status(400).json({ message: "Invalid email or password" });
            }
        } else if (role === "customer") {
            const customer = await customerModel.findOne({ email });
            if (!customer) {
                return res.status(400).json({ message: "Customer not found" });
            }

            const isMatch = await bcrypt.compare(password, customer.password);
            if (isMatch) {
                const token = generateToken(customer);
                res.cookie("authToken", token, {
                    httpOnly: true,
                    sameSite: 'Lax',
                    secure: false,
                    path: '/',
                    maxAge: 24 * 60 * 60 * 1000
                });
                return res.status(200).json({ message: "Login successful", role: "customer" });
            } else {
                return res.status(400).json({ message: "Invalid email or password" });
            }
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
}

module.exports = login;