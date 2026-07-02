/**
 * GET  /api/guild  - プレイヤーのギルド情報取得
 * POST /api/guild  - ギルド操作 (create / join / leave)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

async function getPlayer(req: VercelRequest) {
  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.player.findUnique({ where: { userId: payload.userId } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const player = await getPlayer(req);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  // ── GET: 自分のギルド取得 ──────────────────────────────────────
  if (req.method === 'GET') {
    const membership = await prisma.guildMember.findUnique({
      where: { playerId: player.playerId },
      include: { guild: { include: { members: true } } },
    });
    if (!membership) return res.json({ guild: null });
    return res.json({ guild: membership.guild, myRole: membership.role });
  }

  // ── POST: ギルド操作 ──────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body as { action: string; name?: string; emblem?: string; guildId?: string };

  // ── 作成 ──────────────────────────────────────────────────────
  if (body.action === 'create') {
    const name = (body.name ?? '').trim();
    const emblem = body.emblem ?? '⚔️';
    if (!name) return res.status(400).json({ error: 'ギルド名を入力してください' });

    // 既にどこかに所属していれば脱退させてから作成
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });

    const guild = await prisma.guild.create({
      data: {
        name,
        emblem,
        description: 'ギルドへようこそ！',
        members: {
          create: {
            playerId: player.playerId,
            role: 'master',
          },
        },
      },
      include: { members: true },
    });
    return res.json({ guild, myRole: 'master' });
  }

  // ── 参加（プリセットギルドへ） ────────────────────────────────
  if (body.action === 'join') {
    const guildId = body.guildId;
    if (!guildId) return res.status(400).json({ error: 'guildId required' });

    const guild = await prisma.guild.findUnique({ where: { id: guildId } });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    // 既存メンバーシップ削除 → 新規追加
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });
    await prisma.guildMember.create({
      data: { guildId, playerId: player.playerId, role: 'member' },
    });

    const updated = await prisma.guild.findUnique({ where: { id: guildId }, include: { members: true } });
    return res.json({ guild: updated, myRole: 'member' });
  }

  // ── 脱退 ──────────────────────────────────────────────────────
  if (body.action === 'leave') {
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
