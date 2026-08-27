import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const events = db.prepare('SELECT * FROM events ORDER BY event_date ASC, id ASC').all();
      return res.json(events);
    }

    if (method === 'POST') {
      const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
      const result = db.prepare(`
        INSERT INTO events (title, event_date, event_time, location, description, category, registration_url, image_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, event_date, event_time || '', location || '', description || '', category || 'Conferência', registration_url || '', image_url || '', is_active ?? 1);
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Evento criado com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { title, event_date, event_time, location, description, category, registration_url, image_url, is_active } = req.body;
      db.prepare(`
        UPDATE events SET
          title = ?, event_date = ?, event_time = ?, location = ?, description = ?,
          category = ?, registration_url = ?, image_url = ?, is_active = ?
        WHERE id = ?
      `).run(title, event_date, event_time, location, description, category, registration_url, image_url, is_active ? 1 : 0, id);
      return res.json({ success: true, message: 'Evento actualizado com sucesso!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM events WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Evento eliminado com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
