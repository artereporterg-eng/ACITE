import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    if (req.method === 'GET') {
      const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
      const settings: Record<string, string> = {};
      rows.forEach((r) => (settings[r.key] = r.value));
      return res.json(settings);
    }

    if (req.method === 'PUT') {
      try {
        const settings = req.body;
        const updateStmt = db.prepare(`
          INSERT INTO site_settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);

        const updateMany = db.transaction((entries: [string, any][]) => {
          for (const [key, value] of entries) {
            updateStmt.run(key, String(value));
          }
        });

        updateMany(Object.entries(settings));
        return res.json({ success: true, message: 'Definições do portal actualizadas com sucesso!' });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
