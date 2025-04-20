const jwt = require('jsonwebtoken');

function checkRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const token = req.cookies.authToken;

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const decoded = jwt.verify(token, process.env.JWT_KEY);

            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({
                    message: `Access denied: ${allowedRoles.join(' or ')} only`
                });
            }

            req.user = decoded; // Attach user info to the request object
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
}

module.exports = checkRole;