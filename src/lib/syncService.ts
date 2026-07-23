/**
 * syncService - 全ゲームデータのDB同期サービス
 *
 * - scheduleSave(): デバウンスで自動保存
 * - saveImmediately(): blur時などに即時保存
 * - saveBeforeUnload(): ページ離脱時の keepalive 保存
 * - hydrateFromGameState(): 認証後にDBからストアを復元
 */
import { usePlayerStore } from '../stores/playerStore';
import { useUnitStore } from '../stores/unitStore';
import { useQuestStore } from '../stores/questStore';
import { usePartyStore } from '../stores/partyStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { useMissionStore } from '../stores/missionStore';
import { useLoginBonusStore } from '../stores/loginBonusStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { useArenaStore } from '../stores/arenaStore';
import { useRaidStore } from '../stores/raidStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useCollectionStore } from '../stores/collectionStore';
import { useGiftStore } from '../stores/giftStore';
import type { PlayerData, OwnedItem, OwnedUnit, OwnedEquipment } from '../types';
import type { GameDataResponse } from '../stores/authStore';
import { getUnitMaster, calcUnitStats } from '../data/units';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let isSaving = false;
let failedSaveState: ReturnType<typeof collectGameState> | null = null;
// hydrateFromGameState / resetAllStores 実行中はセーブをスキップする（DBの古いデータで上書きを防ぐ）
let isHydrating = false;

// 保存失敗をUIに通知するコールバック（App.tsxからセット）
let onSaveError: ((msg: string) => void) | null = null;
export const setSaveErrorHandler = (handler: (msg: string) => void) => {
  onSaveError = handler;
};

// 保存成功をUIに通知するコールバック（App.tsxからセット）
let onSaveSuccess: (() => void) | null = null;
export const setSaveSuccessHandler = (handler: () => void) => {
  onSaveSuccess = handler;
};

// 全ストア状態を1つのJSONに収集
export const collectGameState = () => {
  const ps = usePlayerStore.getState();
  const us = useUnitStore.getState();
  const qs = useQuestStore.getState();
  const party = usePartyStore.getState();
  const eq = useEquipmentStore.getState();
  const ms = useMissionStore.getState();
  const lb = useLoginBonusStore.getState();
  const ts = useTutorialStore.getState();
  const as = useArenaStore.getState();
  const rs = useRaidStore.getState();
  const ach = useAchievementStore.getState();
  const col = useCollectionStore.getState();
  const gift = useGiftStore.getState();

  return {
    // playerStore
    player: ps.player,
    items: ps.items,
    // unitStore
    ownedUnits: us.ownedUnits,
    awakeningCrystals: us.awakeningCrystals,
    // questStore
    clearedStageIds: qs.clearedStageIds,
    claimedAreaRewards: qs.claimedAreaRewards,
    lastSelectedWorldId: qs.lastSelectedWorldId,
    stageStars: qs.stageStars,
    // partyStore
    parties: party.parties,
    activePartyId: party.activePartyId,
    // equipmentStore
    ownedEquipments: eq.ownedEquipments,
    // missionStore
    missionDaily: ms.daily,
    missionWeeklyProgresses: ms.weeklyProgresses,
    missionWeekStr: ms.weekStr,
    // loginBonusStore
    loginBonusLastClaimedDate: lb.lastClaimedDate,
    loginBonusClaimedDays: lb.claimedDays,
    loginBonusCurrentDay: lb.currentDay,
    loginBonusLastLoginDate: lb.lastLoginDate,
    // tutorialStore
    tutorialCompleted: ts.completed,
    // arenaStore
    arenaRecord: as.record,
    arenaBattleHistory: as.battleHistory,
    // raidStore
    raidStates: rs.raidStates,
    // achievementStore（実績報酬の受取記録）
    achievementsClaimed: ach.claimed,
    // collectionStore（図鑑の発見記録）
    collectionDiscovered: col.discovered,
    collectionDiscoveredEquips: col.discoveredEquips,
    // giftStore（プレゼント受取記録）
    giftClaimedIds: gift.claimedIds,
    // メタ
    savedAt: Date.now(),
  };
};

