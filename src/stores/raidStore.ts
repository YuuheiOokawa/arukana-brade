import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RaidBossState } from '../types';
import { RAID_BOSSES } from '../data/events';

interface RaidStore {
  raidStates: RaidBossState[];
  getRaidState: (bossId: string) => RaidBossState;
  dealDamage: (bossId: string, damage: number) => void;
  resetRaid: (bossId: string) => void;
  getRewardTier: (bossId: string) => number; // index in rewards array
}

const initState = (bossId: string): RaidBossState => {
  const boss = RAID_BOSSES.find(b => b.id === bossId);
  return { bossId, currentHp: boss?.totalHp ?? 1000000, totalDamageDealt: 0, entryCount: 0 };
};

export const useRaidStore = create<RaidStore>()(
  persist(
    (set, get) => ({
      raidStates: RAID_BOSSES.map(b => initState(b.id)),

      getRaidState: (bossId) => {
        const existing = get().raidStates.find(s => s.bossId === bossId);
        if (existing) return existing;
        const newState = initState(bossId);
        set(s => ({ raidStates: [...s.raidStates, newState] }));
        return newState;
      },

      dealDamage: (bossId, damage) => {
        set(s => ({
          raidStates: s.raidStates.map(rs => {
            if (rs.bossId !== bossId) return rs;
            return {
              ...rs,
              currentHp: Math.max(0, rs.currentHp - damage),
              totalDamageDealt: rs.totalDamageDealt + damage,
              entryCount: rs.entryCount + 1,
            };
          }),
        }));
      },

      resetRaid: (bossId) => {
        set(s => ({
          raidStates: s.raidStates.map(rs =>
            rs.bossId === bossId ? initState(bossId) : rs
          ),
        }));
      },

      getRewardTier: (bossId) => {
        const boss = RAID_BOSSES.find(b => b.id === bossId);
        const state = get().raidStates.find(s => s.bossId === bossId);
        if (!boss || !state) return 0;
        const dmg = state.totalDamageDealt;
        let tier = 0;
        boss.rewards.forEach((r, i) => { if (dmg >= r.minDamage) tier = i; });
        return tier;
      },
    }),
    { name: 'arcana-raids' }
  )
);
