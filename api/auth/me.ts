import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { player: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  return res.status(200).json({
    user: { id: user.id, email: user.email },
    player: user.player,
  });
}
