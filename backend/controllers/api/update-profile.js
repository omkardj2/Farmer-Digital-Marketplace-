const customerModel = require('../../models/customerModel');
const farmerModel = require('../../models/farmerModel');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

module.exports = async function updateProfile(req, res) {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const Model = decoded.role === 'farmer' ? farmerModel : customerModel;

        // Get current user to check for existing profile photo
        const currentUser = await Model.findById(decoded.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare update data
        const updateData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            contact: req.body.contact,
            address: req.body.address
        };

        // Handle profile photo update
        if (req.file) {
            // Delete old profile photo if it exists and isn't the default
            if (currentUser.profilePhoto && 
                !currentUser.profilePhoto.includes('default-avatar.png')) {
                const oldPhotoPath = path.join(__dirname, '..', '..', 
                    currentUser.profilePhoto);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
            updateData.profilePhoto = '/uploads/profiles/' + req.file.filename;
        }

        // Update user
        const updatedUser = await Model.findByIdAndUpdate(
            decoded.id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                contact: updatedUser.contact,
                address: updatedUser.address,
                profilePhoto: updatedUser.profilePhoto
            }
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};