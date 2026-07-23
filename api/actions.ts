/**
 * /api/actions  — ゲームアクション統合エンドポイント
 * GET  ?action=guild              → ギルド情報取得
 * GET  ?action=friends            → フレンドリスト・申請一覧取得
 * POST action=shop_stamina        → スタミナ購入
 * POST action=shop_item           → アイテム購入
 * POST action=arena_battle        → アリーナ戦績
 * POST action=raid_battle         → レイドダメージ
 * POST action=summon_save         → ガチャ結果保存
 * POST action=units_sync          → ユニット全件同期
 * POST action=guild_create        → ギルド作成
 * POST action=guild_join          → ギルド参加
 * POST action=guild_leave         → ギルド脱退
 * POST action=friend_request      → フレンド申請
 * POST action=friend_accept       → フレンド申請承認
 * POST action=friend_reject       → フレンド申請拒否
 * POST action=friend_delete       → フレンド削除
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

// ── 同期系リクエストのサイズ上限 ────────────────────────────
const MAX_UNITS_SYNC_COUNT = 1000;
const MAX_SUMMON_UNITS_PER_CALL = 20; // 実際の最大ガチャ枠(10連)より余裕を持たせた上限

// v が数値でない/NaN な場合は min にフォールバックする（未検証な外部入力を渡しても安全）
const clamp = (v: unknown, min: number, max: number): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
};

// ── ハンドラー ──────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: フレンドリスト取得 ──────────────────────────────
  if (req.method === 'GET' && req.query.action === 'friends') {
    const token = getTokenFromRequest(req.headers.cookie);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    const me = await prisma.player.findUnique({ where: { userId: payload.userId } });
    if (!me) return res.status(404).json({ error: 'Player not found' });

    // フレンド一覧
    const friendRows = await prisma.friend.findMany({ where: { playerId: me.playerId } });
    const friendPlayerIds = friendRows.map(f => f.friendId);
    const friendPlayers = friendPlayerIds.length > 0
      ? await prisma.player.findMany({
          where: { playerId: { in: friendPlayerIds } },
          select: { playerId: true, playerName: true, playerRank: true, arcanaPlayerId: true, lastLoginAt: true, parties: { where: { isActive: true }, take: 1 } },
        })
      : [];

    const leaderIds = friendPlayers.map(fp => fp.parties[0]?.leaderId).filter((id): id is string => !!id);
    const leaderUnits = leaderIds.length > 0
      ? await prisma.ownedUnit.findMany({ where: { instanceId: { in: leaderIds } } })
      : [];

    const now = Date.now();
    const fmtLastLogin = (d: Date) => {
      const m = Math.floor((now - d.getTime()) / 60000);
      return m < 10 ? 'オンライン' : m < 60 ? `${m}分前` : m < 1440 ? `${Math.floor(m / 60)}時間前` : `${Math.floor(m / 1440)}日前`;
    };

    const friends = friendPlayers.map(fp => {
      const lu = fp.parties[0]?.leaderId ? leaderUnits.find(u => u.instanceId === fp.parties[0].leaderId) : null;
      return {
        friendPlayerId: fp.playerId,
        arcanaPlayerId: fp.arcanaPlayerId,
        playerName: fp.playerName,
        playerRank: fp.playerRank,
        leaderUnitMasterId: lu?.masterId ?? null,
        leaderUnitLevel: lu?.level ?? 1,
        leaderUnitAwakenRank: lu?.awakenRank ?? 0,
        lastLogin: fmtLastLogin(fp.lastLoginAt),
      };
    });

    // 受信申請
    const recvReqs = await prisma.friendRequest.findMany({ where: { toPlayerId: me.playerId }, orderBy: { createdAt: 'desc' }, take: 30 });
    const fromIds = recvReqs.map(r => r.fromPlayerId);
    const fromPlayers = fromIds.length > 0
      ? await prisma.player.findMany({ where: { playerId: { in: fromIds } }, select: { playerId: true, playerName: true, playerRank: true, arcanaPlayerId: true } })
      : [];

    const receivedRequests = recvReqs.map(r => {
      const fp = fromPlayers.find(p => p.playerId === r.fromPlayerId);
      return { requestId: r.id, fromPlayerId: r.fromPlayerId, fromArcanaPlayerId: fp?.arcanaPlayerId ?? '', fromPlayerName: fp?.playerName ?? '不明', fromPlayerRank: fp?.playerRank ?? 1, createdAt: r.createdAt.toISOString() };
    });

    const sentRequestCount = await prisma.friendRequest.count({ where: { fromPlayerId: me.playerId } });
    return res.json({ friends, receivedRequests, sentRequestCount });
  }

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
  // 残高チェックと更新をトランザクション内で「直前に再取得した値」に対して行うことで、
  // 連打等による同時リクエストが同じ古い残高を見て両方通ってしまう二重付与レースを防ぐ
  // (以前はハンドラー冒頭で1回だけ取得した player を使い回して絶対値で上書きしていた)
  if (action === 'shop_stamina') {
    const packId = body.packId as string;
    const pack = STAMINA_PACKS.find(p => p.id === packId);
    if (!pack) return res.status(400).json({ error: 'Invalid pack' });

    try {
      const updated = await prisma.$transaction(async tx => {
        const fresh = await tx.player.findUniqueOrThrow({ where: { playerId: player.playerId } });
        if (fresh.diamond < pack.diamondCost) throw new Error('INSUFFICIENT_DIAMOND');
        const staminaAdd = pack.amount === -1
          ? Math.max(0, fresh.maxStamina - fresh.stamina)
          : pack.amount;
        const newStamina = clamp(fresh.stamina + staminaAdd, 0, fresh.maxStamina);
        const result = await tx.player.update({
          where: { playerId: player.playerId },
          data: { diamond: { decrement: pack.diamondCost }, stamina: newStamina },
        });
        return { ...result, staminaAdded: staminaAdd };
      });
      return res.status(200).json({ ok: true, diamond: updated.diamond, stamina: updated.stamina, staminaAdded: updated.staminaAdded });
    } catch (e) {
      if (e instanceof Error && e.message === 'INSUFFICIENT_DIAMOND') return res.status(400).json({ error: 'ダイヤが不足しています' });
      throw e;
    }
  }

  // ── ショップ: アイテム購入 ─────────────────────────────
  if (action === 'shop_item') {
    const packId = body.packId as string;
    const shop = ITEM_SHOP.find(s => s.id === packId);
    if (!shop) return res.status(400).json({ error: 'Invalid pack' });

    try {
      const result = await prisma.$transaction(async tx => {
        const fresh = await tx.player.findUniqueOrThrow({ where: { playerId: player.playerId } });
        if (shop.diamondCost > 0) {
          if (fresh.diamond < shop.diamondCost) throw new Error('INSUFFICIENT_DIAMOND');
        } else if (shop.goldCost > 0) {
          if (fresh.gold < shop.goldCost) throw new Error('INSUFFICIENT_GOLD');
        }
        const updated = await tx.player.update({
          where: { playerId: player.playerId },
          data: {
            diamond: shop.diamondCost > 0 ? { decrement: shop.diamondCost } : undefined,
            gold: shop.goldCost > 0 ? { decrement: shop.goldCost } : undefined,
          },
        });
        await tx.playerItem.upsert({
          where: { playerId_itemId: { playerId: player.playerId, itemId: shop.itemId } },
          update: { quantity: { increment: shop.quantity } },
          create: { playerId: player.playerId, itemId: shop.itemId, quantity: shop.quantity },
        });
        return updated;
      });
      return res.status(200).json({ ok: true, diamond: result.diamond, gold: result.gold, itemId: shop.itemId, quantityAdded: shop.quantity });
    } catch (e) {
      if (e instanceof Error && e.message === 'INSUFFICIENT_DIAMOND') return res.status(400).json({ error: 'ダイヤが不足しています' });
      if (e instanceof Error && e.message === 'INSUFFICIENT_GOLD') return res.status(400).json({ error: 'ゴールドが不足しています' });
      throw e;
    }
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
  // miscData(JSONカラム)を丸ごと読んで丸ごと書き戻す方式のため、素朴にやると
  // 同時発生した2件のリクエストが同じ古い raidStates を基に計算し、後勝ちで
  // 片方のダメージが消えるレースが起きる。トランザクション内で書き込み直前に
  // 再取得することで、その窓を大幅に狭める。
  if (action === 'raid_battle') {
    const bossId = typeof body.bossId === 'string' ? body.bossId : null;
    if (!bossId) return res.status(400).json({ error: 'Missing bossId' });
    const damage = clamp(Number(body.damageDealt) || 0, 0, MAX_RAID_DAMAGE);

    interface RaidState { bossId: string; currentHp: number; totalDamageDealt: number; entryCount: number }
    const newState = await prisma.$transaction(async tx => {
      const fresh = await tx.player.findUniqueOrThrow({ where: { playerId: player.playerId } });
      const miscData = (fresh.miscData ?? {}) as Record<string, unknown>;
      const raidStates: RaidState[] = Array.isArray(miscData.raidStates) ? (miscData.raidStates as RaidState[]) : [];

      const existing = raidStates.find(s => s.bossId === bossId);
      const bossMaxHp = DEFAULT_BOSS_HP[bossId] ?? FALLBACK_BOSS_HP;
      const computed: RaidState = existing
        ? { ...existing, currentHp: Math.max(0, existing.currentHp - damage), totalDamageDealt: existing.totalDamageDealt + damage, entryCount: existing.entryCount + 1 }
        : { bossId, currentHp: Math.max(0, bossMaxHp - damage), totalDamageDealt: damage, entryCount: 1 };
      const updatedRaidStates = existing ? raidStates.map(s => s.bossId === bossId ? computed : s) : [...raidStates, computed];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newMiscData: any = JSON.parse(JSON.stringify({ ...miscData, raidStates: updatedRaidStates }));
      await tx.player.update({ where: { playerId: player.playerId }, data: { miscData: newMiscData } });
      return computed;
    });
    return res.status(200).json({ ok: true, raidState: newState });
  }

  // ── ガチャ結果保存 ────────────────────────────────────────
  if (action === 'summon_save') {
    interface SummonUnit { masterId: string; rarity: string; resultType: string }
    const poolId = body.poolId as string;
    const units = (body.units as SummonUnit[]) ?? [];
    if (!units.length) return res.status(400).json({ error: 'units required' });
    if (units.length > MAX_SUMMON_UNITS_PER_CALL) return res.status(400).json({ error: 'too many units' });
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
  // saveAll と異なりここでは値のクランプも instanceId/masterId の存在チェックも
  // 行われていなかったため、異常な level/awakenRank 等がそのまま保存されたり、
  // instanceId 欠落エントリで createMany が例外(500)になることがあった。
  // saveAll と同じ検証・クランプをここにも適用する。
  if (action === 'units_sync') {
    interface UnitRecord { instanceId: string; masterId: string; level?: number; exp?: number; awakenRank?: number; awakeningCount?: number; currentRarity?: string | number; isLocked?: boolean; acquiredAt?: number }
    const units = (body.units as UnitRecord[]) ?? [];
    if (!Array.isArray(units)) return res.status(400).json({ error: 'units array required' });
    if (units.length > MAX_UNITS_SYNC_COUNT) return res.status(400).json({ error: 'too many units' });
    const validUnits = units.filter(u => typeof u?.instanceId === 'string' && u.instanceId && typeof u?.masterId === 'string' && u.masterId);
    await prisma.$transaction([
      prisma.ownedUnit.deleteMany({ where: { playerId: player.playerId } }),
      prisma.ownedUnit.createMany({
        data: validUnits.map(u => ({
          instanceId: u.instanceId, playerId: player.playerId, masterId: u.masterId,
          level: clamp(u.level ?? 1, 1, 999), exp: clamp(u.exp ?? 0, 0, 999_999_999),
          awakenRank: clamp(u.awakenRank ?? 0, 0, 10), awakeningCount: clamp(u.awakeningCount ?? 0, 0, 10),
          currentRarity: (() => { const r = u.currentRarity; if (r === 'CROWN' || r === 'crown' || r === 8 || r === '8') return 'CROWN'; const n = Number(r); return (n >= 1 && n <= 7) ? String(n) : '1'; })(),
          isLocked: u.isLocked ?? false,
          acquiredAt: BigInt(u.acquiredAt ?? Date.now()),
        })),
        skipDuplicates: true,
      }),
    ]);
    return res.status(200).json({ ok: true, synced: validUnits.length });
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

  // ── フレンド申請 ──────────────────────────────────────────
  if (action === 'friend_request') {
    const arcanaId = (body.arcanaPlayerId as string | undefined)?.trim().toUpperCase();
    if (!arcanaId) return res.status(400).json({ error: 'arcanaPlayerId が必要です' });
    if (!arcanaId.startsWith('ARC-')) return res.status(400).json({ error: 'IDの形式が正しくありません（ARC-xxxxx）' });

    const target = await prisma.player.findFirst({ where: { arcanaPlayerId: arcanaId } });
    if (!target) return res.status(404).json({ error: 'プレイヤーが見つかりません' });
    if (target.playerId === player.playerId) return res.status(400).json({ error: '自分自身には申請できません' });

    const alreadyFriend = await prisma.friend.findUnique({ where: { playerId_friendId: { playerId: player.playerId, friendId: target.playerId } } });
    if (alreadyFriend) return res.status(409).json({ error: '既にフレンドです' });

    const alreadySent = await prisma.friendRequest.findUnique({ where: { fromPlayerId_toPlayerId: { fromPlayerId: player.playerId, toPlayerId: target.playerId } } });
    if (alreadySent) return res.status(409).json({ error: '既に申請済みです' });

    // 相手から申請が届いていれば自動承認
    const reverse = await prisma.friendRequest.findUnique({ where: { fromPlayerId_toPlayerId: { fromPlayerId: target.playerId, toPlayerId: player.playerId } } });
    if (reverse) {
      await prisma.$transaction([
        prisma.friendRequest.delete({ where: { id: reverse.id } }),
        prisma.friend.createMany({ data: [{ playerId: player.playerId, friendId: target.playerId }, { playerId: target.playerId, friendId: player.playerId }] }),
      ]);
      return res.json({ ok: true, autoAccepted: true, targetName: target.playerName });
    }

    await prisma.friendRequest.create({ data: { fromPlayerId: player.playerId, toPlayerId: target.playerId } });
    return res.json({ ok: true, autoAccepted: false, targetName: target.playerName });
  }

  // ── フレンド申請承認 ──────────────────────────────────────
  if (action === 'friend_accept') {
    const requestId = body.requestId as string | undefined;
    if (!requestId) return res.status(400).json({ error: 'requestId が必要です' });

    const req2 = await prisma.friendRequest.findFirst({ where: { id: requestId, toPlayerId: player.playerId } });
    if (!req2) return res.status(404).json({ error: '申請が見つかりません' });

    await prisma.$transaction([
      prisma.friendRequest.delete({ where: { id: requestId } }),
      prisma.friend.createMany({
        data: [{ playerId: player.playerId, friendId: req2.fromPlayerId }, { playerId: req2.fromPlayerId, friendId: player.playerId }],
        skipDuplicates: true,
      }),
    ]);
    return res.json({ ok: true });
  }

  // ── フレンド申請拒否 ──────────────────────────────────────
  if (action === 'friend_reject') {
    const requestId = body.requestId as string | undefined;
    if (!requestId) return res.status(400).json({ error: 'requestId が必要です' });
    await prisma.friendRequest.deleteMany({ where: { id: requestId, toPlayerId: player.playerId } });
    return res.json({ ok: true });
  }

  // ── フレンド削除 ─────────────────────────────────────────
  if (action === 'friend_delete') {
    const targetArcanaId = body.arcanaPlayerId as string | undefined;
    if (!targetArcanaId) return res.status(400).json({ error: 'arcanaPlayerId が必要です' });
    const target = await prisma.player.findFirst({ where: { arcanaPlayerId: targetArcanaId } });
    if (!target) return res.status(404).json({ error: 'プレイヤーが見つかりません' });
    await prisma.friend.deleteMany({ where: { OR: [{ playerId: player.playerId, friendId: target.playerId }, { playerId: target.playerId, friendId: player.playerId }] } });
    return res.json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
