import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RaidBossState } from '../types';
import { RAID_BOSSES } from '../data/events';

interface RaidStore {
  raidStates: RaidBossState[];
  getRaidState: (bossId: string) => RaidBossState;
  // ダメージを反映し、今回新たに到達した累計ダメージ報酬段階(tier 0=参加報酬は含まない)のアイテムIDを返す
  dealDamage: (bossId: string, damage: number) => string[];
  resetRaid: (bossId: string) => void;
  getRewardTier: (bossId: string) => number; // index in rewards array
}

const initState = (bossId: string): RaidBossState => {
  const boss = RAID_BOSSES.find(b => b.id === bossId);
  return { bossId, currentHp: boss?.totalHp ?? 1000000, totalDamageDealt: 0, entryCount: 0, highestClaimedTier: -1 };
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
        const boss = RAID_BOSSES.find(b => b.id === bossId);
        let newlyUnlockedItems: string[] = [];
        set(s => ({
          raidStates: s.raidStates.map(rs => {
            if (rs.bossId !== bossId) return rs;
            // オーバーキル分は総ダメージ表示・報酬段階の判定に含めない（残りHPを超えて加算されないようクランプ）
            const appliedDamage = Math.min(damage, rs.currentHp);
            const totalDamageDealt = rs.totalDamageDealt + appliedDamage;
            // tier 0 (参加報酬) は毎回付与されるため対象外。tier 1以降は初到達時に一度だけ付与する
            // (highestClaimedTier は既存セーブデータに存在しない場合があるためフォールバック)
            let highestClaimedTier = rs.highestClaimedTier ?? -1;
            if (boss) {
              for (let i = Math.max(1, highestClaimedTier + 1); i < boss.rewards.length; i++) {
                if (totalDamageDealt >= boss.rewards[i].minDamage) {
                  newlyUnlockedItems = newlyUnlockedItems.concat(boss.rewards[i].items);
                  highestClaimedTier = i;
                } else break;
              }
            }
            return {
              ...rs,
              currentHp: Math.max(0, rs.currentHp - damage),
              totalDamageDealt,
              // (currentHp は元の damage で減算する。appliedDamage は totalDamageDealt/報酬判定専用のクランプ値)
              entryCount: rs.entryCount + 1,
              highestClaimedTier,
            };
          }),
        }));
        return newlyUnlockedItems;
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
