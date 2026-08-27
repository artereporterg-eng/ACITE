import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest, hashPassword, comparePassword } from '../../server/auth.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Método não permitido. Utilize PUT.' });
    }

    try {
      const userId = req.user!.id;
      const { name, email, username, phone, department, current_password, new_password } = req.body;

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'Para alterar a senha, deve introduzir a senha actual.' });
        }
        if (!comparePassword(current_password, user.password_hash)) {
          return res.status(400).json({ error: 'A senha actual está incorrecta.' });
        }
        if (new_password.length < 4) {
          return res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
        }

        const newHash = hashPassword(new_password);
        db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, userId);
      }

      if (username && username !== user.username) {
        const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
        if (existing) {
          return res.status(400).json({ error: 'Este nome de utilizador já está a ser utilizado por outra conta.' });
        }
      }

      db.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            username = COALESCE(?, username),
            phone = COALESCE(?, phone),
            department = COALESCE(?, department),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name || user.name, 
        email || user.email, 
        username || user.username,
        phone !== undefined ? phone : user.phone,
        department !== undefined ? department : user.department,
        userId
      );

      const updatedUser = db.prepare('SELECT id, username, name, email, role, category, department, phone, status, avatar_url FROM users WHERE id = ?').get(userId);

      return res.json({
        success: true,
        message: 'Perfil e dados actualizados com sucesso!',
        user: updatedUser,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Erro ao actualizar perfil.' });
    }
  });
}
