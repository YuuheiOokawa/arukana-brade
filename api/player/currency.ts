/**
 * POST /api/player/currency
 * プレイヤーの通貨・経験値・スタミナをDBに同期する
 *
 * [DB SAVE] Player (gold, diamond, exp, rank, stamina, maxStamina)
 *
 * 呼び出しタイミング:
 *   - TutorialCompleteScreen: チュートリアル完了後（初期リソース付与）
 *   - BattlePage: バトル勝利後（EXP・ゴールド・スタミナ変動）
 *   - 定期的な自動保存（将来対応）
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

interface CurrencyBody {
  gold?: number;
  diamond?: number;
  exp?: number;
  playerRank?: number;
  stamina?: number;
  maxStamina?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as CurrencyBody;

  const updateData: Record<string, number> = {};
  if (typeof body.gold === 'number' && body.gold >= 0) updateData.gold = body.gold;
  if (typeof body.diamond === 'number' && body.diamond >= 0) updateData.diamond = body.diamond;
  if (typeof body.exp === 'number' && body.exp >= 0) updateData.exp = body.exp;
  if (typeof body.playerRank === 'number' && body.playerRank >= 1) updateData.playerRank = body.playerRank;
  if (typeof body.stamina === 'number' && body.stamina >= 0) updateData.stamina = body.stamina;
  if (typeof body.maxStamina === 'number' && body.maxStamina >= 0) updateData.maxStamina = body.maxStamina;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: '更新するデータがありません' });
  }

  const updated = await prisma.player.update({
    where: { playerId: player.playerId },
    data: updateData,
  });

  return res.status(200).json({ player: updated });
}
