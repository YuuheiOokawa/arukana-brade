import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedUnit, UnitStats, GachaApplyResult, StarRarity } from '../types';
import { getUnitMaster, calcUnitStats } from '../data/units';
import { RARITY_TYPE_TO_STAR, AWAKENING_CONFIG, getLevelCap, NEXT_RARITY } from '../data/rarityConfig';

interface UnitStore {
  ownedUnits: OwnedUnit[];
  awakeningCrystals: Record<string, number>;
  addUnit: (masterId: string) => OwnedUnit;
  levelUpUnit: (instanceId: string, expAmount: number) => void;
  awakenUnit: (instanceId: string) => boolean;
  incrementAwakeningCount: (instanceId: string) => boolean;
  addAwakeningCrystal: (masterId: string) => void;
  getAwakeningCrystalCount: (masterId: string) => number;
  rarityUp: (instanceId: string) => boolean;
  toggleLock: (instanceId: string) => void;
  getUnit: (instanceId: string) => OwnedUnit | undefined;
  calcStats: (unit: OwnedUnit) => UnitStats;
  processSummonResults: (masterIds: string[]) => GachaApplyResult[];
  syncUnitsToServer: () => Promise<void>;
}

let instanceCounter = Date.now();

// 旧データの安全なマイグレーション
function migrateUnit(raw: Partial<OwnedUnit> & { instanceId: string; masterId: string }): OwnedUnit {
  const master = getUnitMaster(raw.masterId);
  const awakeningCount = raw.awakeningCount ?? 0;
  const awakenRank = raw.awakenRank ?? 0;
  const level = raw.level ?? 1;
  const currentRarity: StarRarity = raw.currentRarity ?? (master ? (RARITY_TYPE_TO_STAR[master.rarity] ?? 1) : 1);
  const currentStats =
    raw.currentStats && raw.currentStats.hp > 0
      ? raw.currentStats
      : master
        ? calcUnitStats(master, level, awakenRank, awakeningCount)
        : { hp: 1000, atk: 300, def: 200, rec: 150 };
  return {
    instanceId: raw.instanceId,
    masterId: raw.masterId,
    level,
    exp: raw.exp ?? 0,
    awakenRank,
    awakeningCount,
    currentRarity,
    currentStats,
    isLocked: raw.isLocked ?? false,
    acquiredAt: raw.acquiredAt ?? Date.now(),
  };
}

const createInitialUnits = (): OwnedUnit[] => {
  const now = Date.now();
  return [
    makeUnit('unit_001', 1, 0, now - 3000),
    makeUnit('unit_007', 1, 0, now - 2000),
    makeUnit('unit_009', 1, 0, now - 1000),
    makeUnit('unit_013', 1, 0, now),
    makeUnit('unit_015', 1, 0, now + 1),
  ];
};

function makeUnit(masterId: string, level: number, awakenRank: number, acquiredAt: number): OwnedUnit {
  const master = getUnitMaster(masterId)!;
  const awakeningCount = 0;
  const currentRarity: StarRarity = RARITY_TYPE_TO_STAR[master.rarity] ?? 1;
  return {
    instanceId: `unit_${instanceCounter++}_${masterId}`,
    masterId,
    level,
    exp: 0,
    awakenRank,
    awakeningCount,
    currentRarity,
    currentStats: calcUnitStats(master, level, awakenRank, awakeningCount),
    isLocked: false,
    acquiredAt,
  };
}

const EXP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(level, 1.3));

