import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

export default async function handler(req: Request, res: Response) {
  const { slug } = req.query as { slug?: string };

  if (req.method === 'GET') {
    if (slug) {
      const course = db.prepare('SELECT * FROM courses WHERE slug = ? OR id = ?').get(slug, slug);
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado.' });
      }
      return res.json(course);
    }
    const courses = db.prepare('SELECT * FROM courses WHERE is_active = 1 ORDER BY featured DESC, id ASC').all();
    return res.json(courses);
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
