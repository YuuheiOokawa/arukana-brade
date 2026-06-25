/**
 * POST /api/summon/save
 * ガチャ結果を DB に保存する
 *
 * [DB SAVE] OwnedUnit (新規ユニット) + SummonHistory (履歴) + Player.diamond 更新
 *
 * 呼び出しタイミング:
 *   - SummonPage: ガチャ演出開始直前（processSummonResults 実行後）
 *   - TutorialGachaScreen: 初回ガチャ完了後
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

interface SummonUnit {
  masterId: string;
  rarity: string;     // 'N' | 'R' | 'SR' | 'SSR'
  resultType: string; // 'new' | 'awakening' | 'crystal'
}

interface SaveBody {
  poolId: string;
  units: SummonUnit[];
  diamondSpent?: number;  // ダイヤ消費量（チケットの場合は 0）
  ticketUsed?: number;    // チケット使用枚数
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as SaveBody;
  if (!body?.units?.length) return res.status(400).json({ error: 'units required' });

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // [DB SAVE] OwnedUnit: new ユニットのみ DB に追加（awakening/crystal は既存レコードを更新すべきだが簡略化）
    const newUnits = body.units.filter(u => u.resultType === 'new');
    if (newUnits.length > 0) {
      await tx.ownedUnit.createMany({
        data: newUnits.map(u => ({
          playerId: player.playerId,
          masterId: u.masterId,
          level: 1,
          exp: 0,
          awakenRank: 0,
          awakeningCount: 0,
          currentRarity: u.rarity === 'SSR' ? '3' : u.rarity === 'SR' ? '2' : '1',
          isLocked: false,
          acquiredAt: now,
        })),
      });
    }

    // [DB SAVE] SummonHistory: 全結果を記録
    await tx.summonHistory.createMany({
      data: body.units.map(u => ({
        playerId: player.playerId,
        poolId: body.poolId,
        masterId: u.masterId,
        rarity: u.rarity,
        resultType: u.resultType,
        pulledAt: now,
      })),
    });

    // [DB SAVE] Player.diamond 更新（ダイヤ消費分を差し引き）
    if (body.diamondSpent && body.diamondSpent > 0) {
      await tx.player.update({
        where: { playerId: player.playerId },
        data: { diamond: { decrement: body.diamondSpent } },
      });
    }
  });

  return res.status(200).json({ ok: true, saved: body.units.length });
}
