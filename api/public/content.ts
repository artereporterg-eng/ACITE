import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

/**
 * Serverless Handler: /api/public/content
 * Retorna todo o conteúdo público necessário para carregar a página inicial da ACITE:
 * - Definições globais do portal
 * - Slides do Hero Slider
 * - Cursos em destaque e activos
 * - Notícias e comunicados recentes
 * - Próximos eventos e conferências
 * - Publicações e livros científicos
 * - Diferenciais institucionais
 * - Páginas institucionais
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Utilize GET.' });
  }

  try {
    // 1. Settings object
    const settingsRows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    settingsRows.forEach((r) => {
      settings[r.key] = r.value;
    });

    // 2. Hero slides
    const heroSlides = db.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY order_index ASC').all();

    // 3. Courses
    const courses = db.prepare('SELECT * FROM courses WHERE is_active = 1 ORDER BY featured DESC, id ASC').all();

    // 4. News
    const news = db.prepare('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT 6').all();

    // 5. Events
    const events = db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY event_date ASC LIMIT 6').all();

    // 6. Publications
    const publications = db.prepare('SELECT * FROM publications ORDER BY year DESC, id DESC LIMIT 6').all();

    // 7. Features
    const features = db.prepare('SELECT * FROM features ORDER BY order_index ASC, id ASC').all();

    // 8. Pages
    const pages = db.prepare('SELECT id, slug, title, content, meta_description FROM pages').all();

    return res.json({
      settings,
      heroSlides,
      courses,
      news,
      events,
      publications,
      features,
      pages,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao carregar dados da ACITE.' });
  }
}
