require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

async function createAdmin() {
    try {
        // Check if MongoDB URI exists
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ 
            email: process.env.ADMIN_EMAIL || 'admin@greenbasket.com' 
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Create admin
        let hashedPassword=await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
       

        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL || 'admin@greenbasket.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
        });

        console.log('Admin created successfully:', {
            email: admin.email,
            role: admin.role,
            id: admin._id
        });

    } catch (error) {
        console.error('Error creating admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdmin();