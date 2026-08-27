import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    try {
      const totalCourses = db.prepare('SELECT COUNT(*) as c FROM courses').get() as any;
      const totalNews = db.prepare('SELECT COUNT(*) as c FROM news').get() as any;
      const totalEvents = db.prepare('SELECT COUNT(*) as c FROM events').get() as any;
      const totalPublications = db.prepare('SELECT COUNT(*) as c FROM publications').get() as any;
      const totalApplications = db.prepare('SELECT COUNT(*) as c FROM applications').get() as any;
      const pendingApplications = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'Pendente'").get() as any;
      const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get() as any;

      const recentApplications = db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 5').all();
      const recentNews = db.prepare('SELECT id, title, published_at, views, is_published FROM news ORDER BY created_at DESC LIMIT 5').all();

      return res.json({
        stats: {
          courses: totalCourses.c,
          news: totalNews.c,
          events: totalEvents.c,
          publications: totalPublications.c,
          applications: totalApplications.c,
          pendingApplications: pendingApplications.c,
          users: totalUsers.c,
        },
        recentApplications,
        recentNews,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });
}
