/**
 * /api/player  — プレイヤー保存操作を1ファイルに統合
 * POST action=save       → プロフィール保存
 * POST action=saveAll    → 全ゲーム状態保存
 * POST action=currency   → 通貨・スタミナ同期
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';

const MAX_GOLD        = 999_999_999;
const MAX_DIAMOND     = 999_999;
const MAX_STAMINA     = 999;
const MAX_RANK        = 200;
const MAX_STATE_BYTES = 500_000;

const clamp = (v: unknown, min: number, max: number): number => {
  if (typeof v !== 'number' || !isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.floor(v)));
};

const STAGE_RE = /^stage_\d+_\d+_\d+$/;
const isValidStageId = (id: string) => STAGE_RE.test(id);

function validateStageProgression(incoming: string[], dbCleared: Set<string>): string[] {
  const confirmed = new Set<string>(dbCleared);
  const isAccessible = (stageId: string, cleared: Set<string>) => {
    const parts = stageId.split('_');
    const world = Number(parts[1]), area = Number(parts[2]), num = Number(parts[3]);
    if (!world || !area || !num) return false;
    if (num === 1) return area === 1 || cleared.has(`stage_${world}_${area - 1}_5`);
    return cleared.has(`stage_${world}_${area}_${num - 1}`);
  };
  let remaining = incoming.filter(id => !confirmed.has(id));
  let prevSize = -1;
  while (remaining.length > 0 && remaining.length !== prevSize) {
    prevSize = remaining.length;
    const next: string[] = [];
    for (const id of remaining) {
      if (isAccessible(id, confirmed)) confirmed.add(id);
      else next.push(id);
    }
    remaining = next;
  }
  return Array.from(confirmed);
}

async function getPlayer(req: VercelRequest) {
  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.player.findUnique({ where: { userId: payload.userId } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const player = await getPlayer(req);
  if (!player) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body as Record<string, unknown>;
  const action = body.action as string | undefined;

  // ── save: プロフィール保存 ────────────────────────────────────────
  if (action === 'save') {
    const updateData: Record<string, unknown> = {};
    if (typeof body.playerName === 'string' && body.playerName.trim())
      updateData.playerName = body.playerName.trim().slice(0, 12);
    if (typeof body.tutorialCompleted === 'boolean')
      updateData.tutorialCompleted = body.tutorialCompleted;
    if (typeof body.title === 'string') updateData.title = body.title;
    if (typeof body.bio === 'string') updateData.bio = body.bio.slice(0, 100);
    if (typeof body.favoriteUnitId === 'string') updateData.favoriteUnitId = body.favoriteUnitId;

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: '更新するデータがありません' });

    const updated = await prisma.player.update({ where: { playerId: player.playerId }, data: updateData });
    return res.status(200).json({ player: updated });
  }

  // ── currency: 通貨・スタミナ同期 ─────────────────────────────────
  if (action === 'currency') {
    const updateData: Record<string, number> = {};
    const gold    = typeof body.gold    === 'number' && isFinite(body.gold)    ? Math.max(0, Math.min(MAX_GOLD, Math.floor(body.gold)))       : undefined;
    const diamond = typeof body.diamond === 'number' && isFinite(body.diamond) ? Math.max(0, Math.min(MAX_DIAMOND, Math.floor(body.diamond))) : undefined;
    const exp     = typeof body.exp     === 'number' && isFinite(body.exp)     ? Math.max(0, Math.min(999_999_999, Math.floor(body.exp)))      : undefined;
    const rank    = typeof body.playerRank === 'number' && isFinite(body.playerRank) ? Math.max(1, Math.min(MAX_RANK, Math.floor(body.playerRank))) : undefined;
    const stamina    = typeof body.stamina    === 'number' && isFinite(body.stamina)    ? Math.max(0, Math.min(MAX_STAMINA, Math.floor(body.stamina)))    : undefined;
    const maxStamina = typeof body.maxStamina === 'number' && isFinite(body.maxStamina) ? Math.max(1, Math.min(MAX_STAMINA, Math.floor(body.maxStamina))) : undefined;
    if (gold       !== undefined) updateData.gold       = gold;
    if (diamond    !== undefined) updateData.diamond    = diamond;
    if (exp        !== undefined) updateData.exp        = exp;
    if (rank       !== undefined) updateData.playerRank = rank;
    if (stamina    !== undefined) updateData.stamina    = stamina;
    if (maxStamina !== undefined) updateData.maxStamina = maxStamina;
    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: '更新するデータがありません' });
    const updated = await prisma.player.update({ where: { playerId: player.playerId }, data: updateData });
    return res.status(200).json({ player: updated });
  }

  // ── saveAll: 全ゲーム状態保存 ────────────────────────────────────
  if (action === 'saveAll') {
    const state = body.state as Record<string, unknown> | undefined;
    if (!state || typeof state !== 'object' || Array.isArray(state))
      return res.status(400).json({ error: 'state object required' });
    if (JSON.stringify(state).length > MAX_STATE_BYTES)
      return res.status(413).json({ error: 'state too large' });

    type P = { name?: string; rank?: number; exp?: number; gold?: number; diamond?: number; stamina?: number; maxStamina?: number; staminaRecoveryTime?: number; title?: string; bio?: string; favoriteUnitInstanceId?: string | null; loginDays?: number; playerId?: string };
    type U = { instanceId: string; masterId: string; level?: number; exp?: number; awakenRank?: number; awakeningCount?: number; currentRarity?: string | number; isLocked?: boolean; acquiredAt?: number };
    type I = { itemId: string; quantity?: number };
    type E = { instanceId: string; masterId: string; level?: number; exp?: number; equippedTo?: string | null };
    type Party = { id: string; name?: string; slots?: (string | null)[]; leaderId?: string | null };

    const p = state.player as P | undefined;
    const units = (Array.isArray(state.ownedUnits) ? state.ownedUnits : []) as U[];
    const items = (Array.isArray(state.items) ? state.items : []) as I[];
    const equips = (Array.isArray(state.ownedEquipments) ? state.ownedEquipments : []) as E[];
    const parties = (Array.isArray(state.parties) ? state.parties : []) as Party[];

    await prisma.$transaction(async tx => {
      await tx.player.update({
        where: { playerId: player.playerId },
        data: {
          playerName: typeof p?.name === 'string' ? p.name.slice(0, 20).trim() || '勇者' : undefined,
          playerRank: p?.rank !== undefined ? clamp(p.rank, 1, MAX_RANK) : undefined,
          exp: p?.exp !== undefined ? clamp(p.exp, 0, 999_999_999) : undefined,
          gold: p?.gold !== undefined ? clamp(p.gold, 0, MAX_GOLD) : undefined,
          diamond: p?.diamond !== undefined ? clamp(p.diamond, 0, MAX_DIAMOND) : undefined,
          stamina: p?.stamina !== undefined ? clamp(p.stamina, 0, MAX_STAMINA) : undefined,
          maxStamina: p?.maxStamina !== undefined ? clamp(p.maxStamina, 1, MAX_STAMINA) : undefined,
          staminaRecoveryTime: p?.staminaRecoveryTime !== undefined ? BigInt(p.staminaRecoveryTime) : undefined,
          title: typeof p?.title === 'string' ? p.title.slice(0, 50) : undefined,
          bio: typeof p?.bio === 'string' ? p.bio.slice(0, 200) : undefined,
          favoriteUnitId: p?.favoriteUnitInstanceId ?? null,
          loginDays: typeof p?.loginDays === 'number' ? p.loginDays : undefined,
          arcanaPlayerId: typeof p?.playerId === 'string' ? p.playerId : undefined,
          tutorialCompleted: state.tutorialCompleted === true ? true : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          miscData: JSON.parse(JSON.stringify({ awakeningCrystals: (state.awakeningCrystals as Record<string, number>) ?? {}, raidStates: (state.raidStates as unknown[]) ?? [] })) as any,
          updatedAt: new Date(),
        },
      });

      await tx.ownedUnit.deleteMany({ where: { playerId: player.playerId } });
      if (units.length > 0) {
        await tx.ownedUnit.createMany({
          data: units.filter(u => u.instanceId && u.masterId).map(u => ({
            instanceId: String(u.instanceId), playerId: player.playerId, masterId: String(u.masterId),
            level: clamp(u.level, 1, 999), exp: clamp(u.exp, 0, 999_999_999),
            awakenRank: clamp(u.awakenRank, 0, 10), awakeningCount: clamp(u.awakeningCount, 0, 10),
            currentRarity: (() => { const r = u.currentRarity; if (r === 'CROWN' || r === 'crown' || r === 8 || r === '8') return 'CROWN'; const n = Number(r); return (n >= 1 && n <= 7) ? String(n) : '1'; })(),
            isLocked: u.isLocked ?? false,
            acquiredAt: BigInt(typeof u.acquiredAt === 'number' ? u.acquiredAt : 0),
          })),
          skipDuplicates: true,
        });
      }

      await tx.playerItem.deleteMany({ where: { playerId: player.playerId } });
      if (items.length > 0) {
        await tx.playerItem.createMany({ data: items.filter(i => i.itemId).map(i => ({ playerId: player.playerId, itemId: String(i.itemId), quantity: clamp(i.quantity, 0, 999_999) })), skipDuplicates: true });
      }

      await tx.ownedEquipment.deleteMany({ where: { playerId: player.playerId } });
      if (equips.length > 0) {
        await tx.ownedEquipment.createMany({ data: equips.filter(e => e.instanceId && e.masterId).map(e => ({ instanceId: String(e.instanceId), playerId: player.playerId, masterId: String(e.masterId), level: clamp(e.level, 1, 999), exp: clamp(e.exp, 0, 999_999_999), equippedTo: e.equippedTo ?? null })), skipDuplicates: true });
      }

      const rawCleared = ((state.clearedStageIds as string[]) ?? []).filter(isValidStageId);
      const existing = await tx.playerQuestProgress.findUnique({ where: { playerId: player.playerId } });
      const validatedCleared = validateStageProgression(rawCleared, new Set(existing?.clearedStageIds ?? []));
      await tx.playerQuestProgress.upsert({
        where: { playerId: player.playerId },
        update: { clearedStageIds: validatedCleared, claimedAreaRewards: (state.claimedAreaRewards as string[]) ?? [], lastSelectedWorldId: (state.lastSelectedWorldId as string) ?? null },
        create: { playerId: player.playerId, clearedStageIds: validatedCleared, claimedAreaRewards: (state.claimedAreaRewards as string[]) ?? [], lastSelectedWorldId: (state.lastSelectedWorldId as string) ?? null },
      });

      await tx.playerParty.deleteMany({ where: { playerId: player.playerId } });
      if (parties.length > 0) {
        await tx.playerParty.createMany({ data: parties.map(party => ({ id: `${player.playerId}_${party.id}`, playerId: player.playerId, partyId: String(party.id), name: typeof party.name === 'string' ? party.name : 'パーティ', slots: (party.slots ?? []) as (string | null)[], leaderId: party.leaderId ?? null, isActive: party.id === (state.activePartyId as string) })) });
      }

      const md = state.missionDaily as { date?: string; progresses?: unknown } | undefined;
      await tx.playerMissionProgress.upsert({
        where: { playerId: player.playerId },
        update: { dailyDate: md?.date ?? '', dailyData: (md?.progresses ?? []) as object[], weeklyData: (state.missionWeeklyProgresses ?? []) as object[], weekStr: (state.missionWeekStr as string) ?? '' },
        create: { playerId: player.playerId, dailyDate: md?.date ?? '', dailyData: (md?.progresses ?? []) as object[], weeklyData: (state.missionWeeklyProgresses ?? []) as object[], weekStr: (state.missionWeekStr as string) ?? '' },
      });

      await tx.playerLoginBonus.upsert({
        where: { playerId: player.playerId },
        update: { lastClaimedDate: (state.loginBonusLastClaimedDate as string) ?? null, lastLoginDate: (state.loginBonusLastLoginDate as string) ?? null, claimedDays: (state.loginBonusClaimedDays as number[]) ?? [], currentDay: typeof state.loginBonusCurrentDay === 'number' ? state.loginBonusCurrentDay : 1 },
        create: { playerId: player.playerId, lastClaimedDate: (state.loginBonusLastClaimedDate as string) ?? null, lastLoginDate: (state.loginBonusLastLoginDate as string) ?? null, claimedDays: (state.loginBonusClaimedDays as number[]) ?? [], currentDay: typeof state.loginBonusCurrentDay === 'number' ? state.loginBonusCurrentDay : 1 },
      });

      const ar = state.arenaRecord as { wins?: number; losses?: number; rank?: number; points?: number; season?: number } | undefined;
      await tx.playerArenaRecord.upsert({
        where: { playerId: player.playerId },
        update: { wins: ar?.wins ?? 0, losses: ar?.losses ?? 0, rank: ar?.rank ?? 999, points: ar?.points ?? 1000, season: ar?.season ?? 1, battleHistory: (state.arenaBattleHistory ?? []) as object[] },
        create: { playerId: player.playerId, wins: ar?.wins ?? 0, losses: ar?.losses ?? 0, rank: ar?.rank ?? 999, points: ar?.points ?? 1000, season: ar?.season ?? 1, battleHistory: (state.arenaBattleHistory ?? []) as object[] },
      });
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
