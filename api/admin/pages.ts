import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const pages = db.prepare('SELECT * FROM pages ORDER BY id ASC').all();
      return res.json(pages);
    }

    if (method === 'POST') {
      const { slug, title, content, meta_description } = req.body;
      const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const result = db.prepare(`
        INSERT INTO pages (slug, title, content, meta_description)
        VALUES (?, ?, ?, ?)
      `).run(pageSlug, title, content || '', meta_description || '');
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Página criada com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { slug, title, content, meta_description } = req.body;
      db.prepare(`
        UPDATE pages SET
          slug = ?, title = ?, content = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(slug, title, content, meta_description, id);
      return res.json({ success: true, message: 'Página actualizada com sucesso!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM pages WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Página eliminada com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
