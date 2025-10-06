import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './utils/error.js';

const app = express();

// Core middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(cookieParser());

// CORS (credentials because we use httpOnly cookie JWT)
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true
}));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });