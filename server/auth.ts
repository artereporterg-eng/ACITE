import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'acite-secure-admin-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    category?: string;
    department?: string;
    phone?: string;
    status?: string;
    avatar_url?: string;
  };
}

export function generateToken(user: { 
  id: number; 
  username: string; 
  name: string; 
  email: string; 
  role: string;
  category?: string;
  department?: string;
}) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.acite_token) {
      token = req.cookies.acite_token;
    }

    if (!token) {
      res.status(401).json({ error: 'Não autorizado. Faça login para aceder a esta área.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      name: string;
      email: string;
      role: string;
      category?: string;
      department?: string;
    };

    // Verify user still exists in db and check status
    const user = await db.get(
      'SELECT id, username, name, email, role, category, department, phone, status, avatar_url FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      res.status(401).json({ error: 'Utilizador não encontrado ou sessão expirada.' });
      return;
    }

    if (user.status && user.status === 'Inativo') {
      res.status(403).json({ error: 'Esta conta de utilizador foi desactivada. Contacte o administrador.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}
