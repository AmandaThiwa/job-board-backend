import jwt from 'jsonwebtoken';

// Verifies the user is logged in
export const protect = (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            // Decode the token using the shared secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Contains { userId, role } from the Auth Service!
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// Ensures only companies or admins can manage jobs
export const companyOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'company' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized. Only companies can perform this action.' });
    }
};