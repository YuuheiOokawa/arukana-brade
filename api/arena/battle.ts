import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

const MAX_POINTS_PER_WIN = 50;
const MAX_GOLD_PER_WIN = 5000;
const MAX_DIAMOND_PER_WIN = 5;
const LOSS_POINT_PENALTY = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findFirst({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as { won?: boolean; pointsGained?: number; goldReward?: number; diamondReward?: number };
  const won = Boolean(body.won);
  const pointsGained = Math.min(Math.max(0, Number(body.pointsGained) || 0), MAX_POINTS_PER_WIN);
  const goldReward = Math.min(Math.max(0, Number(body.goldReward) || 0), MAX_GOLD_PER_WIN);
  const diamondReward = Math.min(Math.max(0, Number(body.diamondReward) || 0), MAX_DIAMOND_PER_WIN);

  await prisma.$transaction(async tx => {
    await tx.playerArenaRecord.upsert({
      where: { playerId: player.playerId },
      update: won
        ? { wins: { increment: 1 }, points: { increment: pointsGained } }
        : { losses: { increment: 1 }, points: { decrement: LOSS_POINT_PENALTY } },
      create: {
        playerId: player.playerId,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        points: won ? pointsGained : 0,
      },
    });

    if (goldReward > 0 || diamondReward > 0) {
      await tx.player.update({
        where: { playerId: player.playerId },
        data: {
          gold: { increment: goldReward },
          diamond: { increment: diamondReward },
        },
      });
    }
  });

  return res.status(200).json({ ok: true });
}
