import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerData, OwnedItem } from '../types';

const STAMINA_RECOVERY_INTERVAL = 5 * 60 * 1000; // 5分で1回復

interface PlayerStore {
  player: PlayerData;
  items: OwnedItem[];
  lastUsedFriendId: string | null;

  initPlayer: () => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addDiamond: (amount: number) => void;
  spendDiamond: (amount: number) => boolean;
  addExp: (amount: number) => void;
  recoverStamina: () => void;
  spendStamina: (amount: number) => boolean;
  addItem: (itemId: string, quantity: number) => void;
  useItem: (itemId: string, quantity: number) => boolean;
  setLastUsedFriend: (friendId: string) => void;
}

const INITIAL_PLAYER: PlayerData = {
  name: '勇者',
  rank: 1,
  exp: 0,
  gold: 5000,
  diamond: 500,
  stamina: 50,
  maxStamina: 50,
  staminaRecoveryTime: Date.now() + STAMINA_RECOVERY_INTERVAL,
  lastLoginAt: Date.now(),
  createdAt: Date.now(),
};

const RANK_EXP_TABLE = Array.from({ length: 200 }, (_, i) => Math.floor(100 * Math.pow(i + 1, 1.5)));

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      player: INITIAL_PLAYER,
      items: [
        { itemId: 'item_exp_s', quantity: 5 },
        { itemId: 'item_stamina_potion', quantity: 3 },
        { itemId: 'item_summon_ticket', quantity: 2 },
        { itemId: 'item_fire_gem', quantity: 3 },
        { itemId: 'item_water_gem', quantity: 3 },
        { itemId: 'item_goblin_fang', quantity: 5 },
      ],
      lastUsedFriendId: null,

      initPlayer: () => {
        const { player } = get();
        if (!player.createdAt) {
          set({ player: INITIAL_PLAYER });
        }
      },

      addGold: (amount) => set(s => ({ player: { ...s.player, gold: s.player.gold + amount } })),

      spendGold: (amount) => {
        const { player } = get();
        if (player.gold < amount) return false;
        set(s => ({ player: { ...s.player, gold: s.player.gold - amount } }));
        return true;
      },

      addDiamond: (amount) => set(s => ({ player: { ...s.player, diamond: s.player.diamond + amount } })),

      spendDiamond: (amount) => {
        const { player } = get();
        if (player.diamond < amount) return false;
        set(s => ({ player: { ...s.player, diamond: s.player.diamond - amount } }));
        return true;
      },

      addExp: (amount) => {
        set(s => {
          let { exp, rank } = s.player;
          exp += amount;
          while (rank < RANK_EXP_TABLE.length && exp >= RANK_EXP_TABLE[rank - 1]) {
            exp -= RANK_EXP_TABLE[rank - 1];
            rank++;
          }
          return { player: { ...s.player, exp, rank } };
        });
      },

      recoverStamina: () => {
        const { player } = get();
        const now = Date.now();
        if (player.stamina >= player.maxStamina) return;
        const elapsed = now - (player.staminaRecoveryTime - STAMINA_RECOVERY_INTERVAL);
        const recovered = Math.floor(elapsed / STAMINA_RECOVERY_INTERVAL);
        if (recovered <= 0) return;
        const newStamina = Math.min(player.stamina + recovered, player.maxStamina);
        const nextRecoveryTime = player.staminaRecoveryTime + recovered * STAMINA_RECOVERY_INTERVAL;
        set(s => ({
          player: {
            ...s.player,
            stamina: newStamina,
            staminaRecoveryTime: newStamina >= s.player.maxStamina ? nextRecoveryTime : nextRecoveryTime,
          },
        }));
      },

      spendStamina: (amount) => {
        const { player } = get();
        if (player.stamina < amount) return false;
        set(s => ({ player: { ...s.player, stamina: s.player.stamina - amount } }));
        return true;
      },

      addItem: (itemId, quantity) => {
        set(s => {
          const existing = s.items.find(i => i.itemId === itemId);
          if (existing) {
            return { items: s.items.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i) };
          }
          return { items: [...s.items, { itemId, quantity }] };
        });
      },

      useItem: (itemId, quantity) => {
        const { items } = get();
        const item = items.find(i => i.itemId === itemId);
        if (!item || item.quantity < quantity) return false;
        set(s => ({
          items: s.items
            .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i)
            .filter(i => i.quantity > 0),
        }));
        return true;
      },

      setLastUsedFriend: (friendId) => set({ lastUsedFriendId: friendId }),
    }),
    { name: 'arcana-player' }
  )
);
