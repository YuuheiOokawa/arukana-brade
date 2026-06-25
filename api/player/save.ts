import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

interface SaveBody {
  playerName?: string;
  tutorialCompleted?: boolean;
  title?: string;
  bio?: string;
  favoriteUnitId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { player: true },
  });
  if (!user?.player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as SaveBody;
  const updateData: Record<string, unknown> = {};

  if (typeof body.playerName === 'string' && body.playerName.trim()) {
    updateData.playerName = body.playerName.trim().slice(0, 12);
  }
  if (typeof body.tutorialCompleted === 'boolean') {
    updateData.tutorialCompleted = body.tutorialCompleted;
  }
  if (typeof body.title === 'string') {
    updateData.title = body.title;
  }
  if (typeof body.bio === 'string') {
    updateData.bio = body.bio.slice(0, 100);
  }
  if (typeof body.favoriteUnitId === 'string') {
    updateData.favoriteUnitId = body.favoriteUnitId;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: '更新するデータがありません' });
  }

  const updated = await prisma.player.update({
    where: { playerId: user.player.playerId },
    data: updateData,
  });

  return res.status(200).json({ player: updated });
}