// DBへ保存（失敗時はリトライキューに積む）
export const saveAllToServer = async () => {
  if (isSaving) return;
  isSaving = true;
  try {
    const state = failedSaveState ?? collectGameState();
    const res = await fetch('/api/player', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveAll', state }),
    });
    if (!res.ok) {
      throw new Error(`saveAll failed: ${res.status}`);
    }
    failedSaveState = null;
    onSaveSuccess?.();
  } catch (err) {
    if (!failedSaveState) failedSaveState = collectGameState();
    console.error('[syncService] save failed:', err);
    onSaveError?.('データの保存に失敗しました。ネットワークを確認してください。');
  } finally {
    isSaving = false;
  }
};

// ページ離脱時専用保存 (keepalive=true でブラウザが強制終了しても送信完了させる)
export const saveBeforeUnload = () => {
  const state = failedSaveState ?? collectGameState();
  const body = JSON.stringify({ action: 'saveAll', state });
  // keepalive の制限は 64KB。超える場合は通常のセーブに任せる
  if (body.length > 60_000) return;
  try {
    fetch('/api/player', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch { /* ignore */ }
};

// オンライン復帰時に自動リトライ
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (failedSaveState) {
      void saveAllToServer();
    }
  });
}

// デバウンス保存
export const scheduleSave = (delayMs = 3000) => {
  if (isHydrating) return; // 復元中はスキップ
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveAllToServer();
  }, delayMs);
};

// 即時保存（バトル終了・ガチャなど重要操作 / ページblur時）
export const saveImmediately = () => {
  if (isHydrating) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  void saveAllToServer();
};

/**
 * DBから取得したデータで全ストアを復元する。
 * 新フォーマット (GameDataResponse) と旧フォーマット (gameStateJson) の両方に対応。
 */
