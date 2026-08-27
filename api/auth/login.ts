import type { Request, Response } from 'express';
import { db } from '../../server/db.js';
import { generateToken, comparePassword } from '../../server/auth.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Introduza o nome de utilizador e a palavra-passe.' });
    }

    const cleanUsername = String(username).trim();
    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE').get(cleanUsername, cleanUsername) as any;

    if (!user) {
      return res.status(401).json({ error: 'Utilizador ou palavra-passe incorrectos.' });
    }

    if (user.status === 'Inativo') {
      return res.status(403).json({ error: 'Esta conta de utilizador encontra-se inativa. Contacte a administração da ACITE.' });
    }

    const isMatch = comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Utilizador ou palavra-passe incorrectos.' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const tokenPayload = {
      id: user.id,
      username: user.id === 1 ? 'admin' : user.username,
      name: user.name || 'Administrador',
      email: user.email || '',
      role: user.role || 'admin',
      category: user.category || 'Super Administrador',
      department: user.department || 'Direcção Geral',
      phone: user.phone || '',
      status: user.status || 'Ativo',
      avatar_url: user.avatar_url || '',
    };

    const token = generateToken(tokenPayload);

    res.cookie('acite_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      token,
      user: tokenPayload,
      message: `Bem-vindo ao Portal de Gestão ACITE, ${tokenPayload.name}!`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro no início de sessão.' });
  }
}
