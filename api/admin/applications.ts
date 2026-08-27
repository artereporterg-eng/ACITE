import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const apps = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
      return res.json(apps);
    }

    if (method === 'PUT' && id) {
      const { status, notes, reviewed_by } = req.body;
      db.prepare(`
        UPDATE applications SET
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          reviewed_by = COALESCE(?, reviewed_by),
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, notes, reviewed_by, id);
      return res.json({ success: true, message: 'Estado da candidatura actualizado!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM applications WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Candidatura eliminada com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
