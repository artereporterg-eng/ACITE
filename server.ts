import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db.js';
import apiRouter from './server/routes.js';

async function startServer() {
  // Initialize Database and Seed Data
  initDatabase();

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

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Mount API router
  app.use(apiRouter);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'ACITE Portal & CMS Backend', timestamp: new Date().toISOString() });
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
    console.log(`🔐 Admin credentials: Username="admin" | Password="admin"`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
});
