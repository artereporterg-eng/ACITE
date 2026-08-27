import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const pubs = db.prepare('SELECT * FROM publications ORDER BY year DESC, id DESC').all();
      return res.json(pubs);
    }

    if (method === 'POST') {
      const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn, doi } = req.body;
      const result = db.prepare(`
        INSERT INTO publications (title, authors, year, publication_type, abstract, download_url, cover_url, isbn, doi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, authors, year || new Date().getFullYear(), publication_type || 'Livro', abstract || '', download_url || '', cover_url || '', isbn || '', doi || '');
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Publicação registada com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { title, authors, year, publication_type, abstract, download_url, cover_url, isbn, doi } = req.body;
      db.prepare(`
        UPDATE publications SET
          title = ?, authors = ?, year = ?, publication_type = ?, abstract = ?,
          download_url = ?, cover_url = ?, isbn = ?, doi = ?
        WHERE id = ?
      `).run(title, authors, year, publication_type, abstract, download_url, cover_url, isbn, doi, id);
      return res.json({ success: true, message: 'Publicação actualizada!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM publications WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Publicação eliminada com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
