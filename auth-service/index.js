import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true, 
    credentials: true // Required to allow cookies to be sent/received
}));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB (Auth Service)'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Exit if database connection fails to prevent runtime ghost errors
    });

// --- User Model ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['company', 'seeker'], required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- Endpoints ---

// 1. Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }
        if (role !== 'company' && role !== 'seeker') {
            return res.status(400).json({ error: 'Role must be company or seeker' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Login and create JWT cookie
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set JWT as an HttpOnly cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true if using HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: 'Logged in successfully', role: user.role });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Get current user profile (Validates the JWT cookie)
app.get('/me', (req, res) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.status(200).json({ 
            user: { id: decoded.id, username: decoded.username, role: decoded.role } 
        });
    } catch (error) {
        // If token is invalid or expired
        return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
});

// 4. Logout (Clears the cookie)
app.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logged out successfully' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`✅ Auth Service is running locally on http://localhost:${PORT}`);
});