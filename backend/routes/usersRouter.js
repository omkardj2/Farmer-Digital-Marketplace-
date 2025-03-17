const express = require("express");
const router = express.Router();
const customerModel = require("../models/customerModel");
const farmerModel = require("../models/farmerModel");
const jwt = require('jsonwebtoken');

router.get("/profile", async function(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (jwtErr) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        let user;
        if (decoded.role === "customer") {
            user = await customerModel.findById(decoded.id);
        } else if (decoded.role === "farmer") {
            user = await farmerModel.findById(decoded.id);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error in /profile route:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;