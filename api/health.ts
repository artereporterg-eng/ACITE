import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  return res.json({
    status: 'ok',
    name: 'ACITE Portal & CMS Backend',
    timestamp: new Date().toISOString(),
    version: '5.0.0',
    platform: 'Node / Serverless Express'
  });
}
