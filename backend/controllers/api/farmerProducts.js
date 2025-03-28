const productModel = require('../../models/productModel');
const farmerModel = require('../../models/farmerModel');
const jwt = require('jsonwebtoken');

module.exports = async function getProducts(req, res) {
    try {
        const authToken = req.cookies.authToken;

        if (!authToken) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(authToken, process.env.JWT_KEY);
        } catch (jwtErr) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Get farmer with populated products
        const farmer = await farmerModel.findById(decoded.id)
            .populate({
                path: 'products',
                model: 'product',
                select: 'name image description price quantity' // Specify fields you want
            });

        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }

        // Send the populated products array
        res.json(farmer.products);

    } catch (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};
