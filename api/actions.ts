/**
 * /api/actions  — ゲームアクション統合エンドポイント
 * GET  ?action=guild              → ギルド情報取得
 * POST action=shop_stamina        → スタミナ購入
 * POST action=shop_item           → アイテム購入
 * POST action=arena_battle        → アリーナ戦績
 * POST action=raid_battle         → レイドダメージ
 * POST action=summon_save         → ガチャ結果保存
 * POST action=units_sync          → ユニット全件同期
 * POST action=guild_create        → ギルド作成
 * POST action=guild_join          → ギルド参加
 * POST action=guild_leave         → ギルド脱退
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';

// ── ショップ定義 ────────────────────────────────────────────
const STAMINA_PACKS = [
  { id: 'sp1', amount: 20,  diamondCost: 10 },
  { id: 'sp2', amount: 50,  diamondCost: 20 },
  { id: 'sp3', amount: -1,  diamondCost: 50 },
] as const;

const ITEM_SHOP = [
  { id: 'is1', itemId: 'item_exp_s',              quantity: 10, diamondCost: 30,  goldCost: 0 },
  { id: 'is2', itemId: 'item_exp_m',              quantity: 5,  diamondCost: 50,  goldCost: 0 },
  { id: 'is3', itemId: 'item_exp_l',              quantity: 3,  diamondCost: 100, goldCost: 0 },
  { id: 'is4', itemId: 'item_stamina_potion',     quantity: 3,  diamondCost: 80,  goldCost: 0 },
  { id: 'is5', itemId: 'item_summon_ticket',      quantity: 1,  diamondCost: 150, goldCost: 0 },
  { id: 'is6', itemId: 'item_awakening_crystal',  quantity: 1,  diamondCost: 200, goldCost: 0 },
  { id: 'is7', itemId: 'item_stone_core',         quantity: 10, diamondCost: 0,   goldCost: 50000 },
  { id: 'is8', itemId: 'item_magic_crystal',      quantity: 5,  diamondCost: 0,   goldCost: 30000 },
] as const;

// ── アリーナ制限値 ──────────────────────────────────────────
const MAX_ARENA_POINTS_PER_WIN = 50;
const MAX_ARENA_GOLD_PER_WIN   = 5000;
const MAX_ARENA_DIAMOND_WIN    = 5;
const ARENA_LOSS_PENALTY       = 10;

// ── レイド制限値 ────────────────────────────────────────────
const MAX_RAID_DAMAGE = 2_000_000;
const DEFAULT_BOSS_HP: Record<string, number> = { raid_dark_lord: 10_000_000 };
const FALLBACK_BOSS_HP = 10_000_000;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// ── ハンドラー ──────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: ギルド情報取得 ───────────────────────────────────
  if (req.method === 'GET' && req.query.action === 'guild') {
    const token = getTokenFromRequest(req.headers.cookie);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    const gPlayer = await prisma.player.findUnique({ where: { userId: payload.userId } });
    if (!gPlayer) return res.status(404).json({ error: 'Player not found' });
    const membership = await prisma.guildMember.findUnique({
      where: { playerId: gPlayer.playerId },
      include: { guild: { include: { members: true } } },
    });
    if (!membership) return res.json({ guild: null });
    return res.json({ guild: membership.guild, myRole: membership.role });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findFirst({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as Record<string, unknown>;
  const action = body.action as string | undefined;

  // ── ショップ: スタミナ購入 ─────────────────────────────
  if (action === 'shop_stamina') {
    const packId = body.packId as string;
    const pack = STAMINA_PACKS.find(p => p.id === packId);
    if (!pack) return res.status(400).json({ error: 'Invalid pack' });
    if (player.diamond < pack.diamondCost) return res.status(400).json({ error: 'ダイヤが不足しています' });

    const staminaAdd = pack.amount === -1
      ? Math.max(0, player.maxStamina - player.stamina)
      : pack.amount;
    const newStamina = clamp(player.stamina + staminaAdd, 0, player.maxStamina);
    const updated = await prisma.player.update({
      where: { playerId: player.playerId },
      data: { diamond: player.diamond - pack.diamondCost, stamina: newStamina },
    });
    return res.status(200).json({ ok: true, diamond: updated.diamond, stamina: updated.stamina, staminaAdded: staminaAdd });
  }

  // ── ショップ: アイテム購入 ─────────────────────────────
  if (action === 'shop_item') {
    const packId = body.packId as string;
    const shop = ITEM_SHOP.find(s => s.id === packId);
    if (!shop) return res.status(400).json({ error: 'Invalid pack' });

    let newDiamond = player.diamond;
    let newGold = player.gold;
    if (shop.diamondCost > 0) {
      if (player.diamond < shop.diamondCost) return res.status(400).json({ error: 'ダイヤが不足しています' });
      newDiamond -= shop.diamondCost;
    } else if (shop.goldCost > 0) {
      if (player.gold < shop.goldCost) return res.status(400).json({ error: 'ゴールドが不足しています' });
      newGold -= shop.goldCost;
    }

    await prisma.$transaction(async tx => {
      await tx.player.update({ where: { playerId: player.playerId }, data: { diamond: newDiamond, gold: newGold } });
      await tx.playerItem.upsert({
        where: { playerId_itemId: { playerId: player.playerId, itemId: shop.itemId } },
        update: { quantity: { increment: shop.quantity } },
        create: { playerId: player.playerId, itemId: shop.itemId, quantity: shop.quantity },
      });
    });
    return res.status(200).json({ ok: true, diamond: newDiamond, gold: newGold, itemId: shop.itemId, quantityAdded: shop.quantity });
  }

  // ── アリーナ: 戦績記録 ────────────────────────────────
  if (action === 'arena_battle') {
    const won = Boolean(body.won);
    const pointsGained = clamp(Number(body.pointsGained) || 0, 0, MAX_ARENA_POINTS_PER_WIN);
    const goldReward   = clamp(Number(body.goldReward)   || 0, 0, MAX_ARENA_GOLD_PER_WIN);
    const diamondReward = clamp(Number(body.diamondReward) || 0, 0, MAX_ARENA_DIAMOND_WIN);

    await prisma.$transaction(async tx => {
      await tx.playerArenaRecord.upsert({
        where: { playerId: player.playerId },
        update: won
          ? { wins: { increment: 1 }, points: { increment: pointsGained } }
          : { losses: { increment: 1 }, points: { decrement: ARENA_LOSS_PENALTY } },
        create: { playerId: player.playerId, wins: won ? 1 : 0, losses: won ? 0 : 1, points: won ? pointsGained : 0 },
      });
      if (goldReward > 0 || diamondReward > 0) {
        await tx.player.update({
          where: { playerId: player.playerId },
          data: { gold: { increment: goldReward }, diamond: { increment: diamondReward } },
        });
      }
    });
    return res.status(200).json({ ok: true });
  }

  // ── レイド: ダメージ記録 ───────────────────────────────
  if (action === 'raid_battle') {
    const bossId = typeof body.bossId === 'string' ? body.bossId : null;
    if (!bossId) return res.status(400).json({ error: 'Missing bossId' });
    const damage = clamp(Number(body.damageDealt) || 0, 0, MAX_RAID_DAMAGE);

    interface RaidState { bossId: string; currentHp: number; totalDamageDealt: number; entryCount: number }
    const miscData = (player.miscData ?? {}) as Record<string, unknown>;
    const raidStates: RaidState[] = Array.isArray(miscData.raidStates) ? (miscData.raidStates as RaidState[]) : [];

    const existing = raidStates.find(s => s.bossId === bossId);
    const bossMaxHp = DEFAULT_BOSS_HP[bossId] ?? FALLBACK_BOSS_HP;
    const newState: RaidState = existing
      ? { ...existing, currentHp: Math.max(0, existing.currentHp - damage), totalDamageDealt: existing.totalDamageDealt + damage, entryCount: existing.entryCount + 1 }
      : { bossId, currentHp: Math.max(0, bossMaxHp - damage), totalDamageDealt: damage, entryCount: 1 };
    const updatedRaidStates = existing ? raidStates.map(s => s.bossId === bossId ? newState : s) : [...raidStates, newState];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMiscData: any = JSON.parse(JSON.stringify({ ...miscData, raidStates: updatedRaidStates }));
    await prisma.player.update({ where: { playerId: player.playerId }, data: { miscData: newMiscData } });
    return res.status(200).json({ ok: true, raidState: newState });
  }

  // ── ガチャ結果保存 ────────────────────────────────────────
  if (action === 'summon_save') {
    interface SummonUnit { masterId: string; rarity: string; resultType: string }
    const poolId = body.poolId as string;
    const units = (body.units as SummonUnit[]) ?? [];
    if (!units.length) return res.status(400).json({ error: 'units required' });
    const now = new Date();
    await prisma.$transaction(async tx => {
      const newUnits = units.filter(u => u.resultType === 'new');
      if (newUnits.length > 0) {
        const nowMs = BigInt(Date.now());
        await tx.ownedUnit.createMany({
          data: newUnits.map((u, i) => ({
            instanceId: `unit_${Date.now() + i}_${u.masterId}`,
            playerId: player.playerId, masterId: u.masterId,
            level: 1, exp: 0, awakenRank: 0, awakeningCount: 0,
            currentRarity: u.rarity === 'SSR' ? '3' : u.rarity === 'SR' ? '2' : '1',
            isLocked: false, acquiredAt: nowMs + BigInt(i),
          })),
        });
      }
      await tx.summonHistory.createMany({
        data: units.map(u => ({ playerId: player.playerId, poolId, masterId: u.masterId, rarity: u.rarity, resultType: u.resultType, pulledAt: now })),
      });
      if (body.diamondSpent && Number(body.diamondSpent) > 0) {
        await tx.player.update({ where: { playerId: player.playerId }, data: { diamond: { decrement: Number(body.diamondSpent) } } });
      }
    });
    return res.status(200).json({ ok: true, saved: units.length });
  }

  // ── ユニット全件同期 ───────────────────────────────────────
  if (action === 'units_sync') {
    interface UnitRecord { instanceId: string; masterId: string; level?: number; exp?: number; awakenRank?: number; awakeningCount?: number; currentRarity?: string | number; isLocked?: boolean; acquiredAt?: number }
    const units = (body.units as UnitRecord[]) ?? [];
    if (!Array.isArray(units)) return res.status(400).json({ error: 'units array required' });
    await prisma.$transaction([
      prisma.ownedUnit.deleteMany({ where: { playerId: player.playerId } }),
      prisma.ownedUnit.createMany({
        data: units.map(u => ({
          instanceId: u.instanceId, playerId: player.playerId, masterId: u.masterId,
          level: u.level ?? 1, exp: u.exp ?? 0, awakenRank: u.awakenRank ?? 0, awakeningCount: u.awakeningCount ?? 0,
          currentRarity: String(u.currentRarity ?? '1'), isLocked: u.isLocked ?? false,
          acquiredAt: BigInt(u.acquiredAt ?? Date.now()),
        })),
      }),
    ]);
    return res.status(200).json({ ok: true, synced: units.length });
  }

  // ── ギルド作成 ────────────────────────────────────────────
  if (action === 'guild_create') {
    const name = (typeof body.name === 'string' ? body.name : '').trim();
    const emblem = (body.emblem as string) ?? '⚔️';
    if (!name) return res.status(400).json({ error: 'ギルド名を入力してください' });
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });
    const guild = await prisma.guild.create({
      data: { name, emblem, description: 'ギルドへようこそ！', members: { create: { playerId: player.playerId, role: 'master' } } },
      include: { members: true },
    });
    return res.json({ guild, myRole: 'master' });
  }

  // ── ギルド参加 ────────────────────────────────────────────
  if (action === 'guild_join') {
    const guildId = body.guildId as string;
    if (!guildId) return res.status(400).json({ error: 'guildId required' });
    const guild = await prisma.guild.findUnique({ where: { id: guildId } });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });
    await prisma.guildMember.create({ data: { guildId, playerId: player.playerId, role: 'member' } });
    const updated = await prisma.guild.findUnique({ where: { id: guildId }, include: { members: true } });
    return res.json({ guild: updated, myRole: 'member' });
  }

  // ── ギルド脱退 ────────────────────────────────────────────
  if (action === 'guild_leave') {
    await prisma.guildMember.deleteMany({ where: { playerId: player.playerId } });
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
