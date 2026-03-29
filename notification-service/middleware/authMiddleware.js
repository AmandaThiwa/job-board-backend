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