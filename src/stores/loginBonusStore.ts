import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoginBonusDay {
  day: number;
  rewards: { type: 'gold' | 'diamond' | 'item' | 'stamina'; amount: number; itemId?: string; label: string; emoji: string }[];
}

export const LOGIN_BONUS_SCHEDULE: LoginBonusDay[] = [
  { day: 1,  rewards: [{ type: 'gold',    amount: 1000,  label: 'ゴールド',       emoji: '🪙' }] },
  { day: 2,  rewards: [{ type: 'item',    amount: 3,     itemId: 'item_exp_s',  label: '経験値の雫(小)', emoji: '💧' }] },
  { day: 3,  rewards: [{ type: 'diamond', amount: 10,    label: 'ダイヤ',         emoji: '💎' }] },
  { day: 4,  rewards: [{ type: 'stamina', amount: 20,    label: 'スタミナ+20',    emoji: '⚡' }] },
  { day: 5,  rewards: [{ type: 'item',    amount: 1,     itemId: 'item_exp_m',  label: '経験値の雫(中)', emoji: '💦' }, { type: 'gold', amount: 2000, label: 'ゴールド', emoji: '🪙' }] },
  { day: 6,  rewards: [{ type: 'item',    amount: 2,     itemId: 'item_mana_crystal', label: 'マナクリスタル', emoji: '🔷' }] },
  { day: 7,  rewards: [{ type: 'diamond', amount: 50,    label: 'ダイヤ',         emoji: '💎' }, { type: 'item', amount: 1, itemId: 'item_summon_ticket', label: '召喚チケット', emoji: '🎫' }] },
  { day: 8,  rewards: [{ type: 'gold',    amount: 3000,  label: 'ゴールド',       emoji: '🪙' }] },
  { day: 9,  rewards: [{ type: 'item',    amount: 5,     itemId: 'item_exp_s',  label: '経験値の雫(小)', emoji: '💧' }] },
  { day: 10, rewards: [{ type: 'diamond', amount: 20,    label: 'ダイヤ',         emoji: '💎' }] },
  { day: 11, rewards: [{ type: 'item',    amount: 1,     itemId: 'item_exp_l',  label: '経験値の雫(大)', emoji: '🌊' }] },
  { day: 12, rewards: [{ type: 'gold',    amount: 5000,  label: 'ゴールド',       emoji: '🪙' }, { type: 'item', amount: 3, itemId: 'item_mana_crystal', label: 'マナクリスタル', emoji: '🔷' }] },
  { day: 13, rewards: [{ type: 'item',    amount: 1,     itemId: 'item_summon_ticket', label: '召喚チケット', emoji: '🎫' }] },
  { day: 14, rewards: [{ type: 'diamond', amount: 100,   label: 'ダイヤ',         emoji: '💎' }, { type: 'gold', amount: 5000, label: 'ゴールド', emoji: '🪙' }, { type: 'item', amount: 1, itemId: 'item_summon_ticket_sr', label: 'SR確定チケット', emoji: '🌠' }] },
  { day: 15, rewards: [{ type: 'gold',    amount: 8000,  label: 'ゴールド',       emoji: '🪙' }] },
  { day: 16, rewards: [{ type: 'item',    amount: 2,     itemId: 'item_exp_m',  label: '経験値の雫(中)', emoji: '💦' }] },
  { day: 17, rewards: [{ type: 'diamond', amount: 30,    label: 'ダイヤ',         emoji: '💎' }] },
  { day: 18, rewards: [{ type: 'stamina', amount: 50,    label: 'スタミナ+50',    emoji: '⚡' }, { type: 'item', amount: 5, itemId: 'item_mana_crystal', label: 'マナクリスタル', emoji: '🔷' }] },
  { day: 19, rewards: [{ type: 'gold',    amount: 10000, label: 'ゴールド',       emoji: '🪙' }] },
  { day: 20, rewards: [{ type: 'diamond', amount: 50,    label: 'ダイヤ',         emoji: '💎' }, { type: 'item', amount: 1, itemId: 'item_exp_l', label: '経験値の雫(大)', emoji: '🌊' }] },
  { day: 21, rewards: [{ type: 'item',    amount: 1,     itemId: 'item_summon_ticket_sr', label: 'SR確定チケット', emoji: '🌠' }, { type: 'gold', amount: 5000, label: 'ゴールド', emoji: '🪙' }] },
  { day: 22, rewards: [{ type: 'gold',    amount: 15000, label: 'ゴールド',       emoji: '🪙' }] },
  { day: 23, rewards: [{ type: 'item',    amount: 10,    itemId: 'item_mana_crystal', label: 'マナクリスタル', emoji: '🔷' }] },
  { day: 24, rewards: [{ type: 'diamond', amount: 80,    label: 'ダイヤ',         emoji: '💎' }] },
  { day: 25, rewards: [{ type: 'item',    amount: 1,     itemId: 'item_exp_xl', label: '経験値の雫(特大)', emoji: '🌊' }, { type: 'item', amount: 2, itemId: 'item_summon_ticket', label: '召喚チケット', emoji: '🎫' }] },
  { day: 26, rewards: [{ type: 'gold',    amount: 20000, label: 'ゴールド',       emoji: '🪙' }] },
  { day: 27, rewards: [{ type: 'diamond', amount: 50,    label: 'ダイヤ',         emoji: '💎' }, { type: 'stamina', amount: 100, label: 'スタミナ+100', emoji: '⚡' }] },
  { day: 28, rewards: [{ type: 'item',    amount: 1,     itemId: 'item_awakening_crystal', label: '覚醒結晶', emoji: '💠' }] },
  { day: 29, rewards: [{ type: 'gold',    amount: 30000, label: 'ゴールド',       emoji: '🪙' }, { type: 'item', amount: 15, itemId: 'item_mana_crystal', label: 'マナクリスタル', emoji: '🔷' }] },
  { day: 30, rewards: [{ type: 'diamond', amount: 200,   label: 'ダイヤ',         emoji: '💎' }, { type: 'item', amount: 1, itemId: 'item_summon_ticket_ssr', label: 'SSR確定チケット', emoji: '🌟' }, { type: 'gold', amount: 10000, label: 'ゴールド', emoji: '🪙' }] },
];

