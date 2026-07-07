import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 図鑑：一度でも入手したユニット/装備の masterId を記録する
// （解放・売却で手放しても図鑑には「発見済み」として残る）
interface CollectionStore {
  discovered: string[];
  discoveredEquips: string[];
  registerDiscovered: (masterIds: string[]) => void;
  registerDiscoveredEquips: (masterIds: string[]) => void;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      discovered: [],
      discoveredEquips: [],

      registerDiscovered: (masterIds) => {
        const current = new Set(get().discovered);
        const newIds = masterIds.filter(id => !current.has(id));
        if (newIds.length === 0) return;
        set({ discovered: [...get().discovered, ...newIds] });
      },

      registerDiscoveredEquips: (masterIds) => {
        const current = new Set(get().discoveredEquips);
        const newIds = masterIds.filter(id => !current.has(id));
        if (newIds.length === 0) return;
        set({ discoveredEquips: [...get().discoveredEquips, ...newIds] });
      },
    }),
    { name: 'arcana-collection' }
  )
);
