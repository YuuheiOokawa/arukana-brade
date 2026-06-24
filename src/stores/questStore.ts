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
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      clearedStageIds: [],
      pendingStageId: null,
      pendingFriendId: null,

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
    }),
    { name: 'arcana-quests' }
  )
);
