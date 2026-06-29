import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuestProgress {
  clearedStageIds: string[];
  pendingStageId: string | null;  // フレンド選択前に保持するステージID
  pendingFriendId: string | null;
}

interface QuestStore extends QuestProgress {
  markCleared: (stageId: string) => void;
  setPendingStage: (stageId: string | null) => void;
  setPendingFriend: (friendId: string | null) => void;
  isCleared: (stageId: string) => boolean;
  clearPending: () => void;
  checkAreaComplete: (stageId: string) => boolean;
  claimedAreaRewards: string[];
  claimAreaReward: (areaKey: string) => void;
  lastSelectedWorldId: string | null;
  setLastSelectedWorldId: (id: string) => void;
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
      claimedAreaRewards: [],
      lastSelectedWorldId: null,
      setLastSelectedWorldId: (id) => set({ lastSelectedWorldId: id }),

      markCleared: (stageId) => {
        const { clearedStageIds } = get();
        if (!clearedStageIds.includes(stageId)) {
          set(s => ({ clearedStageIds: [...s.clearedStageIds, stageId] }));
        }
      },

      setPendingStage: (stageId) => set({ pendingStageId: stageId }),
      setPendingFriend: (friendId) => set({ pendingFriendId: friendId }),

      isCleared: (stageId) => get().clearedStageIds.includes(stageId),

      clearPending: () => set({ pendingStageId: null, pendingFriendId: null }),

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
