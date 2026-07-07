import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GIFT_CATALOG, getGift } from '../data/gifts';
import { usePlayerStore } from './playerStore';

// プレゼントボックス: 受取状態を管理する
interface GiftStore {
  claimedIds: string[];
  getUnclaimedCount: () => number;
  claimGift: (id: string) => boolean;
  claimAll: () => number;
}

const isAvailable = (giftId: string): boolean => {
  const gift = getGift(giftId);
  if (!gift) return false;
  if (gift.expiresAt && gift.expiresAt < Date.now()) return false;
  return true;
};

const grantRewards = (giftId: string) => {
  const gift = getGift(giftId);
  if (!gift) return;
  const store = usePlayerStore.getState();
  if (gift.rewards.gold) store.addGold(gift.rewards.gold);
  if (gift.rewards.diamond) store.addDiamond(gift.rewards.diamond);
  if (gift.rewards.stamina) {
    usePlayerStore.setState(s => ({
      player: {
        ...s.player,
        // スタミナギフトは上限を超えて付与できる（一時的なオーバーフロー許可）
        stamina: s.player.stamina + (gift.rewards.stamina ?? 0),
      },
    }));
  }
  gift.rewards.items?.forEach(it => store.addItem(it.itemId, it.quantity));
};

export const useGiftStore = create<GiftStore>()(
  persist(
    (set, get) => ({
      claimedIds: [],

      getUnclaimedCount: () =>
        GIFT_CATALOG.filter(g => !get().claimedIds.includes(g.id) && isAvailable(g.id)).length,

      claimGift: (id) => {
        if (get().claimedIds.includes(id)) return false;
        if (!isAvailable(id)) return false;
        grantRewards(id);
        set({ claimedIds: [...get().claimedIds, id] });
        return true;
      },

      claimAll: () => {
        const unclaimed = GIFT_CATALOG.filter(
          g => !get().claimedIds.includes(g.id) && isAvailable(g.id)
        );
        unclaimed.forEach(g => grantRewards(g.id));
        set({ claimedIds: [...get().claimedIds, ...unclaimed.map(g => g.id)] });
        return unclaimed.length;
      },
    }),
    { name: 'arcana-gifts' }
  )
);
