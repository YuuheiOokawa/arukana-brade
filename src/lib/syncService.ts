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

// DBへ保存
export const saveAllToServer = async () => {
  if (isSaving) return;
  isSaving = true;
  try {
    const state = collectGameState();
    await fetch('/api/player/saveAll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  } catch {
    // ネットワークエラーは無視（localStorage がバックアップ）
  } finally {
    isSaving = false;
  }
};

// デバウンス保存（1.5秒後に実行）
export const scheduleSave = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveAllToServer();
  }, 1500);
};

// 即時保存（ページ離脱時などに使用）
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
// App.tsx の useEffect 内で呼び出す
export const initAutoSave = () => {
  const unsubs = [
    usePlayerStore.subscribe(() => scheduleSave()),
    useUnitStore.subscribe(() => scheduleSave()),
    useQuestStore.subscribe(() => scheduleSave()),
    usePartyStore.subscribe(() => scheduleSave()),
    useEquipmentStore.subscribe(() => scheduleSave()),
    useMissionStore.subscribe(() => scheduleSave()),
    useLoginBonusStore.subscribe(() => scheduleSave()),
    useArenaStore.subscribe(() => scheduleSave()),
  ];
  return () => unsubs.forEach(u => u());
};
