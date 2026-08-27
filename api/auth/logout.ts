import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  res.clearCookie('acite_token');
  return res.json({ success: true, message: 'Sessão terminada com sucesso.' });
}
