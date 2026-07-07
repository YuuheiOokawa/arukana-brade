import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 実績報酬の受取状態を管理する
interface AchievementStore {
  claimed: string[];
  isClaimed: (id: string) => boolean;
  claim: (id: string) => boolean;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      claimed: [],

      isClaimed: (id) => get().claimed.includes(id),

      claim: (id) => {
        if (get().claimed.includes(id)) return false;
        set({ claimed: [...get().claimed, id] });
        return true;
      },
    }),
    { name: 'arcana-achievements' }
  )
);
