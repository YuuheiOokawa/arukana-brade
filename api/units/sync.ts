/**
 * POST /api/units/sync
 * 所持ユニット全件を DB と同期する（完全上書き）
 *
 * [DB SAVE] OwnedUnit 全レコード（DELETE + createMany）
 *
 * 呼び出しタイミング:
 *   - TutorialGachaScreen: 初回ガチャ完了 + チュートリアル終了時
 *   - 将来: 強化・覚醒・レベルアップ後
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

interface UnitRecord {
  masterId: string;
  level: number;
  exp: number;
  awakenRank: number;
  awakeningCount: number;
  currentRarity: string;
  isLocked: boolean;
}

interface SyncBody {
  units: UnitRecord[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as SyncBody;
  if (!Array.isArray(body?.units)) return res.status(400).json({ error: 'units array required' });

  const now = new Date();

  // [DB SAVE] 既存全削除 → 全件再登録（シンプルな完全同期）
  await prisma.$transaction([
    prisma.ownedUnit.deleteMany({ where: { playerId: player.playerId } }),
    prisma.ownedUnit.createMany({
      data: body.units.map(u => ({
        playerId: player.playerId,
        masterId: u.masterId,
        level: u.level,
        exp: u.exp,
        awakenRank: u.awakenRank,
        awakeningCount: u.awakeningCount,
        currentRarity: String(u.currentRarity),
        isLocked: u.isLocked,
        acquiredAt: now,
      })),
    }),
  ]);

  return res.status(200).json({ ok: true, synced: body.units.length });
}
