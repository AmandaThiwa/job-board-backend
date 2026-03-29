import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import applicationRoutes from './routes/applicationRoutes.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true 
}));

app.use('/api/applications', applicationRoutes);

app.listen(PORT, () => {
    console.log(`✅ Application Service running on http://localhost:${PORT}`);
});