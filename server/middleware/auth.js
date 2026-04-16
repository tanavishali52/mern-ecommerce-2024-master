const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

exports.optionalAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

exports.adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No auth token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
        req.user = decoded;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};