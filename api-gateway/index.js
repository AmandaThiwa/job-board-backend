import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// --- Swagger Imports ---
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: true, 
    credentials: true 
}));

// --- Setup Swagger UI ---
// Read the JSON file synchronously using fs to avoid ES Module import warnings
const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('./swagger.json'), 'utf-8')
);

// Serve the Swagger UI on the /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Microservice Routing ---

app.use(createProxyMiddleware({ 
    target: 'http://localhost:3001', 
    changeOrigin: true,
    pathFilter: '/api/auth' 
}));

app.use(createProxyMiddleware({ 
    target: 'http://localhost:3002', 
    changeOrigin: true,
    pathFilter: '/api/jobs'
}));

app.use(createProxyMiddleware({ 
    target: 'http://localhost:3003', 
    changeOrigin: true,
    pathFilter: '/api/applications'
}));

app.use(createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true,
    pathFilter: '/api/interviews'
}));

app.use(createProxyMiddleware({ 
    target: 'http://localhost:3005', 
    changeOrigin: true,
    pathFilter: '/api/notifications'
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running smoothly! 🚀 Check /api-docs for Swagger UI.');
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
    console.log(`📄 Swagger Documentation available at http://localhost:${PORT}/api-docs`);
});