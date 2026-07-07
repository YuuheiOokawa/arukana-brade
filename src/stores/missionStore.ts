import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMissionState, MissionProgress, MissionType } from '../types';
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from '../data/missions';
import { usePlayerStore } from './playerStore';

const todayStr = () => new Date().toISOString().slice(0, 10);

const weekMondayStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().slice(0, 10);
};

const buildFreshProgress = (): MissionProgress[] =>
  DAILY_MISSIONS.map(m => ({
    missionId: m.id, progress: 0, completed: false, claimed: false,
  }));

const buildFreshWeeklyProgress = (): MissionProgress[] =>
  WEEKLY_MISSIONS.map(m => ({
    missionId: m.id, progress: 0, completed: false, claimed: false,
  }));

interface MissionStore {
  daily: DailyMissionState;
  weeklyProgresses: MissionProgress[];
  weekStr: string;

  getDailyProgress: (missionId: string) => MissionProgress | undefined;
  addDailyProgress: (type: MissionType, count?: number) => void;
  claimDailyReward: (missionId: string) => boolean;
  checkDailyReset: () => void;
  getCompletedCount: () => number;
  getClaimedCount: () => number;

  addWeeklyProgress: (type: MissionType, count?: number) => void;
  claimWeeklyReward: (missionId: string) => boolean;
  checkWeeklyReset: () => void;
  getWeeklyCompletedCount: () => number;
  getWeeklyClaimedCount: () => number;
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      daily: { date: todayStr(), progresses: buildFreshProgress() },
      weeklyProgresses: buildFreshWeeklyProgress(),
      weekStr: '',

      checkDailyReset: () => {
        const today = todayStr();
        if (get().daily.date !== today) {
          set({ daily: { date: today, progresses: buildFreshProgress() } });
        }
        const loginMission = get().daily.progresses.find(p => p.missionId === 'daily_login');
        if (loginMission && !loginMission.completed) {
          set(s => ({
            daily: {
              ...s.daily,
              progresses: s.daily.progresses.map(p =>
                p.missionId === 'daily_login' ? { ...p, progress: 1, completed: true } : p
              ),
            },
          }));
          get().addWeeklyProgress('login');
        }
      },

      checkWeeklyReset: () => {
        const week = weekMondayStr();
        if (get().weekStr !== week) {
          set({ weekStr: week, weeklyProgresses: buildFreshWeeklyProgress() });
        }
      },

      getDailyProgress: (missionId) => {
        get().checkDailyReset();
        return get().daily.progresses.find(p => p.missionId === missionId);
      },

      addDailyProgress: (type, count = 1) => {
        get().checkDailyReset();
        set(s => {
          const newProgresses = s.daily.progresses.map(prog => {
            const mission = DAILY_MISSIONS.find(m => m.id === prog.missionId);
            if (!mission || mission.type !== type || prog.completed) return prog;
            const newProgress = Math.min(prog.progress + count, mission.target);
            const completed = newProgress >= mission.target;
            return { ...prog, progress: newProgress, completed };
          });
          return { daily: { ...s.daily, progresses: newProgresses } };
        });
      },

      addWeeklyProgress: (type, count = 1) => {
        get().checkWeeklyReset();
        set(s => ({
          weeklyProgresses: s.weeklyProgresses.map(prog => {
            const mission = WEEKLY_MISSIONS.find(m => m.id === prog.missionId);
            if (!mission || mission.type !== type || prog.completed) return prog;
            const newProgress = Math.min(prog.progress + count, mission.target);
            const completed = newProgress >= mission.target;
            return { ...prog, progress: newProgress, completed };
          }),
        }));
      },

      claimDailyReward: (missionId) => {
        const progress = get().daily.progresses.find(p => p.missionId === missionId);
        if (!progress?.completed || progress.claimed) return false;
        const mission = DAILY_MISSIONS.find(m => m.id === missionId);
        if (!mission) return false;
        const playerStore = usePlayerStore.getState();
        mission.rewards.forEach(reward => {
          if (reward.type === 'gold') playerStore.addGold(reward.amount);
          else if (reward.type === 'diamond') playerStore.addDiamond(reward.amount);
          else if (reward.type === 'stamina') {
            usePlayerStore.setState(s => ({
              player: { ...s.player, stamina: Math.min(s.player.stamina + reward.amount, s.player.maxStamina) },
            }));
          } else if (reward.type === 'item' && reward.itemId) {
            playerStore.addItem(reward.itemId, reward.amount);
          }
        });
        set(s => ({
          daily: {
            ...s.daily,
            progresses: s.daily.progresses.map(p =>
              p.missionId === missionId ? { ...p, claimed: true } : p
            ),
          },
        }));
        return true;
      },

      claimWeeklyReward: (missionId) => {
        const progress = get().weeklyProgresses.find(p => p.missionId === missionId);
        if (!progress?.completed || progress.claimed) return false;
        const mission = WEEKLY_MISSIONS.find(m => m.id === missionId);
        if (!mission) return false;
        const playerStore = usePlayerStore.getState();
        mission.rewards.forEach(reward => {
          if (reward.type === 'gold') playerStore.addGold(reward.amount);
          else if (reward.type === 'diamond') playerStore.addDiamond(reward.amount);
          else if (reward.type === 'stamina') {
            usePlayerStore.setState(s => ({
              player: { ...s.player, stamina: Math.min(s.player.stamina + reward.amount, s.player.maxStamina) },
            }));
          } else if (reward.type === 'item' && reward.itemId) {
            playerStore.addItem(reward.itemId, reward.amount);
          }
        });
        set(s => ({
          weeklyProgresses: s.weeklyProgresses.map(p =>
            p.missionId === missionId ? { ...p, claimed: true } : p
          ),
        }));
        return true;
      },

      getCompletedCount: () =>
        get().daily.progresses.filter(p => p.completed).length,

      getClaimedCount: () =>
        get().daily.progresses.filter(p => p.claimed).length,

      getWeeklyCompletedCount: () =>
        get().weeklyProgresses.filter(p => p.completed).length,

      getWeeklyClaimedCount: () =>
        get().weeklyProgresses.filter(p => p.claimed).length,
    }),
    { name: 'arcana-missions' }
  )
);
