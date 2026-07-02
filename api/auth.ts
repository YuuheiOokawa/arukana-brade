/**
 * /api/auth  — 認証操作を1ファイルに統合
 * GET              → me（セッション確認）
 * POST action=login    → ログイン
 * POST action=register → 会員登録
 * POST action=logout   → ログアウト
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import {
  signToken, setCookieHeader, clearCookieHeader,
  getTokenFromRequest, verifyToken,
} from '../lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// プレイヤーデータを JSON シリアライズ可能な形に変換
function serializePlayerData(player: {
  ownedUnits: { acquiredAt: bigint; [k: string]: unknown }[];
  playerItems: unknown[];
  ownedEquipments: unknown[];
  questProgress: unknown;
  parties: unknown[];
  missionProgress: unknown;
  loginBonus: unknown;
  arenaRecord: unknown;
  staminaRecoveryTime: bigint;
  [k: string]: unknown;
}) {
  const {
    ownedUnits, playerItems, ownedEquipments,
    questProgress, parties, missionProgress, loginBonus, arenaRecord,
    ...playerFields
  } = player;
  return {
    player: { ...playerFields, staminaRecoveryTime: Number(playerFields.staminaRecoveryTime) },
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
  };
}

const PLAYER_INCLUDE = {
  ownedUnits: true,
  playerItems: true,
  ownedEquipments: true,
  questProgress: true,
  parties: true,
  missionProgress: true,
  loginBonus: true,
  arenaRecord: true,
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: me ─────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const token = getTokenFromRequest(req.headers.cookie);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { player: { include: PLAYER_INCLUDE } },
    });
    if (!user?.player) return res.status(404).json({ error: 'Player not found' });

    const { player, gameData } = serializePlayerData(user.player);
    return res.status(200).json({ user: { id: user.id, email: user.email }, player, gameData });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body as { action?: string; email?: string; password?: string };
  const action = body.action;

  // ── POST logout ──────────────────────────────────────────────────────
  if (action === 'logout') {
    res.setHeader('Set-Cookie', clearCookieHeader());
    return res.status(200).json({ ok: true });
  }

  // ── POST login ───────────────────────────────────────────────────────
  if (action === 'login') {
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { player: { include: PLAYER_INCLUDE } },
    });
    if (!user) return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });

    if (user.player) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const lastLogin = new Date(user.player.lastLoginAt); lastLogin.setHours(0, 0, 0, 0);
      if (lastLogin < today) {
        await prisma.player.update({
          where: { playerId: user.player.playerId },
          data: { loginDays: { increment: 1 }, lastLoginAt: new Date() },
        });
      }
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.setHeader('Set-Cookie', setCookieHeader(token));

    if (!user.player) return res.status(200).json({ user: { id: user.id, email: user.email }, player: null, gameData: null });
    const { player, gameData } = serializePlayerData(user.player);
    return res.status(200).json({ user: { id: user.id, email: user.email }, player, gameData });
  }

  // ── POST register ────────────────────────────────────────────────────
  if (action === 'register') {
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });
    if (password.length < 8) return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'このメールアドレスは既に登録されています' });

    const passwordHash = await bcrypt.hash(password, 12);
    const now = BigInt(Date.now());
    const arcanaId = `ARC-${Date.now().toString(36).toUpperCase()}`;

    const user = await prisma.user.create({
      data: {
        email, passwordHash,
        player: {
          create: {
            playerName: '勇者',
            tutorialCompleted: false,
            staminaRecoveryTime: now + BigInt(5 * 60 * 1000),
            arcanaPlayerId: arcanaId,
          },
        },
      },
      include: { player: { include: PLAYER_INCLUDE } },
    });

    const token = signToken({ userId: user.id, email: user.email });
    res.setHeader('Set-Cookie', setCookieHeader(token));

    if (!user.player) return res.status(201).json({ user: { id: user.id, email: user.email }, player: null, gameData: null });
    const { player, gameData } = serializePlayerData(user.player);
    return res.status(201).json({ user: { id: user.id, email: user.email }, player, gameData });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
