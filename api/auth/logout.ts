import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearCookieHeader } from '../../lib/auth.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', clearCookieHeader());
  return res.status(200).json({ ok: true });
}
