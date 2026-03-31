import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

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

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('./swagger.json'), 'utf-8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Auth Service running on http://localhost:${PORT}`);
});