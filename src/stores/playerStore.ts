import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerData, OwnedItem } from '../types';
import { ITEM_MASTER } from '../data/items';

const STAMINA_RECOVERY_INTERVAL = 5 * 60 * 1000; // 5分で1回復

interface AuthPlayerSnapshot {
  playerName: string;
  gold: number;
  diamond: number;
  stamina: number;
  maxStamina: number;
  exp: number;
  playerRank: number;
  title: string | null;
  bio: string | null;
  loginDays: number;
}

interface PlayerStore {
  player: PlayerData;
  items: OwnedItem[];
  lastUsedFriendId: string | null;

  initPlayer: () => void;
  setupFromTutorial: (name: string) => void;
  syncFromAuth: (p: AuthPlayerSnapshot) => void;
  setAdminMode: () => void;
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
  syncCurrencyToServer: () => Promise<void>;
  updateProfile: (patch: { name?: string; title?: string; bio?: string; favoriteUnitInstanceId?: string | null }) => void;
  recordLogin: () => void;
  recordBattleWin: () => void;
  recordQuestClear: () => void;
  recordSummon: (count?: number) => void;
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
  playerId: `ARC-${Date.now().toString(36).toUpperCase()}`,
  title: '駆け出しの勇者',
  bio: '',
  favoriteUnitInstanceId: null,
  loginDays: 1,
};

export const RANK_EXP_TABLE = Array.from({ length: 200 }, (_, i) => Math.floor(100 * Math.pow(i + 1, 1.5)));

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

      syncFromAuth: (p) => {
        const now = Date.now();
        set(s => {
          const needsRecovery = p.stamina < p.maxStamina;
          const localTimerValid = s.player.staminaRecoveryTime > now;
          return {
            player: {
              ...s.player,
              name: p.playerName,
              gold: p.gold,
              diamond: p.diamond,
              stamina: p.stamina,
              maxStamina: p.maxStamina,
              exp: p.exp,
              rank: p.playerRank,
              title: p.title ?? s.player.title,
              bio: p.bio ?? s.player.bio,
              loginDays: p.loginDays,
              staminaRecoveryTime: needsRecovery && !localTimerValid
                ? now + STAMINA_RECOVERY_INTERVAL
                : s.player.staminaRecoveryTime,
            },
          };
        });
      },

      setAdminMode: () => {
        set(s => ({
          player: {
            ...s.player,
            gold: 9_999_999,
            diamond: 99_999,
            stamina: s.player.maxStamina,
            rank: Math.max(s.player.rank, 100),
          },
          items: ITEM_MASTER.map(item => ({ itemId: item.id, quantity: 999 })),
        }));
      },

      setupFromTutorial: (name) => {
        const { player, items } = get();
        const now = Date.now();
        // 既にプレイ実績がある場合は名前のみ更新してリセットしない
        const hasProgress = player.rank > 1 || player.gold > 5000 || player.diamond > 500 || items.length > 8;
        if (hasProgress) {
          set(s => ({ player: { ...s.player, name: name || s.player.name } }));
          return;
        }
        set(s => ({
          player: {
            ...s.player,
            name,
            gold: 5000,
            diamond: 500,
            stamina: 50,
            maxStamina: 50,
            staminaRecoveryTime: now + STAMINA_RECOVERY_INTERVAL,
            lastLoginAt: now,
            createdAt: s.player.createdAt || now,
            playerId: s.player.playerId || `ARC-${now.toString(36).toUpperCase()}`,
            title: s.player.title || '駆け出しの勇者',
            bio: s.player.bio || '',
            favoriteUnitInstanceId: s.player.favoriteUnitInstanceId ?? null,
            loginDays: s.player.loginDays || 1,
          },
          items: [
            { itemId: 'item_exp_s', quantity: 5 },
            { itemId: 'item_stamina_potion', quantity: 3 },
            { itemId: 'item_summon_ticket', quantity: 3 },
            { itemId: 'item_fire_gem', quantity: 3 },
            { itemId: 'item_water_gem', quantity: 3 },
            { itemId: 'item_wind_gem', quantity: 3 },
            { itemId: 'item_goblin_fang', quantity: 5 },
            { itemId: 'item_diamond', quantity: 0 },
          ],
        }));
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
          let { exp, rank, maxStamina, stamina } = s.player;
          exp += amount;
          let ranked = false;
          while (rank < RANK_EXP_TABLE.length && exp >= RANK_EXP_TABLE[rank - 1]) {
            exp -= RANK_EXP_TABLE[rank - 1];
            rank++;
            ranked = true;
          }
          // ランクアップごとにスタミナ上限+1（50を基本として最大200まで）
          const newMaxStamina = ranked ? Math.min(200, 50 + Math.floor((rank - 1) / 5)) : maxStamina;
          const newStamina = ranked ? newMaxStamina : stamina; // ランクアップ時にスタミナ全回復
          return { player: { ...s.player, exp, rank, maxStamina: newMaxStamina, stamina: newStamina } };
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
        const wasMaxed = player.stamina >= player.maxStamina;
        const now = Date.now();
        set(s => ({
          player: {
            ...s.player,
            stamina: s.player.stamina - amount,
            staminaRecoveryTime: wasMaxed ? now + STAMINA_RECOVERY_INTERVAL : s.player.staminaRecoveryTime,
          },
        }));
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

      syncCurrencyToServer: async () => {
        const { player } = get();
        try {
          await fetch('/api/player/currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              gold: player.gold,
              diamond: player.diamond,
              exp: player.exp,
              playerRank: player.rank,
              stamina: player.stamina,
              maxStamina: player.maxStamina,
            }),
          });
        } catch { /* silent */ }
      },

      setLastUsedFriend: (friendId) => set({ lastUsedFriendId: friendId }),

      updateProfile: (patch) => {
        set(s => ({ player: { ...s.player, ...patch } }));
      },

      recordLogin: () => {
        set(s => ({
          player: {
            ...s.player,
            loginDays: (s.player.loginDays ?? 0) + 1,
            lastLoginAt: Date.now(),
          },
        }));
      },

      recordBattleWin: () => {
        set(s => ({ player: { ...s.player, battleWins: (s.player.battleWins ?? 0) + 1 } }));
      },

      recordQuestClear: () => {
        set(s => ({ player: { ...s.player, questClears: (s.player.questClears ?? 0) + 1 } }));
      },

      recordSummon: (count = 1) => {
        set(s => ({ player: { ...s.player, summonCount: (s.player.summonCount ?? 0) + count } }));
      },
    }),
    { name: 'arcana-player' }
  )
);
