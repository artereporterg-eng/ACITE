import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };

    if (method === 'GET') {
      const courses = db.prepare('SELECT * FROM courses ORDER BY id DESC').all();
      return res.json(courses);
    }

    if (method === 'POST') {
      const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
      const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const result = db.prepare(`
        INSERT INTO courses (title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, courseSlug, category, degree || '', duration || '', modality || 'Presencial', description || '', syllabus || '', requirements || '', vacancies || 30, image_url || '', featured ? 1 : 0, is_active ?? 1);
      return res.json({ success: true, id: result.lastInsertRowid, message: 'Curso criado com sucesso!' });
    }

    if (method === 'PUT' && id) {
      const { title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured, is_active } = req.body;
      db.prepare(`
        UPDATE courses SET
          title = ?, slug = ?, category = ?, degree = ?, duration = ?, modality = ?,
          description = ?, syllabus = ?, requirements = ?, vacancies = ?, image_url = ?, featured = ?, is_active = ?
        WHERE id = ?
      `).run(title, slug, category, degree, duration, modality, description, syllabus, requirements, vacancies, image_url, featured ? 1 : 0, is_active ? 1 : 0, id);
      return res.json({ success: true, message: 'Curso actualizado com sucesso!' });
    }

    if (method === 'DELETE' && id) {
      db.prepare('DELETE FROM courses WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Curso eliminado com sucesso!' });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
