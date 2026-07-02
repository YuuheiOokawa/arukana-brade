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
  staminaRecoveryTime: number;
  arcanaPlayerId: string;
  miscData: Record<string, unknown>;
}

// /api/auth/me が返す gameData の型
export interface GameDataResponse {
  ownedUnits: Array<{
    instanceId: string;
    playerId: string;
    masterId: string;
    level: number;
    exp: number;
    awakenRank: number;
    awakeningCount: number;
    currentRarity: string;
    isLocked: boolean;
    acquiredAt: number;
  }>;
  items: Array<{
    id: string;
    playerId: string;
    itemId: string;
    quantity: number;
  }>;
  ownedEquipments: Array<{
    instanceId: string;
    playerId: string;
    masterId: string;
    level: number;
    exp: number;
    equippedTo: string | null;
  }>;
  questProgress: {
    playerId: string;
    clearedStageIds: string[];
    claimedAreaRewards: string[];
    lastSelectedWorldId: string | null;
    updatedAt: string;
  } | null;
  parties: Array<{
    id: string;
    playerId: string;
    partyId: string;
    name: string;
    slots: (string | null)[];
    leaderId: string | null;
    isActive: boolean;
  }>;
  missionProgress: {
    playerId: string;
    dailyDate: string;
    dailyData: unknown[];
    weeklyData: unknown[];
    weekStr: string;
    updatedAt: string;
  } | null;
  loginBonus: {
    playerId: string;
    lastClaimedDate: string | null;
    lastLoginDate: string | null;
    claimedDays: number[];
    currentDay: number;
    updatedAt: string;
  } | null;
  arenaRecord: {
    playerId: string;
    wins: number;
    losses: number;
    rank: number;
    points: number;
    season: number;
    battleHistory: unknown[];
    updatedAt: string;
  } | null;
}

interface SummonUnitForSync {
  masterId: string;
  rarity: string;
  resultType: string;
}

interface AuthStore {
  user: AuthUser | null;
  player: AuthPlayer | null;
  gameData: GameDataResponse | null;  // gameStateJson の代替
  isLoading: boolean;
  isChecked: boolean;

  checkAuth: () => Promise<void>;
  setAuth: (user: AuthUser, player: AuthPlayer, gameData?: GameDataResponse | null) => void;
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
  gameData: null,
  isLoading: false,
  isChecked: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { user: AuthUser; player: AuthPlayer; gameData: GameDataResponse | null };
        set({ user: data.user, player: data.player, gameData: data.gameData ?? null });
      } else {
        set({ user: null, player: null, gameData: null });
      }
    } catch {
      set({ user: null, player: null, gameData: null });
    } finally {
      set({ isLoading: false, isChecked: true });
    }
  },

  setAuth: (user, player, gameData) => set({ user, player, gameData: gameData ?? null, isChecked: true }),

  clearAuth: () => set({ user: null, player: null, gameData: null }),

  logout: async () => {
    await fetch('/api/auth', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    set({ user: null, player: null, gameData: null });
  },

  syncPlayerName: async (name: string) => {
    const { player } = get();
    if (!player) return;
    try {
      await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', playerName: name }),
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
      await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', tutorialCompleted: true }),
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
      await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'currency', ...data }),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncSummonResult: async (poolId, units, diamondSpent) => {
    try {
      // [DB SAVE] OwnedUnit (new のみ) + SummonHistory 全件 + Player.diamond 減算
      await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summon_save', poolId, units, diamondSpent }),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncUnits: async (units) => {
    try {
      // [DB SAVE] OwnedUnit 全件完全同期（DELETE + INSERT）
      await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'units_sync', units }),
      });
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },
}));
