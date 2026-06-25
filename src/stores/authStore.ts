import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthPlayer {
  playerId: string;
  playerName: string;
  tutorialCompleted: boolean;
  playerRank: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  diamond: number;
  exp: number;
  title: string | null;
  bio: string | null;
  favoriteUnitId: string | null;
  loginDays: number;
  lastLoginAt: string;
}

interface SummonUnitForSync {
  masterId: string;
  rarity: string;
  resultType: string;
}

interface AuthStore {
  user: AuthUser | null;
  player: AuthPlayer | null;
  isLoading: boolean;
  isChecked: boolean;

  checkAuth: () => Promise<void>;
  setAuth: (user: AuthUser, player: AuthPlayer) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  // [DB SAVE] /api/player/save — プレイヤー名・チュートリアル完了フラグ
  syncPlayerName: (name: string) => Promise<void>;
  syncTutorialComplete: () => Promise<void>;
  // [DB SAVE] /api/player/currency — ゴールド・ダイヤ・EXP・スタミナ
  syncCurrency: (data: { gold?: number; diamond?: number; exp?: number; playerRank?: number; stamina?: number }) => Promise<void>;
  // [DB SAVE] /api/summon/save — ガチャ結果（OwnedUnit + SummonHistory + diamond消費）
  syncSummonResult: (poolId: string, units: SummonUnitForSync[], diamondSpent: number) => Promise<void>;
  // [DB SAVE] /api/units/sync — 所持ユニット全件同期
  syncUnits: (units: Array<{ masterId: string; level: number; exp: number; awakenRank: number; awakeningCount: number; currentRarity: number; isLocked: boolean }>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  player: null,
  isLoading: false,
  isChecked: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { user: AuthUser; player: AuthPlayer };
        set({ user: data.user, player: data.player });
      } else {
        set({ user: null, player: null });
      }
    } catch {
      set({ user: null, player: null });
    } finally {
      set({ isLoading: false, isChecked: true });
    }
  },

  setAuth: (user, player) => set({ user, player, isChecked: true }),

  clearAuth: () => set({ user: null, player: null }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    set({ user: null, player: null });
  },

  syncPlayerName: async (name: string) => {
    const { player } = get();
    if (!player) return;
    try {
      await fetch('/api/player/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });
      set(state => ({
        player: state.player ? { ...state.player, playerName: name } : null,
      }));
    } catch {
      // ネットワークエラーは無視（ローカル状態は維持）
    }
  },

  syncTutorialComplete: async () => {
    try {
      // [DB SAVE] Player.tutorialCompleted = true
      await fetch('/api/player/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialCompleted: true }),
      });
      set(state => ({
        player: state.player ? { ...state.player, tutorialCompleted: true } : null,
      }));
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncCurrency: async (data) => {
    try {
      // [DB SAVE] Player.gold / diamond / exp / playerRank / stamina
      await fetch('/api/player/currency', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncSummonResult: async (poolId, units, diamondSpent) => {
    try {
      // [DB SAVE] OwnedUnit (new のみ) + SummonHistory 全件 + Player.diamond 減算
      await fetch('/api/summon/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, units, diamondSpent }),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncUnits: async (units) => {
    try {
      // [DB SAVE] OwnedUnit 全件完全同期（DELETE + INSERT）
      await fetch('/api/units/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units }),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },
}));
