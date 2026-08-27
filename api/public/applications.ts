import type { Request, Response } from 'express';
import { db } from '../../server/db.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const {
      full_name,
      email,
      phone,
      identity_card,
      course_id,
      course_title,
      academic_degree,
      graduation_institution,
      notes,
    } = req.body;

    if (!full_name || !email || !phone || !course_title) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios (Nome, Email, Telefone e Curso).' });
    }

    const result = db.prepare(`
      INSERT INTO applications (
        full_name, email, phone, identity_card, course_id, 
        course_title, academic_degree, graduation_institution, notes, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')
    `).run(
      full_name.trim(),
      email.trim(),
      phone.trim(),
      identity_card || '',
      course_id || null,
      course_title,
      academic_degree || 'Licenciatura',
      graduation_institution || '',
      notes || ''
    );

    return res.json({
      success: true,
      application_id: result.lastInsertRowid,
      message: 'Candidatura submetida com sucesso! A comissão académica da ACITE entrará em contacto brevemente.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao submeter candidatura.' });
  }
}
