import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

export default generateToken;