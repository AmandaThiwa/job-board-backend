import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes - verifies the token
export const protect = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach the user object to the request (excluding the password)
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// Admin middleware - checks if the user is an admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};