/**
 * /api/player  — プレイヤー保存操作を1ファイルに統合
 * POST action=save       → プロフィール保存
 * POST action=saveAll    → 全ゲーム状態保存
 * POST action=currency   → 通貨・スタミナ同期
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';
import { RAID_BOSS_MAX_HP, UNIT_RARITY_BY_ID } from '../lib/gameRules.js';

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
const AREA_RE = /^\d+_\d+$/;
const WORLD_RE = /^world_\d+$/;
const ITEM_RE = /^item_[a-z0-9_]{1,80}$/;
const EQUIPMENT_RE = /^equip_[a-z0-9_]{1,80}$/;
const isValidStageId = (id: string) => STAGE_RE.test(id);

type SaveEquipment = { instanceId: string; masterId: string; level?: number; exp?: number; equippedTo?: string | null };
type SaveParty = { id: string; name?: string; slots?: (string | null)[]; leaderId?: string | null };

export function normalizeOwnedUnitReferences(
  equips: SaveEquipment[], parties: SaveParty[], favorite: unknown, ownedUnitIds: Set<string>,
) {
  const normalizedEquips = equips.map(equip => ({
    ...equip,
    equippedTo: typeof equip.equippedTo === 'string' && ownedUnitIds.has(equip.equippedTo)
      ? equip.equippedTo : null,
  }));
  const normalizedParties = parties.map(party => {
    const seen = new Set<string>();
    const slots = (party.slots ?? []).map(slot => {
      if (typeof slot !== 'string' || !ownedUnitIds.has(slot) || seen.has(slot)) return null;
      seen.add(slot);
      return slot;
    });
    const leaderId = typeof party.leaderId === 'string' && seen.has(party.leaderId)
      ? party.leaderId : slots.find((slot): slot is string => typeof slot === 'string') ?? null;
    return { ...party, slots, leaderId };
  });
  const favoriteUnitId = typeof favorite === 'string' && ownedUnitIds.has(favorite) ? favorite : null;
  return { normalizedEquips, normalizedParties, favoriteUnitId };
}

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

const awakeningCrystalsRecord = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, number> = {};
  for (const [masterId, count] of Object.entries(value as Record<string, unknown>)) {
    if (!UNIT_RARITY_BY_ID.has(masterId)) continue;
    result[masterId] = clamp(count, 0, 999_999);
  }
  return result;
};

const raidStatesArray = (value: unknown): Array<Record<string, number | string>> => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(rawState => {
    if (!rawState || typeof rawState !== 'object') return [];
    const state = rawState as Record<string, unknown>;
    const bossId = typeof state.bossId === 'string' ? state.bossId : '';
    const maxHp = RAID_BOSS_MAX_HP[bossId];
    if (!maxHp || seen.has(bossId)) return [];
    seen.add(bossId);
    return [{
      bossId,
      currentHp: clamp(state.currentHp, 0, maxHp),
      totalDamageDealt: clamp(state.totalDamageDealt, 0, maxHp),
      entryCount: clamp(state.entryCount, 0, 1_000_000),
      highestClaimedTier: clamp(state.highestClaimedTier, -1, 100),
    }];
  });
};

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

  // Record only fixed validation reasons, never the player's submitted data.
  const badRequest = (error: string) => {
    console.warn('[player] request rejected', { reason: error });
    return res.status(400).json({ error });
  };
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
    return badRequest('request body must be an object');
  const body = req.body as Record<string, unknown>;
  const action = body.action as string | undefined;

  // ── save: プロフィール保存 ────────────────────────────────────────
  if (action === 'save') {
    const updateData: Record<string, unknown> = {};
    if (typeof body.playerName === 'string' && body.playerName.trim())
      updateData.playerName = body.playerName.trim().slice(0, 12);
    if (typeof body.tutorialCompleted === 'boolean')
      updateData.tutorialCompleted = body.tutorialCompleted;
    if (typeof body.title === 'string') updateData.title = body.title.slice(0, 50);
    if (typeof body.bio === 'string') updateData.bio = body.bio.slice(0, 100);
    if (typeof body.favoriteUnitId === 'string') {
      const ownedFavorite = await prisma.ownedUnit.findFirst({ where: { playerId: player.playerId, instanceId: body.favoriteUnitId } });
      if (!ownedFavorite) return badRequest('所持していないユニットです');
      updateData.favoriteUnitId = body.favoriteUnitId;
    } else if (body.favoriteUnitId === null) updateData.favoriteUnitId = null;

    if (Object.keys(updateData).length === 0)
      return badRequest('更新するデータがありません');

    const updated = await prisma.player.update({ where: { playerId: player.playerId }, data: updateData });
    return res.status(200).json({ player: { ...updated, staminaRecoveryTime: Number(updated.staminaRecoveryTime) } });
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
      return badRequest('更新するデータがありません');
    const updated = await prisma.player.update({ where: { playerId: player.playerId }, data: updateData });
    return res.status(200).json({ player: { ...updated, staminaRecoveryTime: Number(updated.staminaRecoveryTime) } });
  }

  // ── saveAll: 全ゲーム状態保存 ────────────────────────────────────
  if (action === 'saveAll') {
    const state = body.state as Record<string, unknown> | undefined;
    if (!state || typeof state !== 'object' || Array.isArray(state))
      return badRequest('state object required');
    if (JSON.stringify(state).length > MAX_STATE_BYTES)
      return res.status(413).json({ error: 'state too large' });

    type P = { name?: string; rank?: number; exp?: number; gold?: number; diamond?: number; stamina?: number; maxStamina?: number; staminaRecoveryTime?: number; title?: string; bio?: string; favoriteUnitInstanceId?: string | null; loginDays?: number; playerId?: string };
    type U = { instanceId: string; masterId: string; level?: number; exp?: number; awakenRank?: number; awakeningCount?: number; currentRarity?: string | number; isLocked?: boolean; acquiredAt?: number };
    type I = { itemId: string; quantity?: number };
    type E = SaveEquipment;
    type Party = SaveParty;

    // miscData 用サニタイズヘルパー
    const strArray = (v: unknown, max = 2000): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : [];
    const starsRecord = (v: unknown): Record<string, number> => {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
      const out: Record<string, number> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>).slice(0, 3000)) {
        const n = Number(val);
        if (Number.isFinite(n)) out[k] = Math.max(0, Math.min(3, Math.round(n)));
      }
      return out;
    };
    // ギルドミッション進捗の報酬定義(reward/rewardData)はクライアントの
    // GUILD_MISSIONS定数を信頼する(非マネタイズのローカル主導設計のため)。
    // ここでは型・上限のみサニタイズする。
    const guildMissionsArray = (v: unknown): Array<Record<string, unknown>> => {
      if (!Array.isArray(v)) return [];
      return v.slice(0, 20).map(m => {
        const mm = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
        const target = Number(mm.target);
        const progress = Number(mm.progress);
        return {
          id: typeof mm.id === 'string' ? mm.id.slice(0, 40) : '',
          type: typeof mm.type === 'string' ? mm.type.slice(0, 20) : '',
          title: typeof mm.title === 'string' ? mm.title.slice(0, 60) : '',
          target: Number.isFinite(target) ? Math.max(0, Math.min(1_000_000, target)) : 0,
          progress: Number.isFinite(progress) ? Math.max(0, Math.min(1_000_000, progress)) : 0,
          reward: typeof mm.reward === 'string' ? mm.reward.slice(0, 40) : '',
          claimed: mm.claimed === true,
          rewardData: mm.rewardData && typeof mm.rewardData === 'object' ? mm.rewardData : null,
        };
      }).filter(m => m.id);
    };
    const guildChatArray = (v: unknown): Array<Record<string, unknown>> => {
      if (!Array.isArray(v)) return [];
      return v.slice(-50).map(m => {
        const mm = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
        const ts = Number(mm.timestamp);
        return {
          sender: typeof mm.sender === 'string' ? mm.sender.slice(0, 20) : '???',
          text: typeof mm.text === 'string' ? mm.text.slice(0, 200) : '',
          timestamp: Number.isFinite(ts) ? ts : Date.now(),
        };
      });
    };
    const loginDaysArray = (v: unknown): number[] => Array.isArray(v)
      ? [...new Set(v.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 30))]
      : [];
    const nullableDateString = (v: unknown): string | null =>
      typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    const arenaHistoryArray = (v: unknown): object[] => Array.isArray(v)
      ? v.filter((entry): entry is object => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry)).slice(-100)
      : [];

    const prevMisc = (player.miscData ?? {}) as Record<string, unknown>;
    const p = state.player as P | undefined;
    const hasUnits = Array.isArray(state.ownedUnits);
    const hasItems = Array.isArray(state.items);
    const hasEquips = Array.isArray(state.ownedEquipments);
    const hasParties = Array.isArray(state.parties);
    const units = (hasUnits ? state.ownedUnits : []) as U[];
    const items = (hasItems ? state.items : []) as I[];
    const equips = (hasEquips ? state.ownedEquipments : []) as E[];
    const parties = (hasParties ? state.parties : []) as Party[];

    if (hasUnits) {
      const invalidUnit = units.some(unit =>
        !unit || typeof unit.instanceId !== 'string' || unit.instanceId.length < 1 || unit.instanceId.length > 100
        || typeof unit.masterId !== 'string' || !UNIT_RARITY_BY_ID.has(unit.masterId),
      );
      if (invalidUnit || new Set(units.map(unit => unit.instanceId)).size !== units.length) {
        return badRequest('invalid unit records');
      }
    }
    if (hasItems) {
      const invalidItem = items.length > 5000 || items.some(item =>
        !item || typeof item.itemId !== 'string' || !ITEM_RE.test(item.itemId)
        || typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 0,
      );
      if (invalidItem || new Set(items.map(item => item.itemId)).size !== items.length) {
        return badRequest('invalid item records');
      }
    }
    if (hasEquips) {
      const invalidEquipment = equips.length > 2000 || equips.some(equip =>
        !equip || typeof equip.instanceId !== 'string' || equip.instanceId.length < 1 || equip.instanceId.length > 100
        || typeof equip.masterId !== 'string' || !EQUIPMENT_RE.test(equip.masterId)
        || (equip.equippedTo !== undefined && equip.equippedTo !== null && typeof equip.equippedTo !== 'string'),
      );
      if (invalidEquipment || new Set(equips.map(equip => equip.instanceId)).size !== equips.length) {
        return badRequest('invalid equipment records');
      }
    }
    if (hasParties) {
      const invalidParty = parties.length > 20 || parties.some(party => {
        if (!party || typeof party.id !== 'string' || party.id.length < 1 || party.id.length > 80 || !Array.isArray(party.slots) || party.slots.length > 5) return true;
        const slots = party.slots;
        if (slots.some(slot => slot !== null && typeof slot !== 'string')) return true;
        return party.leaderId !== undefined && party.leaderId !== null && typeof party.leaderId !== 'string';
      });
      if (invalidParty || new Set(parties.map(party => party.id)).size !== parties.length) {
        return badRequest('invalid party records');
      }
    }
    const ownedUnitIds = new Set(hasUnits
      ? units.map(unit => unit.instanceId)
      : (hasEquips || hasParties || typeof p?.favoriteUnitInstanceId === 'string')
        ? (await prisma.ownedUnit.findMany({ where: { playerId: player.playerId }, select: { instanceId: true } })).map(unit => unit.instanceId)
        : []);
    // Older local saves can retain optional references after a unit was removed.
    // Heal those references instead of permanently rejecting the complete save.
    const normalized = normalizeOwnedUnitReferences(
      equips, parties, p?.favoriteUnitInstanceId, ownedUnitIds,
    );
    const { normalizedEquips, normalizedParties } = normalized;
    let favoriteUnitId: string | null | undefined;
    if (p && Object.hasOwn(p, 'favoriteUnitInstanceId')) {
      favoriteUnitId = normalized.favoriteUnitId;
    }

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
          staminaRecoveryTime: typeof p?.staminaRecoveryTime === 'number' && Number.isFinite(p.staminaRecoveryTime) ? BigInt(Math.floor(p.staminaRecoveryTime)) : undefined,
          title: typeof p?.title === 'string' ? p.title.slice(0, 50) : undefined,
          bio: typeof p?.bio === 'string' ? p.bio.slice(0, 200) : undefined,
          favoriteUnitId,
          loginDays: typeof p?.loginDays === 'number' ? clamp(p.loginDays, 1, 100_000) : undefined,
          // arcanaPlayerId はここで更新しない: 登録時(/api/auth)にサーバー側で一度だけ発行される
          // 不変の識別子であり、フレンド申請/削除がこれを検索キーに使う。
          // 以前はクライアントの player.playerId をそのまま書き戻していたため、
          // 端末上でアカウントを切り替えた直後(resetAllStores 直後)に
          // ローカルで新規生成されたダミーIDでサーバーの本物のIDを上書きしてしまい、
          // フレンド申請の宛先解決が壊れる不具合があった。
          tutorialCompleted: state.tutorialCompleted === true ? true : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          miscData: JSON.parse(JSON.stringify({
            awakeningCrystals: state.awakeningCrystals !== undefined ? awakeningCrystalsRecord(state.awakeningCrystals) : awakeningCrystalsRecord(prevMisc.awakeningCrystals),
            raidStates: state.raidStates !== undefined ? raidStatesArray(state.raidStates) : raidStatesArray(prevMisc.raidStates),
            // 旧バージョンのクライアントがキーを送らない場合は既存のDB値を保持する
            achievementsClaimed: state.achievementsClaimed !== undefined ? strArray(state.achievementsClaimed) : strArray(prevMisc.achievementsClaimed),
            collectionDiscovered: state.collectionDiscovered !== undefined ? strArray(state.collectionDiscovered) : strArray(prevMisc.collectionDiscovered),
            collectionDiscoveredEquips: state.collectionDiscoveredEquips !== undefined ? strArray(state.collectionDiscoveredEquips) : strArray(prevMisc.collectionDiscoveredEquips),
            giftClaimedIds: state.giftClaimedIds !== undefined ? strArray(state.giftClaimedIds) : strArray(prevMisc.giftClaimedIds),
            stageStars: state.stageStars !== undefined ? starsRecord(state.stageStars) : starsRecord(prevMisc.stageStars),
            guildMissions: state.guildMissions !== undefined ? guildMissionsArray(state.guildMissions) : (prevMisc.guildMissions ?? []),
            guildChatMessages: state.guildChatMessages !== undefined ? guildChatArray(state.guildChatMessages) : (prevMisc.guildChatMessages ?? []),
            guildLastMissionReset: typeof state.guildLastMissionReset === 'string' ? state.guildLastMissionReset.slice(0, 20) : (prevMisc.guildLastMissionReset ?? ''),
          })) as any,
          updatedAt: new Date(),
        },
      });

      if (hasUnits) await tx.ownedUnit.deleteMany({ where: { playerId: player.playerId } });
      if (hasUnits && units.length > 0) {
        await tx.ownedUnit.createMany({
          data: units.filter(u => u.instanceId && UNIT_RARITY_BY_ID.has(u.masterId)).map(u => ({
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

      if (hasItems) await tx.playerItem.deleteMany({ where: { playerId: player.playerId } });
      if (hasItems && items.length > 0) {
        await tx.playerItem.createMany({ data: items.filter(i => i.itemId).map(i => ({ playerId: player.playerId, itemId: String(i.itemId), quantity: clamp(i.quantity, 0, 999_999) })), skipDuplicates: true });
      }

      if (hasEquips) await tx.ownedEquipment.deleteMany({ where: { playerId: player.playerId } });
      if (hasEquips && normalizedEquips.length > 0) {
        await tx.ownedEquipment.createMany({ data: normalizedEquips.filter(e => e.instanceId && e.masterId).map(e => ({ instanceId: String(e.instanceId), playerId: player.playerId, masterId: String(e.masterId), level: clamp(e.level, 1, 999), exp: clamp(e.exp, 0, 999_999_999), equippedTo: e.equippedTo ?? null })), skipDuplicates: true });
      }

      const hasQuestProgress = state.clearedStageIds !== undefined || state.claimedAreaRewards !== undefined || state.lastSelectedWorldId !== undefined;
      if (hasQuestProgress) {
        const existing = await tx.playerQuestProgress.findUnique({ where: { playerId: player.playerId } });
        const validatedCleared = Array.isArray(state.clearedStageIds)
          ? validateStageProgression((state.clearedStageIds as unknown[]).filter((id): id is string => typeof id === 'string' && isValidStageId(id)), new Set(existing?.clearedStageIds ?? []))
          : existing?.clearedStageIds ?? [];
        const claimedAreaRewards = state.claimedAreaRewards !== undefined
          ? [...new Set(strArray(state.claimedAreaRewards).filter(area => AREA_RE.test(area)))]
          : existing?.claimedAreaRewards ?? [];
        const lastSelectedWorldId = state.lastSelectedWorldId !== undefined
          ? (typeof state.lastSelectedWorldId === 'string' && WORLD_RE.test(state.lastSelectedWorldId) ? state.lastSelectedWorldId : null)
          : existing?.lastSelectedWorldId ?? null;
        await tx.playerQuestProgress.upsert({
        where: { playerId: player.playerId },
        update: { clearedStageIds: validatedCleared, claimedAreaRewards, lastSelectedWorldId },
        create: { playerId: player.playerId, clearedStageIds: validatedCleared, claimedAreaRewards, lastSelectedWorldId },
        });
      }

      if (hasParties) await tx.playerParty.deleteMany({ where: { playerId: player.playerId } });
      if (hasParties && normalizedParties.length > 0) {
        await tx.playerParty.createMany({ data: normalizedParties.map(party => ({ id: `${player.playerId}_${party.id}`, playerId: player.playerId, partyId: String(party.id), name: typeof party.name === 'string' ? party.name.trim().slice(0, 30) || 'パーティ' : 'パーティ', slots: [...(party.slots ?? []).slice(0, 5), ...Array(5).fill(null)].slice(0, 5) as (string | null)[], leaderId: party.leaderId ?? null, isActive: party.id === (state.activePartyId as string) })) });
      }

      const md = state.missionDaily as { date?: string; progresses?: unknown } | undefined;
      const existingMission = md || state.missionWeeklyProgresses !== undefined
        ? await tx.playerMissionProgress.findUnique({ where: { playerId: player.playerId } }) : null;
      if (md || state.missionWeeklyProgresses !== undefined) await tx.playerMissionProgress.upsert({
        where: { playerId: player.playerId },
        update: { dailyDate: md?.date ?? existingMission?.dailyDate ?? '', dailyData: (md?.progresses ?? existingMission?.dailyData ?? []) as object[], weeklyData: (state.missionWeeklyProgresses ?? existingMission?.weeklyData ?? []) as object[], weekStr: (state.missionWeekStr as string) ?? existingMission?.weekStr ?? '' },
        create: { playerId: player.playerId, dailyDate: md?.date ?? '', dailyData: (md?.progresses ?? []) as object[], weeklyData: (state.missionWeeklyProgresses ?? []) as object[], weekStr: (state.missionWeekStr as string) ?? '' },
      });

      const hasLoginBonus = state.loginBonusCurrentDay !== undefined || state.loginBonusLastClaimedDate !== undefined || state.loginBonusLastLoginDate !== undefined || state.loginBonusClaimedDays !== undefined;
      const existingLogin = hasLoginBonus ? await tx.playerLoginBonus.findUnique({ where: { playerId: player.playerId } }) : null;
      if (hasLoginBonus) await tx.playerLoginBonus.upsert({
        where: { playerId: player.playerId },
        update: { lastClaimedDate: state.loginBonusLastClaimedDate !== undefined ? nullableDateString(state.loginBonusLastClaimedDate) : existingLogin?.lastClaimedDate, lastLoginDate: state.loginBonusLastLoginDate !== undefined ? nullableDateString(state.loginBonusLastLoginDate) : existingLogin?.lastLoginDate, claimedDays: state.loginBonusClaimedDays !== undefined ? loginDaysArray(state.loginBonusClaimedDays) : existingLogin?.claimedDays ?? [], currentDay: typeof state.loginBonusCurrentDay === 'number' ? clamp(state.loginBonusCurrentDay, 1, 30) : existingLogin?.currentDay ?? 1 },
        create: { playerId: player.playerId, lastClaimedDate: nullableDateString(state.loginBonusLastClaimedDate), lastLoginDate: nullableDateString(state.loginBonusLastLoginDate), claimedDays: loginDaysArray(state.loginBonusClaimedDays), currentDay: typeof state.loginBonusCurrentDay === 'number' ? clamp(state.loginBonusCurrentDay, 1, 30) : 1 },
      });

      const ar = state.arenaRecord as { wins?: number; losses?: number; rank?: number; points?: number; season?: number } | undefined;
      const hasArena = Boolean(ar) || state.arenaBattleHistory !== undefined;
      const existingArena = hasArena ? await tx.playerArenaRecord.findUnique({ where: { playerId: player.playerId } }) : null;
      if (hasArena) await tx.playerArenaRecord.upsert({
        where: { playerId: player.playerId },
        update: { wins: ar?.wins !== undefined ? clamp(ar.wins, 0, 1_000_000) : existingArena?.wins ?? 0, losses: ar?.losses !== undefined ? clamp(ar.losses, 0, 1_000_000) : existingArena?.losses ?? 0, rank: ar?.rank !== undefined ? clamp(ar.rank, 1, 999_999) : existingArena?.rank ?? 999, points: ar?.points !== undefined ? clamp(ar.points, 0, 10_000_000) : existingArena?.points ?? 1000, season: ar?.season !== undefined ? clamp(ar.season, 1, 10_000) : existingArena?.season ?? 1, battleHistory: state.arenaBattleHistory !== undefined ? arenaHistoryArray(state.arenaBattleHistory) : arenaHistoryArray(existingArena?.battleHistory) },
        create: { playerId: player.playerId, wins: clamp(ar?.wins ?? 0, 0, 1_000_000), losses: clamp(ar?.losses ?? 0, 0, 1_000_000), rank: clamp(ar?.rank ?? 999, 1, 999_999), points: clamp(ar?.points ?? 1000, 0, 10_000_000), season: clamp(ar?.season ?? 1, 1, 10_000), battleHistory: arenaHistoryArray(state.arenaBattleHistory) },
      });
    });

    return res.status(200).json({ ok: true });
  }

  return badRequest('Unknown action');
}
