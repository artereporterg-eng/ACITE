import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      const result = db.prepare(`
        INSERT INTO contact_messages (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
      `).run(name.trim(), email.trim(), phone || '', subject.trim(), message.trim());

      return res.json({
        success: true,
        id: result.lastInsertRowid,
        message: 'Mensagem enviada com sucesso! Responderemos o mais breve possível.',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao enviar mensagem.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
