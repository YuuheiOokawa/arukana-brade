/**
 * POST /api/player/saveAll
 * 全ゲーム状態をDBに一括保存する（$transactionで全テーブル一括更新）
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

// ゲームバランス上の上限値（チート防止）
const MAX_GOLD       = 999_999_999;
const MAX_DIAMOND    = 999_999;
const MAX_STAMINA    = 999;
const MAX_RANK       = 200;
const MAX_STATE_BYTES = 500_000; // 500KB 上限

interface PlayerData {
  name?: string;
  rank?: number;
  exp?: number;
  gold?: number;
  diamond?: number;
  stamina?: number;
  maxStamina?: number;
  staminaRecoveryTime?: number;
  title?: string;
  bio?: string;
  favoriteUnitInstanceId?: string | null;
  loginDays?: number;
  playerId?: string;
}

interface OwnedUnitData {
  instanceId: string;
  masterId: string;
  level?: number;
  exp?: number;
  awakenRank?: number;
  awakeningCount?: number;
  currentRarity?: string | number;
  isLocked?: boolean;
  acquiredAt?: number;
}

interface OwnedItemData {
  itemId: string;
  quantity?: number;
}

interface OwnedEquipmentData {
  instanceId: string;
  masterId: string;
  level?: number;
  exp?: number;
  equippedTo?: string | null;
}

interface PartyData {
  id: string;
  name?: string;
  slots?: (string | null)[];
  leaderId?: string | null;
}

interface GameStateBody {
  state: Record<string, unknown>;
}

// stage IDのフォーマット検証: stage_{world}_{area}_{num}
const STAGE_RE = /^stage_\d+_\d+_\d+$/;
const isValidStageId = (id: string) => STAGE_RE.test(id);

// クリア済みセットに対してステージの到達可能性を検証し、
// 有効なステージのみを含む配列を返す
function validateStageProgression(incoming: string[], dbCleared: Set<string>): string[] {
  // DB確定値を基準に、新規クリアを1つずつ検証して追加する
  const confirmed = new Set<string>(dbCleared);

  // ステージが到達可能かチェック（既クリアセット内で）
  const isAccessible = (stageId: string, cleared: Set<string>): boolean => {
    const parts = stageId.split('_'); // ['stage', world, area, num]
    const world = Number(parts[1]);
    const area = Number(parts[2]);
    const num = Number(parts[3]);
    if (!world || !area || !num) return false;

    if (num === 1) {
      // エリア最初のステージ: エリア1は常に開放、2以降は前エリアの最終ステージ(5)クリア必須
      if (area === 1) return true;
      return cleared.has(`stage_${world}_${area - 1}_5`);
    } else {
      // 前のステージがクリア済みなら到達可能
      return cleared.has(`stage_${world}_${area}_${num - 1}`);
    }
  };

  // 未確定のステージを繰り返し処理（依存関係のため複数パスが必要な場合あり）
  let remaining = incoming.filter(id => !confirmed.has(id));
  let prevSize = -1;
  while (remaining.length > 0 && remaining.length !== prevSize) {
    prevSize = remaining.length;
    const nextRemaining: string[] = [];
    for (const id of remaining) {
      if (isAccessible(id, confirmed)) {
        confirmed.add(id);
      } else {
        nextRemaining.push(id);
      }
    }
    remaining = nextRemaining;
  }

  return Array.from(confirmed);
}

const clamp = (v: unknown, min: number, max: number): number => {
  if (typeof v !== 'number' || !isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.floor(v)));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findUnique({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as GameStateBody;
  if (!body?.state || typeof body.state !== 'object' || Array.isArray(body.state)) {
    return res.status(400).json({ error: 'state object required' });
  }

  // ペイロードサイズチェック
  const stateStr = JSON.stringify(body.state);
  if (stateStr.length > MAX_STATE_BYTES) {
    return res.status(413).json({ error: 'state too large' });
  }

  const { state } = body;
  const p = state.player as PlayerData | undefined;
  const units = (Array.isArray(state.ownedUnits) ? state.ownedUnits : []) as OwnedUnitData[];
  const items = (Array.isArray(state.items) ? state.items : []) as OwnedItemData[];
  const equipments = (Array.isArray(state.ownedEquipments) ? state.ownedEquipments : []) as OwnedEquipmentData[];
  const parties = (Array.isArray(state.parties) ? state.parties : []) as PartyData[];

  await prisma.$transaction(async (tx) => {
    // Player メイン stats
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
        staminaRecoveryTime: BigInt(p?.staminaRecoveryTime ?? 0),
        title: typeof p?.title === 'string' ? p.title.slice(0, 50) : undefined,
        bio: typeof p?.bio === 'string' ? p.bio.slice(0, 200) : undefined,
        favoriteUnitId: p?.favoriteUnitInstanceId ?? null,
        loginDays: typeof p?.loginDays === 'number' ? p.loginDays : undefined,
        arcanaPlayerId: typeof p?.playerId === 'string' ? p.playerId : undefined,
        tutorialCompleted: state.tutorialCompleted === true ? true : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        miscData: JSON.parse(JSON.stringify({
          awakeningCrystals: (state.awakeningCrystals as Record<string, number>) ?? {},
          raidStates: (state.raidStates as unknown[]) ?? [],
        })) as any,
        updatedAt: new Date(),
      },
    });

    // OwnedUnit: 全削除 → 再作成
    await tx.ownedUnit.deleteMany({ where: { playerId: player.playerId } });
    if (units.length > 0) {
      await tx.ownedUnit.createMany({
        data: units
          .filter(u => u.instanceId && u.masterId)
          .map(u => ({
            instanceId: String(u.instanceId),
            playerId: player.playerId,
            masterId: String(u.masterId),
            level: clamp(u.level, 1, 999),
            exp: clamp(u.exp, 0, 999_999_999),
            awakenRank: clamp(u.awakenRank, 0, 10),
            awakeningCount: clamp(u.awakeningCount, 0, 10),
            currentRarity: String(u.currentRarity ?? '1'),
            isLocked: u.isLocked ?? false,
            acquiredAt: BigInt(typeof u.acquiredAt === 'number' ? u.acquiredAt : 0),
          })),
        skipDuplicates: true,
      });
    }

    // PlayerItem: 全削除 → 再作成
    await tx.playerItem.deleteMany({ where: { playerId: player.playerId } });
    if (items.length > 0) {
      await tx.playerItem.createMany({
        data: items
          .filter(i => i.itemId)
          .map(i => ({
            playerId: player.playerId,
            itemId: String(i.itemId),
            quantity: clamp(i.quantity, 0, 999_999),
          })),
        skipDuplicates: true,
      });
    }

    // OwnedEquipment: 全削除 → 再作成
    await tx.ownedEquipment.deleteMany({ where: { playerId: player.playerId } });
    if (equipments.length > 0) {
      await tx.ownedEquipment.createMany({
        data: equipments
          .filter(e => e.instanceId && e.masterId)
          .map(e => ({
            instanceId: String(e.instanceId),
            playerId: player.playerId,
            masterId: String(e.masterId),
            level: clamp(e.level, 1, 999),
            exp: clamp(e.exp, 0, 999_999_999),
            equippedTo: e.equippedTo ?? null,
          })),
        skipDuplicates: true,
      });
    }

    // Quest progress（サーバー側でクリア進行を検証）
    const rawCleared = ((state.clearedStageIds as string[]) ?? []).filter(isValidStageId);
    const existingProgress = await tx.playerQuestProgress.findUnique({ where: { playerId: player.playerId } });
    const dbCleared = new Set<string>(existingProgress?.clearedStageIds ?? []);
    // DB確定済みに新クリアを1つずつ検証して追加
    const validatedCleared = validateStageProgression(rawCleared, dbCleared);

    await tx.playerQuestProgress.upsert({
      where: { playerId: player.playerId },
      update: {
        clearedStageIds: validatedCleared,
        claimedAreaRewards: (state.claimedAreaRewards as string[]) ?? [],
        lastSelectedWorldId: (state.lastSelectedWorldId as string) ?? null,
      },
      create: {
        playerId: player.playerId,
        clearedStageIds: validatedCleared,
        claimedAreaRewards: (state.claimedAreaRewards as string[]) ?? [],
        lastSelectedWorldId: (state.lastSelectedWorldId as string) ?? null,
      },
    });

    // Parties: 全削除 → 再作成
    await tx.playerParty.deleteMany({ where: { playerId: player.playerId } });
    if (parties.length > 0) {
      await tx.playerParty.createMany({
        data: parties.map((party: PartyData) => ({
          id: `${player.playerId}_${party.id}`,
          playerId: player.playerId,
          partyId: String(party.id),
          name: typeof party.name === 'string' ? party.name : 'パーティ',
          slots: (party.slots ?? []) as (string | null)[],
          leaderId: party.leaderId ?? null,
          isActive: party.id === (state.activePartyId as string),
        })),
      });
    }

    // Mission progress
    const missionDaily = state.missionDaily as { date?: string; progresses?: unknown } | undefined;
    await tx.playerMissionProgress.upsert({
      where: { playerId: player.playerId },
      update: {
        dailyDate: missionDaily?.date ?? '',
        dailyData: (missionDaily?.progresses ?? []) as object[],
        weeklyData: (state.missionWeeklyProgresses ?? []) as object[],
        weekStr: (state.missionWeekStr as string) ?? '',
      },
      create: {
        playerId: player.playerId,
        dailyDate: missionDaily?.date ?? '',
        dailyData: (missionDaily?.progresses ?? []) as object[],
        weeklyData: (state.missionWeeklyProgresses ?? []) as object[],
        weekStr: (state.missionWeekStr as string) ?? '',
      },
    });

    // Login bonus
    await tx.playerLoginBonus.upsert({
      where: { playerId: player.playerId },
      update: {
        lastClaimedDate: (state.loginBonusLastClaimedDate as string) ?? null,
        lastLoginDate: (state.loginBonusLastLoginDate as string) ?? null,
        claimedDays: (state.loginBonusClaimedDays as number[]) ?? [],
        currentDay: typeof state.loginBonusCurrentDay === 'number' ? state.loginBonusCurrentDay : 1,
      },
      create: {
        playerId: player.playerId,
        lastClaimedDate: (state.loginBonusLastClaimedDate as string) ?? null,
        lastLoginDate: (state.loginBonusLastLoginDate as string) ?? null,
        claimedDays: (state.loginBonusClaimedDays as number[]) ?? [],
        currentDay: typeof state.loginBonusCurrentDay === 'number' ? state.loginBonusCurrentDay : 1,
      },
    });

    // Arena record
    const arenaRecord = state.arenaRecord as { wins?: number; losses?: number; rank?: number; points?: number; season?: number } | undefined;
    await tx.playerArenaRecord.upsert({
      where: { playerId: player.playerId },
      update: {
        wins: arenaRecord?.wins ?? 0,
        losses: arenaRecord?.losses ?? 0,
        rank: arenaRecord?.rank ?? 999,
        points: arenaRecord?.points ?? 1000,
        season: arenaRecord?.season ?? 1,
        battleHistory: (state.arenaBattleHistory ?? []) as object[],
      },
      create: {
        playerId: player.playerId,
        wins: arenaRecord?.wins ?? 0,
        losses: arenaRecord?.losses ?? 0,
        rank: arenaRecord?.rank ?? 999,
        points: arenaRecord?.points ?? 1000,
        season: arenaRecord?.season ?? 1,
        battleHistory: (state.arenaBattleHistory ?? []) as object[],
      },
    });
  });

  return res.status(200).json({ ok: true });
}
