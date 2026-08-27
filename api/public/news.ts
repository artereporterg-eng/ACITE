import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

export default async function handler(req: Request, res: Response) {
  const { slug } = req.query as { slug?: string };

  if (req.method === 'GET') {
    if (slug) {
      const article = db.prepare('SELECT * FROM news WHERE slug = ? OR id = ?').get(slug, slug) as any;
      if (!article) {
        return res.status(404).json({ error: 'Notícia não encontrada.' });
      }
      db.prepare('UPDATE news SET views = views + 1 WHERE id = ?').run(article.id);
      return res.json(article);
    }
    const news = db.prepare('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 12').all();
    return res.json(news);
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
