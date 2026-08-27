import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from '../server/db.js';
import apiRouter from '../server/routes.js';

const app = express();

// Enable CORS and cookie parsing
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware to ensure Turso Database is initialized
let isReady = false;
let initPromise: Promise<void> | null = null;

async function ensureDatabase(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isReady) {
      if (!initPromise) {
        initPromise = initDatabase();
      }
      await initPromise;
      isReady = true;
    }
    next();
  } catch (err: any) {
    console.error('Database connection error in serverless handler:', err);
    res.status(500).json({ error: 'Erro de ligação à base de dados Turso/LibSQL.' });
  }
}

app.use(ensureDatabase);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'Vercel Serverless / Turso Database',
    timestamp: new Date().toISOString(),
  });
});

// Mount all API routes
app.use(apiRouter);

// Export Express app as single Vercel Serverless Function
export default app;
