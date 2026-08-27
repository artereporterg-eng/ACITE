import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const features = db.prepare('SELECT * FROM features ORDER BY order_index ASC, id ASC').all();
      return res.json(features);
    }

    if (method === 'POST') {
      const { step_number, title, description, order_index } = req.body;
      const result = db.prepare(`
        INSERT INTO features (step_number, title, description, order_index)
        VALUES (?, ?, ?, ?)
      `).run(step_number || '01', title, description, order_index || 0);
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Diferencial adicionado!' });
    }

    if (method === 'PUT' && id) {
      const { step_number, title, description, order_index } = req.body;
      db.prepare(`
        UPDATE features SET
          step_number = ?, title = ?, description = ?, order_index = ?
        WHERE id = ?
      `).run(step_number, title, description, order_index, id);
      return res.json({ success: true, message: 'Diferencial actualizado!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM features WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Diferencial eliminado!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
