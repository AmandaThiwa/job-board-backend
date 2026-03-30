import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS so the frontend can communicate with the gateway and send cookies
app.use(cors({
    origin: true, 
    credentials: true 
}));

// --- Microservice Routing (v3.0.5 Best Practice) ---

// 1. Route to Auth Service
app.use(createProxyMiddleware({ 
    target: 'http://localhost:3001', 
    changeOrigin: true,
    pathFilter: '/api/auth' // <--- This safely filters the route without breaking the URL!
}));

// 2. Route to Job Service
app.use(createProxyMiddleware({ 
    target: 'http://localhost:3002', 
    changeOrigin: true,
    pathFilter: '/api/jobs'
}));

// 3. Route to Application Service
app.use(createProxyMiddleware({ 
    target: 'http://localhost:3003', 
    changeOrigin: true,
    pathFilter: '/api/applications'
}));

// 4. Route to Interview Service
app.use(createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true,
    pathFilter: '/api/interviews'
}));

// 5. Route to Notification Service
app.use(createProxyMiddleware({ 
    target: 'http://localhost:3005', 
    changeOrigin: true,
    pathFilter: '/api/notifications'
}));

// Base route to check if gateway is alive
app.get('/', (req, res) => {
    res.send('API Gateway is running smoothly! 🚀');
});

// Start the Gateway
app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
    console.log(`➡️  Routing traffic for Auth, Jobs, Applications, Interviews, and Notifications`);
});