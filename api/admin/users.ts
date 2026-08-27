import type { Response } from 'express';
import { db } from '../../server/db.js';
import { authMiddleware, AuthRequest, hashPassword } from '../../server/auth.js';
import { USER_CATEGORIES } from '../../server/routes.js';

export default async function handler(req: AuthRequest, res: Response) {
  authMiddleware(req, res, () => {
    const { method } = req;
    const { id } = req.query as { id?: string };
    const targetId = id ? parseInt(id, 10) : null;

    // GET /api/admin/users
    if (method === 'GET') {
      try {
        const { search, category, role, status } = req.query as Record<string, string>;
        let query = `
          SELECT id, username, name, email, role, category, department, phone, status, avatar_url, last_login_at, created_at, updated_at
          FROM users
          WHERE 1=1
        `;
        const params: any[] = [];

        if (search) {
          query += ` AND (username LIKE ? OR name LIKE ? OR email LIKE ? OR department LIKE ? OR phone LIKE ?)`;
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        if (category && category !== 'all') {
          query += ` AND category = ?`;
          params.push(category);
        }

        if (role && role !== 'all') {
          query += ` AND role = ?`;
          params.push(role);
        }

        if (status && status !== 'all') {
          query += ` AND status = ?`;
          params.push(status);
        }

        query += ` ORDER BY id ASC`;

        const users = db.prepare(query).all(...params);
        return res.json({ users, total: users.length, categories: USER_CATEGORIES });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao listar utilizadores.' });
      }
    }

    // POST /api/admin/users
    if (method === 'POST') {
      try {
        const { username, password, name, email, role, category, department, phone, status } = req.body;

        if (!username || !password || !name) {
          return res.status(400).json({ error: 'Nome de utilizador, palavra-passe e nome completo são obrigatórios.' });
        }

        const cleanUsername = String(username).trim().toLowerCase();
        if (cleanUsername.length < 3) {
          return res.status(400).json({ error: 'O nome de utilizador deve ter pelo menos 3 caracteres.' });
        }

        if (password.length < 3) {
          return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 3 caracteres.' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(cleanUsername);
        if (existing) {
          return res.status(400).json({ error: `O nome de utilizador "${cleanUsername}" já se encontra registado.` });
        }

        if (email && email.trim()) {
          const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
          if (existingEmail) {
            return res.status(400).json({ error: `O e-mail "${email}" já se encontra em uso por outra conta.` });
          }
        }

        const hash = hashPassword(password);
        const matchedCategory = USER_CATEGORIES.find(c => c.name === category || c.id === role);
        const finalRole = role || matchedCategory?.role || 'admin';
        const finalCategory = category || matchedCategory?.name || 'Super Administrador';
        const finalDepartment = department || matchedCategory?.defaultDepartment || 'Direcção Geral';
        const finalStatus = status || 'Ativo';

        const result = db.prepare(`
          INSERT INTO users (username, password_hash, name, email, role, category, department, phone, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          cleanUsername, 
          hash, 
          name.trim(), 
          email ? email.trim() : '', 
          finalRole, 
          finalCategory, 
          finalDepartment, 
          phone ? phone.trim() : '', 
          finalStatus
        );

        const newUser = db.prepare('SELECT id, username, name, email, role, category, department, phone, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

        return res.status(201).json({ 
          success: true, 
          id: result.lastInsertRowid, 
          message: `Utilizador ${name} adicionado com sucesso na categoria "${finalCategory}"!`,
          user: newUser
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao criar utilizador.' });
      }
    }

    // PUT /api/admin/users/:id
    if (method === 'PUT' && targetId) {
      try {
        const { name, email, role, category, department, phone, status, new_password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId) as any;
        if (!user) {
          return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        if (user.username === 'admin' && status === 'Inativo') {
          return res.status(400).json({ error: 'Não é permitido desactivar a conta principal de administração (admin).' });
        }

        if (new_password) {
          if (new_password.length < 3) {
            return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 3 caracteres.' });
          }
          const newHash = hashPassword(new_password);
          db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, targetId);
        }

        if (email && email !== user.email) {
          const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, targetId);
          if (existingEmail) {
            return res.status(400).json({ error: 'O endereço de e-mail já está associado a outra conta.' });
          }
        }

        const matchedCategory = USER_CATEGORIES.find(c => c.name === category || c.id === role);
        const finalCategory = category !== undefined ? category : (user.category || 'Super Administrador');
        const finalRole = role !== undefined ? role : (matchedCategory?.role || user.role || 'admin');
        const finalDepartment = department !== undefined ? department : (user.department || 'Direcção Geral');
        const finalStatus = status !== undefined ? status : (user.status || 'Ativo');

        db.prepare(`
          UPDATE users 
          SET name = COALESCE(?, name),
              email = COALESCE(?, email),
              role = ?,
              category = ?,
              department = ?,
              phone = COALESCE(?, phone),
              status = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          name || user.name,
          email !== undefined ? email : user.email,
          finalRole,
          finalCategory,
          finalDepartment,
          phone !== undefined ? phone : user.phone,
          finalStatus,
          targetId
        );

        const updated = db.prepare('SELECT id, username, name, email, role, category, department, phone, status, updated_at FROM users WHERE id = ?').get(targetId);
        return res.json({ success: true, message: 'Utilizador actualizado com sucesso!', user: updated });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao actualizar utilizador.' });
      }
    }

    // DELETE /api/admin/users/:id
    if (method === 'DELETE' && targetId) {
      try {
        const user = db.prepare('SELECT id, username, name FROM users WHERE id = ?').get(targetId) as any;
        if (!user) {
          return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        if (user.username === 'admin' || targetId === 1) {
          return res.status(400).json({ error: 'A conta principal de administração (admin) é protegida e não pode ser eliminada.' });
        }

        if (targetId === req.user!.id) {
          return res.status(400).json({ error: 'Não pode eliminar a sua própria conta em sessão.' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
        return res.json({ success: true, message: `Utilizador "${user.name}" eliminado com sucesso.` });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao eliminar utilizador.' });
      }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  });
}
