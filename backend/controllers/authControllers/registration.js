const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const customerModel = require("../../models/customerModel");
const farmerModel = require("../../models/farmerModel");
const generateToken = require('../../utils/generateToken');

async function register(req , res){
    let { firstName, lastName, email, password, contact, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let existing;
        let user;
        if (role === "farmer") {
            existing = await farmerModel.findOne({ email });
            if (existing) return res.status(400).json({ message: "User already exists" });

            const hash = await bcrypt.hash(password, 10);
            user = await farmerModel.create({
                firstName,
                lastName,
                email,
                password: hash,
                contact,
                profilepic: '../../uploads/profiles/avatar.png'
            });
        } else if (role === "customer") {
            existing = await customerModel.findOne({ email });
            if (existing) return res.status(400).json({ message: "User already exists" });

            const hash = await bcrypt.hash(password, 10);
            user = await customerModel.create({
                firstName,
                lastName,
                email,
                password: hash,
                contact,
                profilepic: '../../uploads/profiles/avatar.png'
            });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        const token = generateToken(user, role);

        // ✅ Set cookie properly
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false, // use true in production
            sameSite: 'Lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({ message: 'Registration successful' });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = register;