export const hydrateFromGameState = (
  gameStateOrData: Record<string, unknown> | GameDataResponse,
  playerMiscData?: Record<string, unknown>,
  tutorialCompleted?: boolean,
) => {
  if (!gameStateOrData || typeof gameStateOrData !== 'object') return;

  isHydrating = true;

  // 新フォーマット判定: GameDataResponse は ownedUnits / items / ownedEquipments を持つ
  const isNewFormat = 'ownedUnits' in gameStateOrData && Array.isArray((gameStateOrData as GameDataResponse).ownedUnits);

  if (isNewFormat) {
    const gd = gameStateOrData as GameDataResponse;

    // unitStore: DB の OwnedUnit → フロントの OwnedUnit 型に変換
    if (Array.isArray(gd.ownedUnits)) {
      const units: OwnedUnit[] = gd.ownedUnits.map(u => {
        const rarity: OwnedUnit['currentRarity'] = (() => {
          const r = u.currentRarity as unknown;
          if (r === 'CROWN' || r === 'crown' || r === 8 || r === '8') return 'CROWN';
          const n = Number(r);
          return (n >= 1 && n <= 7 ? n : 1) as OwnedUnit['currentRarity'];
        })();
        const awakenRank = u.awakenRank ?? 0;
        const awakeningCount = u.awakeningCount ?? 0;
        const master = getUnitMaster(u.masterId);
        return {
          instanceId: u.instanceId,
          masterId: u.masterId,
          level: u.level,
          exp: u.exp,
          awakenRank,
          awakeningCount,
          currentRarity: rarity,
          currentStats: master
            ? calcUnitStats(master, u.level, awakenRank, awakeningCount)
            : { hp: 0, atk: 0, def: 0, rec: 0 },
          isLocked: u.isLocked,
          acquiredAt: u.acquiredAt,
        };
      });
      useUnitStore.setState({ ownedUnits: units });
    }

    // playerStore: items
    if (Array.isArray(gd.items)) {
      const items: OwnedItem[] = gd.items.map(i => ({ itemId: i.itemId, quantity: i.quantity }));
      usePlayerStore.setState({ items });
    }

    // equipmentStore: OwnedEquipment
    if (Array.isArray(gd.ownedEquipments)) {
      const equipments: OwnedEquipment[] = gd.ownedEquipments.map(e => ({
        instanceId: e.instanceId,
        masterId: e.masterId,
        level: e.level,
        exp: e.exp,
        equippedTo: e.equippedTo ?? undefined,
      }));
      useEquipmentStore.setState({ ownedEquipments: equipments });
    }

    // questStore
    if (gd.questProgress) {
      useQuestStore.setState({
        clearedStageIds: gd.questProgress.clearedStageIds ?? [],
        claimedAreaRewards: gd.questProgress.claimedAreaRewards ?? [],
        lastSelectedWorldId: gd.questProgress.lastSelectedWorldId ?? null,
      });
    }

    // partyStore
    if (Array.isArray(gd.parties) && gd.parties.length > 0) {
      const activeParty = gd.parties.find(p => p.isActive);
      usePartyStore.setState({
        parties: gd.parties.map(p => ({
          id: p.partyId,
          name: p.name,
          slots: p.slots,
          leaderId: p.leaderId,
        })),
        activePartyId: activeParty?.partyId ?? gd.parties[0].partyId,
      });
    }

    // missionStore
    if (gd.missionProgress) {
      useMissionStore.setState({
        daily: {
          date: gd.missionProgress.dailyDate,
          progresses: gd.missionProgress.dailyData as ReturnType<typeof useMissionStore.getState>['daily']['progresses'],
        },
        weeklyProgresses: gd.missionProgress.weeklyData as ReturnType<typeof useMissionStore.getState>['weeklyProgresses'],
        weekStr: gd.missionProgress.weekStr,
      });
    }

    // loginBonusStore
    if (gd.loginBonus) {
      useLoginBonusStore.setState({
        lastClaimedDate: gd.loginBonus.lastClaimedDate ?? null,
        claimedDays: gd.loginBonus.claimedDays ?? [],
        currentDay: gd.loginBonus.currentDay ?? 1,
        lastLoginDate: gd.loginBonus.lastLoginDate ?? null,
      });
    }

    // arenaStore
    if (gd.arenaRecord) {
      useArenaStore.setState({
        record: {
          wins: gd.arenaRecord.wins,
          losses: gd.arenaRecord.losses,
          rank: gd.arenaRecord.rank,
          points: gd.arenaRecord.points,
          season: gd.arenaRecord.season,
        },
        battleHistory: gd.arenaRecord.battleHistory as ReturnType<typeof useArenaStore.getState>['battleHistory'],
      });
    }

    // miscData から awakeningCrystals と raidStates を復元
    if (playerMiscData) {
      if (playerMiscData.awakeningCrystals && typeof playerMiscData.awakeningCrystals === 'object') {
        useUnitStore.setState({ awakeningCrystals: playerMiscData.awakeningCrystals as Record<string, number> });
      }
      if (Array.isArray(playerMiscData.raidStates)) {
        useRaidStore.setState({ raidStates: playerMiscData.raidStates as ReturnType<typeof useRaidStore.getState>['raidStates'] });
      }
      // キーが存在する場合のみ復元（未保存の既存ユーザーの localStorage 値を消さないため）
      if (Array.isArray(playerMiscData.achievementsClaimed)) {
        useAchievementStore.setState({ claimed: playerMiscData.achievementsClaimed as string[] });
      }
      if (Array.isArray(playerMiscData.collectionDiscovered)) {
        useCollectionStore.setState({
          discovered: playerMiscData.collectionDiscovered as string[],
          discoveredEquips: Array.isArray(playerMiscData.collectionDiscoveredEquips)
            ? playerMiscData.collectionDiscoveredEquips as string[]
            : [],
        });
      }
      if (Array.isArray(playerMiscData.giftClaimedIds)) {
        useGiftStore.setState({ claimedIds: playerMiscData.giftClaimedIds as string[] });
      }
      if (playerMiscData.stageStars && typeof playerMiscData.stageStars === 'object' && !Array.isArray(playerMiscData.stageStars)) {
        useQuestStore.setState({ stageStars: playerMiscData.stageStars as Record<string, number> });
      }
    }

  } else {
    // 旧フォーマット（gameStateJson）互換パス
    const gameState = gameStateOrData as Record<string, unknown>;

    // tutorialStore（最重要：これがないと再チュートリアルになる）
    if (gameState.tutorialCompleted === true) {
      useTutorialStore.setState({ completed: true, phase: 'complete' });
    }

    // playerStore
    if (gameState.player && gameState.items) {
      usePlayerStore.setState({
        player: gameState.player as PlayerData,
        items: gameState.items as OwnedItem[],
      });
    }

    // unitStore
    if (Array.isArray(gameState.ownedUnits)) {
      useUnitStore.setState({
        ownedUnits: gameState.ownedUnits as ReturnType<typeof useUnitStore.getState>['ownedUnits'],
        awakeningCrystals: (gameState.awakeningCrystals as Record<string, number>) ?? {},
      });
    }

    // questStore
    if (Array.isArray(gameState.clearedStageIds)) {
      useQuestStore.setState({
        clearedStageIds: gameState.clearedStageIds as string[],
        claimedAreaRewards: (gameState.claimedAreaRewards as string[]) ?? [],
        lastSelectedWorldId: (gameState.lastSelectedWorldId as string | null) ?? null,
      });
    }

    // partyStore
    if (Array.isArray(gameState.parties)) {
      usePartyStore.setState({
        parties: gameState.parties as ReturnType<typeof usePartyStore.getState>['parties'],
        activePartyId: (gameState.activePartyId as string) ?? 'party_default',
      });
    }

    // equipmentStore
    if (Array.isArray(gameState.ownedEquipments)) {
      useEquipmentStore.setState({
        ownedEquipments: gameState.ownedEquipments as ReturnType<typeof useEquipmentStore.getState>['ownedEquipments'],
      });
    }

    // missionStore
    if (gameState.missionDaily) {
      useMissionStore.setState({
        daily: gameState.missionDaily as ReturnType<typeof useMissionStore.getState>['daily'],
        weeklyProgresses: (gameState.missionWeeklyProgresses as ReturnType<typeof useMissionStore.getState>['weeklyProgresses']) ?? [],
        weekStr: (gameState.missionWeekStr as string) ?? '',
      });
    }

    // loginBonusStore
    if (gameState.loginBonusClaimedDays !== undefined) {
      useLoginBonusStore.setState({
        lastClaimedDate: (gameState.loginBonusLastClaimedDate as string | null) ?? null,
        claimedDays: (gameState.loginBonusClaimedDays as number[]) ?? [],
        currentDay: (gameState.loginBonusCurrentDay as number) ?? 1,
        lastLoginDate: (gameState.loginBonusLastLoginDate as string | null) ?? null,
      });
    }

    // arenaStore
    if (gameState.arenaRecord) {
      useArenaStore.setState({
        record: gameState.arenaRecord as ReturnType<typeof useArenaStore.getState>['record'],
        battleHistory: (gameState.arenaBattleHistory as ReturnType<typeof useArenaStore.getState>['battleHistory']) ?? [],
      });
    }
  }

  // 新フォーマット(GameDataResponse)には tutorialCompleted が含まれておらず、
  // 上の isNewFormat 分岐では tutorialStore が一切復元されていなかった
  // （旧フォーマット互換パスの gameState.tutorialCompleted チェックでしか復元されない不具合）。
  // 呼び出し側(authPlayer.tutorialCompleted)から明示的に渡された場合はここで確実に反映する。
  if (tutorialCompleted === true) {
    useTutorialStore.setState({ completed: true, phase: 'complete' });
  }

  // 復元完了後、少し待ってからフラグを解除（setState の subscribe が全部発火するまで待つ）
  setTimeout(() => { isHydrating = false; }, 300);
};

