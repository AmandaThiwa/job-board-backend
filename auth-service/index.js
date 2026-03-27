import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Helps parse form data
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true 
}));

// Routes
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Auth Service running on http://localhost:${PORT}`);
});