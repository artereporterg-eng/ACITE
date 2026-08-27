import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Sessão não autenticada.' });
    }

    const freshUser = db.prepare('SELECT id, username, name, email, role, category, department, phone, status, avatar_url, last_login_at FROM users WHERE id = ?').get(req.user.id);
    if (!freshUser) {
      return res.status(401).json({ error: 'Utilizador não encontrado.' });
    }

    return res.json({ user: freshUser });
  });
}
