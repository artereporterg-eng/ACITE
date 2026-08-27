import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db.js';
import apiRouter from './server/routes.js';

async function startServer() {
  // Initialize Turso Database and Seed Data
  await initDatabase();

  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads and multimedia directories
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  const multimediaPath = path.join(process.cwd(), 'public', 'multimedia');
  app.use('/multimedia', express.static(multimediaPath));

  // Mount API router
  app.use(apiRouter);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'ACITE Portal & CMS Backend (Turso)', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ACITE Full-Stack Server running on http://localhost:${PORT}`);
    console.log(`🔐 Admin credentials: Username="admin" | Password="123" | Username="fox" | Password="123"`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
});
