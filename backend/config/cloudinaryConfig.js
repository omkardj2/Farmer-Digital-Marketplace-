// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2; // Ensure `.v2` is used
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product-images', // Folder name in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

module.exports = { cloudinary, storage };
