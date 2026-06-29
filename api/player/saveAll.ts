/**
 * POST /api/player/saveAll
 * 全ゲーム状態をDBに一括保存する
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

// ゲームバランス上の上限値（チート防止）
const MAX_GOLD       = 999_999_999;
const MAX_DIAMOND    = 999_999;
const MAX_STAMINA    = 999;
const MAX_RANK       = 200;
const MAX_STATE_BYTES = 500_000; // 500KB 上限

interface PlayerSnapshot {
  name?: unknown;
  rank?: unknown;
  exp?: unknown;
  gold?: unknown;
  diamond?: unknown;
  stamina?: unknown;
  maxStamina?: unknown;
  title?: unknown;
}

interface GameStateBody {
  state: Record<string, unknown>;
}

const clampInt = (v: unknown, min: number, max: number): number | undefined => {
  if (typeof v !== 'number' || !isFinite(v)) return undefined;
  return Math.max(min, Math.min(max, Math.floor(v)));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as GameStateBody;
  if (!body?.state || typeof body.state !== 'object' || Array.isArray(body.state)) {
    return res.status(400).json({ error: 'state object required' });
  }

  // ペイロードサイズチェック
  const stateStr = JSON.stringify(body.state);
  if (stateStr.length > MAX_STATE_BYTES) {
    return res.status(413).json({ error: 'state too large' });
  }

  const { state } = body;
  const p = state.player as PlayerSnapshot | undefined;

  // 正規化カラム（サーバー側で範囲チェック・クランプ）
  const updateData: Record<string, unknown> = {
    gameStateJson: state,
    updatedAt: new Date(),
  };

  if (p && typeof p === 'object') {
    const name = typeof p.name === 'string' ? p.name.slice(0, 20).trim() : undefined;
    if (name) updateData.playerName = name;

    const rank = clampInt(p.rank, 1, MAX_RANK);
    if (rank !== undefined) updateData.playerRank = rank;

    const exp = clampInt(p.exp, 0, 999_999_999);
    if (exp !== undefined) updateData.exp = exp;

    const gold = clampInt(p.gold, 0, MAX_GOLD);
    if (gold !== undefined) updateData.gold = gold;

    const diamond = clampInt(p.diamond, 0, MAX_DIAMOND);
    if (diamond !== undefined) updateData.diamond = diamond;

    const stamina = clampInt(p.stamina, 0, MAX_STAMINA);
    if (stamina !== undefined) updateData.stamina = stamina;

    const maxStamina = clampInt(p.maxStamina, 1, MAX_STAMINA);
    if (maxStamina !== undefined) updateData.maxStamina = maxStamina;

    if (typeof p.title === 'string') updateData.title = p.title.slice(0, 50);
  }

  if (state.tutorialCompleted === true) {
    updateData.tutorialCompleted = true;
  }

  // クランプした値をstateにも反映して保存（DBとJSONの整合性を保つ）
  if (p && typeof p === 'object') {
    const clamped: Record<string, unknown> = { ...p as Record<string, unknown> };
    if (updateData.gold !== undefined) clamped.gold = updateData.gold;
    if (updateData.diamond !== undefined) clamped.diamond = updateData.diamond;
    if (updateData.stamina !== undefined) clamped.stamina = updateData.stamina;
    if (updateData.playerRank !== undefined) clamped.rank = updateData.playerRank;
    updateData.gameStateJson = { ...state, player: clamped };
  }

  await prisma.player.update({
    where: { playerId: player.playerId },
    data: updateData,
  });

  return res.status(200).json({ ok: true });
}