// 全ストアをリセット（別ユーザーへの切り替え時に呼ぶ）
export const resetAllStores = () => {
  isHydrating = true; // リセット中もセーブをスキップ
  const now = Date.now();
  usePlayerStore.setState({
    player: {
      name: '勇者',
      rank: 1,
      exp: 0,
      gold: 5000,
      diamond: 500,
      stamina: 50,
      maxStamina: 50,
      staminaRecoveryTime: now + 5 * 60 * 1000,
      lastLoginAt: now,
      createdAt: now,
      playerId: `ARC-${now.toString(36).toUpperCase()}`,
      title: '駆け出しの勇者',
      bio: '',
      favoriteUnitInstanceId: null,
      loginDays: 1,
    },
    items: [],
    lastUsedFriendId: null,
  });
  useUnitStore.setState({ ownedUnits: [], awakeningCrystals: {} });
  useQuestStore.setState({ clearedStageIds: [], claimedAreaRewards: [], pendingStageId: null, pendingFriendId: null, lastSelectedWorldId: null, stageStars: {}, pendingHard: false });
  usePartyStore.setState({
    parties: [{ id: 'party_default', name: 'パーティ1', slots: [null, null, null, null, null], leaderId: null }],
    activePartyId: 'party_default',
  });
  useEquipmentStore.setState({ ownedEquipments: [] });
  useMissionStore.setState({ daily: { date: '', progresses: [] }, weeklyProgresses: [], weekStr: '' });
  useLoginBonusStore.setState({ lastClaimedDate: null, claimedDays: [], currentDay: 1, lastLoginDate: null });
  useArenaStore.setState({ record: { wins: 0, losses: 0, rank: 999, points: 1000, season: 1 }, battleHistory: [] });
  useTutorialStore.setState({ completed: false, phase: 'title', playerName: '', selectedHeroId: null, selectedGender: null, selectedRace: null, initialGachaDone: false });
  useAchievementStore.setState({ claimed: [] });
  useCollectionStore.setState({ discovered: [], discoveredEquips: [] });
  useGiftStore.setState({ claimedIds: [] });
  setTimeout(() => { isHydrating = false; }, 300);
};

// ストア変更を監視して自動デバウンス保存を設定
export const initAutoSave = () => {
  const unsubs = [
    usePlayerStore.subscribe(() => scheduleSave(1000)),
    useUnitStore.subscribe(() => scheduleSave(1000)),
    useQuestStore.subscribe(() => scheduleSave(2000)),
    usePartyStore.subscribe(() => scheduleSave(2000)),
    useEquipmentStore.subscribe(() => scheduleSave(2000)),
    useMissionStore.subscribe(() => scheduleSave(2000)),
    useLoginBonusStore.subscribe(() => scheduleSave(500)),   // ログインボーナス取得は早めに保存
    useArenaStore.subscribe(() => scheduleSave(1000)),
    useTutorialStore.subscribe(() => scheduleSave(500)),     // チュートリアル完了は早めに保存
    useAchievementStore.subscribe(() => scheduleSave(500)),  // 報酬受取は早めに保存（二重受取防止）
    useCollectionStore.subscribe(() => scheduleSave(2000)),
    useGiftStore.subscribe(() => scheduleSave(500)),         // 報酬受取は早めに保存（二重受取防止）
  ];
  return () => unsubs.forEach(u => u());
};
