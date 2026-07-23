import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArenaRecord, ArenaOpponent } from '../types';
import { UNIT_MASTER } from '../data/units';
import { localDateStr } from '../utils/dateUtils';
import { RANK_TITLES } from '../data/arenaRank';

const ARENA_OPPONENTS: ArenaOpponent[] = [
  { id: 'ao_1', playerName: '紅蓮の剣士',   playerRank: 15, power: 25000, leaderUnitMasterId: 'unit_001', leaderUnitLevel: 40, leaderUnitAwakenRank: 2, arenaPoints: 1850 },
  { id: 'ao_2', playerName: '水の巫女',     playerRank: 22, power: 38000, leaderUnitMasterId: 'unit_003', leaderUnitLevel: 55, leaderUnitAwakenRank: 3, arenaPoints: 2100 },
  { id: 'ao_3', playerName: '闇の魔王',     playerRank: 30, power: 52000, leaderUnitMasterId: 'unit_006', leaderUnitLevel: 70, leaderUnitAwakenRank: 4, arenaPoints: 2400 },
  { id: 'ao_4', playerName: '風の踊り子',   playerRank: 12, power: 18000, leaderUnitMasterId: 'unit_009', leaderUnitLevel: 30, leaderUnitAwakenRank: 1, arenaPoints: 1600 },
  { id: 'ao_5', playerName: 'アルカナ卿',   playerRank: 45, power: 80000, leaderUnitMasterId: 'unit_002', leaderUnitLevel: 80, leaderUnitAwakenRank: 5, arenaPoints: 2900 },
  { id: 'ao_6', playerName: '炎の大賢者',   playerRank: 18, power: 30000, leaderUnitMasterId: 'unit_007', leaderUnitLevel: 45, leaderUnitAwakenRank: 2, arenaPoints: 1950 },
  { id: 'ao_7', playerName: '光の聖女',     playerRank: 8,  power: 12000, leaderUnitMasterId: 'unit_011', leaderUnitLevel: 20, leaderUnitAwakenRank: 0, arenaPoints: 1400 },
  { id: 'ao_8', playerName: '鋼の守護者',   playerRank: 35, power: 65000, leaderUnitMasterId: 'unit_004', leaderUnitLevel: 75, leaderUnitAwakenRank: 4, arenaPoints: 2700 },
];

const INITIAL_RECORD: ArenaRecord = { wins: 0, losses: 0, rank: 999, points: 1000, season: 1 };

export interface ArenaBattleResult {
  won: boolean;
  pointsGained: number;
  goldReward: number;
  diamondReward: number;
}

interface ArenaStore {
  record: ArenaRecord;
  opponents: ArenaOpponent[];
  lastOpponentRefreshDate: string;
  battleHistory: { timestamp: number; opponentName: string; won: boolean; points: number }[];
  refreshOpponents: () => void;
  checkDailyRefresh: () => void;
  // isAdmin: 管理用アカウントでは勝利ごとに階級(RANK_TITLES)を必ず1段階だけ進める
  // (全100階級のデザイン/表示確認を素早く行うためのQA用ショートカット)
  recordWin: (opponentId: string, isAdmin?: boolean) => ArenaBattleResult;
  recordLoss: (opponentId: string) => ArenaBattleResult;
  getMatchOpponents: () => ArenaOpponent[];
}

export const useArenaStore = create<ArenaStore>()(
  persist(
    (set, get) => ({
      record: INITIAL_RECORD,
      opponents: ARENA_OPPONENTS,
      lastOpponentRefreshDate: '',
      battleHistory: [],

      checkDailyRefresh: () => {
        const today = localDateStr();
        if (get().lastOpponentRefreshDate === today) return;
        const { points } = get().record;
        const withScore = ARENA_OPPONENTS.map(o => ({
          opponent: o,
          score: Math.abs(o.arenaPoints - points) + Math.random() * 400,
        }));
        withScore.sort((a, b) => a.score - b.score);
        set({ opponents: withScore.map(w => w.opponent), lastOpponentRefreshDate: today });
      },

      refreshOpponents: () => {
        const { points } = get().record;
        const withScore = ARENA_OPPONENTS.map(o => ({
          opponent: o,
          score: Math.abs(o.arenaPoints - points) + Math.random() * 400,
        }));
        withScore.sort((a, b) => a.score - b.score);
        set({ opponents: withScore.map(w => w.opponent) });
      },

      getMatchOpponents: () => {
        const { points } = get().record;
        const pool = get().opponents.length > 0 ? get().opponents : ARENA_OPPONENTS;
        return [...pool]
          .sort((a, b) => Math.abs(a.arenaPoints - points) - Math.abs(b.arenaPoints - points))
          .slice(0, 3);
      },

      recordWin: (opponentId, isAdmin = false) => {
        const opponent = get().opponents.find(o => o.id === opponentId);
        const pointsGained = opponent ? Math.floor(20 + (opponent.arenaPoints - get().record.points) * 0.1) : 20;
        const safePtsGain = Math.max(10, Math.min(50, pointsGained));
        const goldReward = 500 + safePtsGain * 10;
        const diamondReward = safePtsGain > 30 ? 5 : 0;

        let actualPointsGained = safePtsGain;
        set(s => {
          let newPoints: number;
          if (isAdmin) {
            // RANK_TITLES は min 降順ソート済み。直上の階級(1つ小さいindex)の
            // 閾値まで一気に引き上げることで、勝利1回=階級1つ分の前進にする
            const idx = RANK_TITLES.findIndex(r => s.record.points >= r.min);
            const nextTier = idx > 0 ? RANK_TITLES[idx - 1] : null;
            newPoints = nextTier ? nextTier.min : s.record.points;
          } else {
            newPoints = s.record.points + safePtsGain;
          }
          actualPointsGained = newPoints - s.record.points;
          const newRank = Math.max(1, s.record.rank - 1);
          return {
            record: { ...s.record, wins: s.record.wins + 1, points: newPoints, rank: newRank },
            battleHistory: [
              {
                timestamp: Date.now(),
                opponentName: opponent?.playerName ?? '???',
                won: true,
                points: actualPointsGained,
              },
              ...s.battleHistory,
            ].slice(0, 20),
          };
        });
        return { won: true, pointsGained: actualPointsGained, goldReward, diamondReward };
      },

      recordLoss: (opponentId) => {
        const opponent = get().opponents.find(o => o.id === opponentId);
        const pointsLost = 15;

        set(s => {
          const newPoints = Math.max(0, s.record.points - pointsLost);
          const newRank = Math.min(9999, s.record.rank + 1);
          return {
            record: { ...s.record, losses: s.record.losses + 1, points: newPoints, rank: newRank },
            battleHistory: [
              {
                timestamp: Date.now(),
                opponentName: opponent?.playerName ?? '???',
                won: false,
                points: -pointsLost,
              },
              ...s.battleHistory,
            ].slice(0, 20),
          };
        });
        return { won: false, pointsGained: -pointsLost, goldReward: 100, diamondReward: 0 };
      },
    }),
    {
      name: 'arcana-arena',
      // UnitMasterを参照するので初期化後にopponentsを補完
      onRehydrateStorage: () => (state) => {
        if (state && UNIT_MASTER.length > 0) {
          // masterId の存在確認
          state.opponents = ARENA_OPPONENTS.filter(o =>
            UNIT_MASTER.some(m => m.id === o.leaderUnitMasterId)
          );
        }
      },
    }
  )
);
