const multer = require('multer');

module.exports = function errorHandler(err, req, res, next) {
    console.error(err.stack);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 2MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};