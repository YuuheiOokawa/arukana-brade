import { create } from 'zustand';
import { cancelPendingSave } from '../lib/syncService';

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
  createdAt?: string;
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
    evolveRank: number;
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

interface SummonSyncResult {
  ok: boolean;
  error?: string;
  resultTypes?: Array<'new' | 'crystal'>;
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
  syncSummonResult: (poolId: string, units: SummonUnitForSync[], diamondSpent: number, ticketItemId?: string | null) => Promise<SummonSyncResult>;
  // [DB SAVE] /api/units/sync — 所持ユニット全件同期
  syncUnits: (units: Array<{ masterId: string; level: number; exp: number; awakenRank: number; awakeningCount: number; currentRarity: number; isLocked: boolean }>) => Promise<void>;
}

// checkAuth() の GET /api/auth はアプリ起動時に無条件で発火するため、サーバーの
// コールドスタート等で応答が遅延している間に手動ログイン/登録が先に成功することがある。
// 対策なしだと、後から届く古い checkAuth の401応答がログイン直後のユーザーを
// user:null で強制ログアウトさせてしまっていた。setAuth/logout/clearAuth のたびに
// 世代を進め、届いた応答が最新の世代でなければ(＝後から発生した別の認証操作に
// 追い越されていれば)適用せず捨てることで、この競合を防ぐ。
let authGeneration = 0;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  player: null,
  gameData: null,
  isLoading: false,
  isChecked: false,

  checkAuth: async () => {
    const myGen = ++authGeneration;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { user: AuthUser; player: AuthPlayer; gameData: GameDataResponse | null };
        if (myGen === authGeneration) set({ user: data.user, player: data.player, gameData: data.gameData ?? null });
      } else {
        if (myGen === authGeneration) set({ user: null, player: null, gameData: null });
      }
    } catch {
      if (myGen === authGeneration) set({ user: null, player: null, gameData: null });
    } finally {
      if (myGen === authGeneration) set({ isLoading: false, isChecked: true });
    }
  },

  setAuth: (user, player, gameData) => {
    authGeneration++;
    set({ user, player, gameData: gameData ?? null, isChecked: true });
  },

  clearAuth: () => {
    authGeneration++;
    set({ user: null, player: null, gameData: null });
  },

  logout: async () => {
    authGeneration++;
    cancelPendingSave();
    await fetch('/api/auth', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    set({ user: null, player: null, gameData: null });
  },

  syncPlayerName: async (name: string) => {
    const { player } = get();
    if (!player) return;
    try {
      const response = await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', playerName: name }),
      });
      if (!response.ok) throw new Error(`profile sync failed: ${response.status}`);
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
      const response = await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', tutorialCompleted: true }),
      });
      if (!response.ok) throw new Error(`tutorial sync failed: ${response.status}`);
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
      const response = await fetch('/api/player', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'currency', ...data }),
      });
      if (!response.ok) throw new Error(`currency sync failed: ${response.status}`);
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },

  syncSummonResult: async (poolId, units, diamondSpent, ticketItemId = null) => {
    try {
      // [DB SAVE] OwnedUnit (new のみ) + SummonHistory 全件 + Player.diamond 減算
      const response = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summon_save', poolId, units, diamondSpent, ticketItemId }),
      });
      const data = await response.json().catch(() => null) as SummonSyncResult | null;
      if (!response.ok || !data?.ok) return { ok: false, error: data?.error ?? '召喚結果を保存できませんでした' };
      return data;
    } catch {
      return { ok: false, error: '通信エラーが発生しました' };
    }
  },

  syncUnits: async (units) => {
    try {
      // [DB SAVE] OwnedUnit 全件完全同期（DELETE + INSERT）
      const response = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'units_sync', units }),
      });
      if (!response.ok) throw new Error(`unit sync failed: ${response.status}`);
    } catch {
      // ネットワークエラーは無視（localStorage が source of truth）
    }
  },
}));
