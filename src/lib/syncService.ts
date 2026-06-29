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
import type { PlayerData, OwnedItem } from '../types';

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
    // tutorialStore
    tutorialCompleted: ts.completed,
    // arenaStore
    arenaRecord: as.record,
    arenaBattleHistory: as.battleHistory,
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
    const res = await fetch('/api/player/saveAll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
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
  const body = JSON.stringify({ state });
  // keepalive の制限は 64KB。超える場合は通常のセーブに任せる
  if (body.length > 60_000) return;
  try {
    fetch('/api/player/saveAll', {
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

// DBから取得したgameStateJsonで全ストアを復元
export const hydrateFromGameState = (gameState: Record<string, unknown>) => {
  if (!gameState || typeof gameState !== 'object') return;

  isHydrating = true;

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
    });
  }

  // arenaStore
  if (gameState.arenaRecord) {
    useArenaStore.setState({
      record: gameState.arenaRecord as ReturnType<typeof useArenaStore.getState>['record'],
      battleHistory: (gameState.arenaBattleHistory as ReturnType<typeof useArenaStore.getState>['battleHistory']) ?? [],
    });
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
  useQuestStore.setState({ clearedStageIds: [], claimedAreaRewards: [], pendingStageId: null, pendingFriendId: null });
  usePartyStore.setState({
    parties: [{ id: 'party_default', name: 'パーティ1', slots: [null, null, null, null, null], leaderId: null }],
    activePartyId: 'party_default',
  });
  useEquipmentStore.setState({ ownedEquipments: [] });
  useMissionStore.setState({ daily: { date: '', progresses: [] }, weeklyProgresses: [], weekStr: '' });
  useLoginBonusStore.setState({ lastClaimedDate: null, claimedDays: [], currentDay: 1 });
  useArenaStore.setState({ record: { wins: 0, losses: 0, rank: 999, points: 1000, season: 1 }, battleHistory: [] });
  useTutorialStore.setState({ completed: false, phase: 'title', playerName: '', selectedHeroId: null, selectedGender: null, selectedRace: null });
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
  ];
  return () => unsubs.forEach(u => u());
};
