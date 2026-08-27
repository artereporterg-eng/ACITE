import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const media = db.prepare('SELECT * FROM media_library ORDER BY created_at DESC').all();
      return res.json(media);
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM media_library WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Ficheiro eliminado da biblioteca.' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
