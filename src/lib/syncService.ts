/**
 * syncService - 全ゲームデータのDB同期サービス
 *
 * - scheduleSave(): 1.5秒デバウンスで自動保存
 * - saveImmediately(): ページ離脱時などに即時保存
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

// 保存失敗をUIに通知するコールバック（App.tsxからセット）
let onSaveError: ((msg: string) => void) | null = null;
export const setSaveErrorHandler = (handler: (msg: string) => void) => {
  onSaveError = handler;
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
  // オフライン時はスキップ（localStorage に保存済み）
  if (!navigator.onLine) {
    failedSaveState = collectGameState();
    return;
  }
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
    failedSaveState = null; // 成功したらリトライキューをクリア
  } catch (err) {
    // 失敗した状態を保持（次回オンライン時にリトライ）
    if (!failedSaveState) failedSaveState = collectGameState();
    console.error('[syncService] save failed:', err);
    onSaveError?.('データの保存に失敗しました。ネットワークを確認してください。');
  } finally {
    isSaving = false;
  }
};

// オンライン復帰時に自動リトライ
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (failedSaveState) {
      void saveAllToServer();
    }
  });
}

// デバウンス保存（3秒後に実行 - 通常の状態変化）
export const scheduleSave = (delayMs = 3000) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveAllToServer();
  }, delayMs);
};

// 即時保存（バトル終了・ガチャなど重要操作 / ページ離脱時）
export const saveImmediately = () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  void saveAllToServer();
};

// DBから取得したgameStateJsonで全ストアを復元
export const hydrateFromGameState = (gameState: Record<string, unknown>) => {
  if (!gameState || typeof gameState !== 'object') return;

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
};

// ストア変更を監視して自動デバウンス保存を設定
// - 通貨・ユニット変化（バトル後など）: 1秒デバウンス（取りこぼしを防ぐ重要データ）
// - その他（編成・クエスト進捗など）: 3秒デバウンス
export const initAutoSave = () => {
  const unsubs = [
    usePlayerStore.subscribe(() => scheduleSave(1000)),   // gold/diamond/stamina変化は早め
    useUnitStore.subscribe(() => scheduleSave(1000)),     // ユニット変化も早め
    useQuestStore.subscribe(() => scheduleSave(3000)),
    usePartyStore.subscribe(() => scheduleSave(3000)),
    useEquipmentStore.subscribe(() => scheduleSave(3000)),
    useMissionStore.subscribe(() => scheduleSave(3000)),
    useLoginBonusStore.subscribe(() => scheduleSave(3000)),
    useArenaStore.subscribe(() => scheduleSave(1000)),    // アリーナ結果は早め
  ];
  return () => unsubs.forEach(u => u());
};
