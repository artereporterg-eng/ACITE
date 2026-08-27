import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    try {
      const { email, full_name } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Por favor, introduza um endereço de e-mail válido.' });
      }

      db.prepare(`
        INSERT INTO newsletter_subscribers (email, full_name)
        VALUES (?, ?)
        ON CONFLICT(email) DO UPDATE SET is_active = 1
      `).run(email.trim().toLowerCase(), full_name ? full_name.trim() : null);

      return res.json({
        success: true,
        message: 'Subscrição da newsletter da ACITE efectuada com sucesso!',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao subscrever newsletter.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