export const useUnitStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      ownedUnits: createInitialUnits(),
      awakeningCrystals: {},

      addAwakeningCrystal: (masterId) => {
        set(s => ({
          awakeningCrystals: {
            ...s.awakeningCrystals,
            [masterId]: (s.awakeningCrystals[masterId] ?? 0) + 1,
          },
        }));
      },

      getAwakeningCrystalCount: (masterId) => get().awakeningCrystals[masterId] ?? 0,

      addUnit: (masterId) => {
        const master = getUnitMaster(masterId)!;
        const awakeningCount = 0;
        const currentRarity: StarRarity = RARITY_TYPE_TO_STAR[master.rarity] ?? 1;
        const newUnit: OwnedUnit = {
          instanceId: `unit_${Date.now()}_${masterId}`,
          masterId,
          level: 1,
          exp: 0,
          awakenRank: 0,
          awakeningCount,
          currentRarity,
          currentStats: calcUnitStats(master, 1, 0, awakeningCount),
          isLocked: false,
          acquiredAt: Date.now(),
        };
        set(s => ({ ownedUnits: [...s.ownedUnits, newUnit] }));
        return newUnit;
      },

      levelUpUnit: (instanceId, expAmount) => {
        set(s => ({
          ownedUnits: s.ownedUnits.map(unit => {
            if (unit.instanceId !== instanceId) return unit;
            const master = getUnitMaster(unit.masterId)!;
            const lvCap = getLevelCap(unit.currentRarity);
            let { level, exp } = unit;
            exp += expAmount;
            while (level < lvCap && exp >= EXP_PER_LEVEL(level)) {
              exp -= EXP_PER_LEVEL(level);
              level++;
            }
            if (level >= lvCap) exp = 0;
            const currentStats = calcUnitStats(master, level, unit.awakenRank, unit.awakeningCount ?? 0);
            return { ...unit, level, exp, currentStats };
          }),
        }));
      },

      awakenUnit: (instanceId) => {
        const unit = get().ownedUnits.find(u => u.instanceId === instanceId);
        if (!unit) return false;
        const master = getUnitMaster(unit.masterId)!;
        if (unit.awakenRank >= master.maxAwaken) return false;
        set(s => ({
          ownedUnits: s.ownedUnits.map(u => {
            if (u.instanceId !== instanceId) return u;
            const newAwaken = u.awakenRank + 1;
            const currentStats = calcUnitStats(master, u.level, newAwaken, u.awakeningCount ?? 0);
            return { ...u, awakenRank: newAwaken, currentStats };
          }),
        }));
        return true;
      },

      incrementAwakeningCount: (instanceId) => {
        const { ownedUnits, awakeningCrystals } = get();
        const unit = ownedUnits.find(u => u.instanceId === instanceId);
        if (!unit) return false;
        if ((unit.awakeningCount ?? 0) >= AWAKENING_CONFIG.maxAwakeningCount) return false;
        const crystalCount = awakeningCrystals[unit.masterId] ?? 0;
        if (crystalCount <= 0) return false;
        const master = getUnitMaster(unit.masterId)!;
        set(s => ({
          awakeningCrystals: {
            ...s.awakeningCrystals,
            [unit.masterId]: Math.max(0, (s.awakeningCrystals[unit.masterId] ?? 0) - 1),
          },
          ownedUnits: s.ownedUnits.map(u => {
            if (u.instanceId !== instanceId) return u;
            const newCount = (u.awakeningCount ?? 0) + 1;
            return { ...u, awakeningCount: newCount, currentStats: calcUnitStats(master, u.level, u.awakenRank, newCount) };
          }),
        }));
        return true;
      },

      rarityUp: (instanceId) => {
        const unit = get().ownedUnits.find(u => u.instanceId === instanceId);
        if (!unit) return false;
        const nextR = NEXT_RARITY[String(unit.currentRarity)];
        if (!nextR) return false;
        if (unit.level < getLevelCap(unit.currentRarity)) return false;
        const master = getUnitMaster(unit.masterId)!;
        set(s => ({
          ownedUnits: s.ownedUnits.map(u => {
            if (u.instanceId !== instanceId) return u;
            const newStats = calcUnitStats(master, u.level, u.awakenRank, u.awakeningCount ?? 0);
            return { ...u, currentRarity: nextR as StarRarity, currentStats: newStats };
          }),
        }));
        return true;
      },

      toggleLock: (instanceId) => {
        set(s => ({
          ownedUnits: s.ownedUnits.map(u =>
            u.instanceId === instanceId ? { ...u, isLocked: !u.isLocked } : u
          ),
        }));
      },

      getUnit: (instanceId) => get().ownedUnits.find(u => u.instanceId === instanceId),

      calcStats: (unit) => {
        const master = getUnitMaster(unit.masterId)!;
        return calcUnitStats(master, unit.level, unit.awakenRank, unit.awakeningCount ?? 0);
      },

      syncUnitsToServer: async () => {
        const { ownedUnits } = get();
        try {
          await fetch('/api/units/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              units: ownedUnits.map(u => ({
                masterId: u.masterId,
                level: u.level,
                exp: u.exp,
                awakenRank: u.awakenRank,
                awakeningCount: u.awakeningCount ?? 0,
                currentRarity: String(u.currentRarity),
                isLocked: u.isLocked,
              })),
            }),
          });
        } catch { /* silent */ }
      },

      // ガチャ被り処理: masterIds 配列を受け取り 新規/覚醒/覚醒結晶 を一括処理
      processSummonResults: (masterIds: string[]): GachaApplyResult[] => {
        let currentOwned = [...get().ownedUnits];
        const newUnits: OwnedUnit[] = [];
        const results: GachaApplyResult[] = [];

        for (const masterId of masterIds) {
          const master = getUnitMaster(masterId);
          if (!master) { results.push({ type: 'new' }); continue; }

          const allForMaster = [
            ...currentOwned.filter(u => u.masterId === masterId),
            ...newUnits.filter(u => u.masterId === masterId),
          ].sort((a, b) => a.awakeningCount - b.awakeningCount);

          const target = allForMaster[0];

          if (!target) {
            // 未所持 → 新規追加
            const awakeningCount = 0;
            const currentRarity: StarRarity = RARITY_TYPE_TO_STAR[master.rarity] ?? 1;
            const newUnit: OwnedUnit = {
              instanceId: `unit_${Date.now()}_${masterId}_${newUnits.length}`,
              masterId, level: 1, exp: 0, awakenRank: 0,
              awakeningCount, currentRarity,
              currentStats: calcUnitStats(master, 1, 0, awakeningCount),
              isLocked: false, acquiredAt: Date.now(),
            };
            newUnits.push(newUnit);
            results.push({ type: 'new' });

          } else {
            // 被り → キャラ専用覚醒結晶を付与
            results.push({ type: 'crystal', masterId });
          }
        }

        set(() => ({ ownedUnits: [...currentOwned, ...newUnits] }));
        return results;
      },
    }),
    {
      name: 'arcana-units',
      merge: (persisted, current) => {
        const p = persisted as Partial<UnitStore>;
        if (!p?.ownedUnits) return current;
        return {
          ...current,
          ownedUnits: (p.ownedUnits as Array<Parameters<typeof migrateUnit>[0]>).map(migrateUnit),
          awakeningCrystals: (p.awakeningCrystals as Record<string, number>) ?? {},
        };
      },
    }
  )
);
