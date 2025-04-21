const bcrypt = require('bcryptjs');
const Farmer = require('../../models/farmerModel');
const Customer = require('../../models/customerModel');
const DeliveryPerson = require('../../models/deliveryPersonModel');
const { generateToken } = require('../../utils/generateToken');

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, vehicleNumber, vehicleType } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !password || !role || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Select appropriate model based on role
        let UserModel;
        switch (role.toLowerCase()) {
            case 'farmer':
                UserModel = Farmer;
                break;
            case 'customer':
                UserModel = Customer;
                break;
            case 'delivery':
                UserModel = DeliveryPerson;
                if (!vehicleNumber || !vehicleType) {
                    return res.status(400).json({ error: 'Vehicle details are required for delivery role' });
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            phone
        };

        // Add vehicle details for delivery role
        if (role.toLowerCase() === 'delivery') {
            userData.vehicleNumber = vehicleNumber;
            userData.vehicleType = vehicleType;
        }

        const user = new UserModel(userData);

        // Save user
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return success response
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

module.exports = {
    register
};