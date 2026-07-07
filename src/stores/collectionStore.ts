import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ユニット図鑑：一度でも入手したユニットの masterId を記録する
// （解放して手放しても図鑑には「発見済み」として残る）
interface CollectionStore {
  discovered: string[];
  registerDiscovered: (masterIds: string[]) => void;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      discovered: [],

      registerDiscovered: (masterIds) => {
        const current = new Set(get().discovered);
        const newIds = masterIds.filter(id => !current.has(id));
        if (newIds.length === 0) return;
        set({ discovered: [...get().discovered, ...newIds] });
      },
    }),
    { name: 'arcana-collection' }
  )
);
