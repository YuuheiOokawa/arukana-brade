import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signToken, setCookieHeader } from '../../lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'このメールアドレスは既に登録されています' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = BigInt(Date.now());
  const arcanaId = `ARC-${Date.now().toString(36).toUpperCase()}`;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      player: {
        create: {
          playerName: '勇者',
          tutorialCompleted: false,
          staminaRecoveryTime: now + BigInt(5 * 60 * 1000),
          arcanaPlayerId: arcanaId,
        },
      },
    },
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

  const token = signToken({ userId: user.id, email: user.email });
  res.setHeader('Set-Cookie', setCookieHeader(token));

  const player = user.player;
  if (!player) {
    return res.status(201).json({ user: { id: user.id, email: user.email }, player: null, gameData: null });
  }

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

  return res.status(201).json({
    user: { id: user.id, email: user.email },
    player: playerForJson,
    gameData: {
      ownedUnits: ownedUnits.map(u => ({ ...u, acquiredAt: Number(u.acquiredAt) })),
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
