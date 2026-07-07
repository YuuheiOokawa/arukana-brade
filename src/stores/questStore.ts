import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FriendCandidate } from '../types';

interface QuestProgress {
  clearedStageIds: string[];
  pendingStageId: string | null;
  pendingFriendId: string | null;
  pendingFriendCandidate: FriendCandidate | null; // DBフレンド選択時に完全なデータを保持
}

interface QuestStore extends QuestProgress {
  markCleared: (stageId: string) => void;
  setPendingStage: (stageId: string | null) => void;
  setPendingFriend: (friendId: string | null, candidate?: FriendCandidate | null) => void;
  isCleared: (stageId: string) => boolean;
  clearPending: () => void;
  checkAreaComplete: (stageId: string) => boolean;
  claimedAreaRewards: string[];
  claimAreaReward: (areaKey: string) => void;
  lastSelectedWorldId: string | null;
  setLastSelectedWorldId: (id: string) => void;

  // ハードモード: 選択中の難易度（バトル開始時にBattlePageが参照）
  pendingHard: boolean;
  setPendingHard: (hard: boolean) => void;

  // 星評価: ステージごとの最高星数 (1〜3)。ハードは "hard_" プレフィックスキーで記録
  stageStars: Record<string, number>;
  recordStars: (stageKey: string, stars: number) => void;
  getStars: (stageKey: string) => number;
}

// stageId フォーマット: stage_{world}_{area}_{stage}
const getAreaKey = (stageId: string) => {
  const parts = stageId.split('_');
  return parts.length >= 3 ? `${parts[1]}_${parts[2]}` : null;
};

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      clearedStageIds: [],
      pendingStageId: null,
      pendingFriendId: null,
      pendingFriendCandidate: null,
      claimedAreaRewards: [],
      lastSelectedWorldId: null,
      pendingHard: false,
      stageStars: {},
      setLastSelectedWorldId: (id) => set({ lastSelectedWorldId: id }),

      setPendingHard: (hard) => set({ pendingHard: hard }),

      recordStars: (stageKey, stars) => {
        set(s => ({
          stageStars: {
            ...s.stageStars,
            [stageKey]: Math.max(s.stageStars[stageKey] ?? 0, stars),
          },
        }));
      },

      getStars: (stageKey) => get().stageStars[stageKey] ?? 0,

      markCleared: (stageId) => {
        const { clearedStageIds } = get();
        if (!clearedStageIds.includes(stageId)) {
          set(s => ({ clearedStageIds: [...s.clearedStageIds, stageId] }));
        }
      },

      setPendingStage: (stageId) => set({ pendingStageId: stageId }),
      setPendingFriend: (friendId, candidate = null) => set({ pendingFriendId: friendId, pendingFriendCandidate: candidate }),

      isCleared: (stageId) => get().clearedStageIds.includes(stageId),

      clearPending: () => set({ pendingStageId: null, pendingFriendId: null, pendingFriendCandidate: null, pendingHard: false }),

      // エリア内の全5ステージがクリア済みか確認
      checkAreaComplete: (stageId) => {
        const areaKey = getAreaKey(stageId);
        if (!areaKey) return false;
        const { clearedStageIds, claimedAreaRewards } = get();
        if (claimedAreaRewards.includes(areaKey)) return false;
        const [world, area] = areaKey.split('_');
        const areaStages = [1, 2, 3, 4, 5].map(n => `stage_${world}_${area}_${n}`);
        return areaStages.every(id => clearedStageIds.includes(id) || id === stageId);
      },

      claimAreaReward: (areaKey) => {
        set(s => ({ claimedAreaRewards: [...s.claimedAreaRewards, areaKey] }));
      },
    }),
    { name: 'arcana-quests' }
  )
);
