/**
 * POST /api/player/saveAll
 * 全ゲーム状態をDBに一括保存する
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

interface PlayerSnapshot {
  name?: string;
  rank?: number;
  exp?: number;
  gold?: number;
  diamond?: number;
  stamina?: number;
  maxStamina?: number;
  title?: string;
  bio?: string;
}

interface GameStateBody {
  state: {
    player?: PlayerSnapshot;
    tutorialCompleted?: boolean;
    [key: string]: unknown;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as GameStateBody;
  if (!body?.state || typeof body.state !== 'object') {
    return res.status(400).json({ error: 'state object required' });
  }

  const { state } = body;
  const p = state.player;

  const updateData: Record<string, unknown> = {
    gameStateJson: state,
    updatedAt: new Date(),
  };

  // 正規化カラムも同時更新（インデックス活用・ランキング用）
  if (p) {
    if (typeof p.name === 'string' && p.name) updateData.playerName = p.name;
    if (typeof p.rank === 'number' && p.rank >= 1) updateData.playerRank = p.rank;
    if (typeof p.exp === 'number' && p.exp >= 0) updateData.exp = p.exp;
    if (typeof p.gold === 'number' && p.gold >= 0) updateData.gold = p.gold;
    if (typeof p.diamond === 'number' && p.diamond >= 0) updateData.diamond = p.diamond;
    if (typeof p.stamina === 'number' && p.stamina >= 0) updateData.stamina = p.stamina;
    if (typeof p.maxStamina === 'number' && p.maxStamina >= 0) updateData.maxStamina = p.maxStamina;
    if (typeof p.title === 'string') updateData.title = p.title;
  }

  if (state.tutorialCompleted === true) {
    updateData.tutorialCompleted = true;
  }

  await prisma.player.update({
    where: { playerId: player.playerId },
    data: updateData,
  });

  return res.status(200).json({ ok: true });
}
