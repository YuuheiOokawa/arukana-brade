import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signToken, setCookieHeader } from '../../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }

  // 全関連テーブルをincludeして一括取得
  const user = await prisma.user.findUnique({
    where: { email },
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
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
  }

  // ログイン日数を更新
  if (user.player) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = new Date(user.player.lastLoginAt);
    lastLogin.setHours(0, 0, 0, 0);
    if (lastLogin < today) {
      await prisma.player.update({
        where: { playerId: user.player.playerId },
        data: {
          loginDays: { increment: 1 },
          lastLoginAt: new Date(),
        },
      });
    }
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.setHeader('Set-Cookie', setCookieHeader(token));

  const player = user.player;
  if (!player) {
    return res.status(200).json({ user: { id: user.id, email: user.email }, player: null, gameData: null });
  }

  // 関連テーブルを gameData として分離
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
