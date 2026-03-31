import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import interviewRoutes from './routes/interviewRoutes.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('./swagger.json'), 'utf-8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/interviews', interviewRoutes);

app.listen(PORT, () => {
    console.log(`✅ Interview Service running on http://localhost:${PORT}`);
});