interface LoginBonusStore {
  lastClaimedDate: string | null;
  claimedDays: number[];
  currentDay: number;
  /** 当日初回ログイン済みフラグ（0時リセット）。モーダルを1日1回だけ表示するために使う */
  lastLoginDate: string | null;
  canClaim: () => boolean;
  /** 今日初めてのログインならtrueを返しフラグを立てる。2回目以降はfalse */
  markLoggedInToday: () => boolean;
  claimToday: () => LoginBonusDay | null;
  getNextReward: () => LoginBonusDay | null;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useLoginBonusStore = create<LoginBonusStore>()(
  persist(
    (set, get) => ({
      lastClaimedDate: null,
      claimedDays: [],
      currentDay: 1,
      lastLoginDate: null,

      canClaim: () => {
        const { lastClaimedDate } = get();
        return lastClaimedDate !== today();
      },

      markLoggedInToday: () => {
        const { lastLoginDate } = get();
        if (lastLoginDate === today()) return false; // 今日すでにログイン済み
        set({ lastLoginDate: today() });
        return true; // 今日初めてのログイン
      },

      claimToday: () => {
        const { canClaim, currentDay, claimedDays } = get();
        if (!canClaim()) return null;
        const reward = LOGIN_BONUS_SCHEDULE.find(d => d.day === currentDay) ?? LOGIN_BONUS_SCHEDULE[0];
        const nextDay = currentDay >= 30 ? 1 : currentDay + 1;
        set({
          lastClaimedDate: today(),
          claimedDays: [...claimedDays, currentDay],
          currentDay: nextDay,
        });
        return reward;
      },

      getNextReward: () => {
        const { currentDay } = get();
        return LOGIN_BONUS_SCHEDULE.find(d => d.day === currentDay) ?? LOGIN_BONUS_SCHEDULE[0];
      },
    }),
    { name: 'arcana-login-bonus' }
  )
);
