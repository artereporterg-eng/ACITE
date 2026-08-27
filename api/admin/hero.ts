import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const slides = db.prepare('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC').all();
      return res.json(slides);
    }

    if (method === 'POST') {
      const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
      const result = db.prepare(`
        INSERT INTO hero_slides (badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index || 0, is_active ?? 1);
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Slide adicionado com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active } = req.body;
      db.prepare(`
        UPDATE hero_slides SET
          badge = ?, title = ?, subtitle = ?, image_url = ?, primary_btn_text = ?, 
          primary_btn_link = ?, secondary_btn_text = ?, secondary_btn_link = ?, 
          order_index = ?, is_active = ?
        WHERE id = ?
      `).run(badge, title, subtitle, image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, order_index, is_active, id);
      return res.json({ success: true, message: 'Slide actualizado!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Slide eliminado!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
