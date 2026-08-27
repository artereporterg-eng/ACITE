import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const news = db.prepare('SELECT * FROM news ORDER BY published_at DESC, id DESC').all();
      return res.json(news);
    }

    if (method === 'POST') {
      const { title, slug, category, excerpt, content, image_url, author, published_at, is_published } = req.body;
      const newsSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const result = db.prepare(`
        INSERT INTO news (title, slug, category, excerpt, content, image_url, author, published_at, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, newsSlug, category || 'Notícias', excerpt || '', content || '', image_url || '', author || 'Redacção ACITE', published_at || new Date().toISOString().split('T')[0], is_published ? 1 : 0);
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Notícia publicada com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { title, slug, category, excerpt, content, image_url, author, published_at, is_published } = req.body;
      db.prepare(`
        UPDATE news SET
          title = ?, slug = ?, category = ?, excerpt = ?, content = ?, image_url = ?, author = ?, published_at = ?, is_published = ?
        WHERE id = ?
      `).run(title, slug, category, excerpt, content, image_url, author, published_at, is_published ? 1 : 0, id);
      return res.json({ success: true, message: 'Notícia actualizada com sucesso!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM news WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Notícia eliminada com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
