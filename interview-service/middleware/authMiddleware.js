import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    let token = req.cookies.jwt;
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

export const seekerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'seeker') next();
    else res.status(403).json({ error: 'Only job seekers can perform this action' });
};

export const companyOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'company' || req.user.role === 'admin')) next();
    else res.status(403).json({ error: 'Only companies can perform this action' });
};