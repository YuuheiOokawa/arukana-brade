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
    include: {
      player: {
        include: {
          ownedUnits: true,
          playerItems: true,
          ownedEquipments: true,
          questProgress: true,
          parties: true,
          missionProgress: true,
          loginBonus: true,
          arenaRecord: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const player = user.player;
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // 関連テーブルデータを gameData として分離して返す
  const {
    ownedUnits,
    playerItems,
    ownedEquipments,
    questProgress,
    parties,
    missionProgress,
    loginBonus,
    arenaRecord,
    ...playerFields
  } = player;

  // BigInt を number に変換してシリアライズ可能にする
  const playerForJson = {
    ...playerFields,
    staminaRecoveryTime: Number(playerFields.staminaRecoveryTime),
  };

  const ownedUnitsForJson = ownedUnits.map(u => ({
    ...u,
    acquiredAt: Number(u.acquiredAt),
  }));

  return res.status(200).json({
    user: { id: user.id, email: user.email },
    player: playerForJson,
    gameData: {
      ownedUnits: ownedUnitsForJson,
      items: playerItems,
      ownedEquipments,
      questProgress,
      parties,
      missionProgress,
      loginBonus,
      arenaRecord,
    },
  });
}
