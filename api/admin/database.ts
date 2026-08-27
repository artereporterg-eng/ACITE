import type { Response } from 'express';
import { db, dbPath, getDatabaseDiagnostics } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;

    if (method === 'GET') {
      try {
        const diagnostics = getDatabaseDiagnostics(db, dbPath);
        return res.json({
          success: true,
          diagnostics,
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao obter diagnóstico.' });
      }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
