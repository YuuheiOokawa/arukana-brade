import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedUnit, UnitStats } from '../types';
import { UNIT_MASTER, calcUnitStats } from '../data/units';

interface UnitStore {
  ownedUnits: OwnedUnit[];
  addUnit: (masterId: string) => OwnedUnit;
  levelUpUnit: (instanceId: string, expAmount: number) => void;
  awakenUnit: (instanceId: string) => boolean;
  toggleLock: (instanceId: string) => void;
  getUnit: (instanceId: string) => OwnedUnit | undefined;
  calcStats: (unit: OwnedUnit) => UnitStats;
}

let instanceCounter = Date.now();

const createInitialUnits = (): OwnedUnit[] => {
  const now = Date.now();
  return [
    createOwnedUnit('unit_001', 1, 0, now - 3000),
    createOwnedUnit('unit_007', 1, 0, now - 2000),
    createOwnedUnit('unit_009', 1, 0, now - 1000),
    createOwnedUnit('unit_013', 1, 0, now),
    createOwnedUnit('unit_015', 1, 0, now + 1),
  ];
};

function createOwnedUnit(masterId: string, level: number, awakenRank: number, acquiredAt: number): OwnedUnit {
  const master = UNIT_MASTER.find(u => u.id === masterId)!;
  const stats = calcUnitStats(master, level, awakenRank);
  return {
    instanceId: `unit_${instanceCounter++}_${masterId}`,
    masterId,
    level,
    exp: 0,
    awakenRank,
    currentStats: stats,
    isLocked: false,
    acquiredAt,
  };
}

const EXP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(level, 1.3));

export const useUnitStore = create<UnitStore>()(
  persist(
    (set, get) => ({
      ownedUnits: createInitialUnits(),

      addUnit: (masterId) => {
        const master = UNIT_MASTER.find(u => u.id === masterId)!;
        const stats = calcUnitStats(master, 1, 0);
        const newUnit: OwnedUnit = {
          instanceId: `unit_${Date.now()}_${masterId}`,
          masterId,
          level: 1,
          exp: 0,
          awakenRank: 0,
          currentStats: stats,
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
            const master = UNIT_MASTER.find(u => u.id === unit.masterId)!;
            let { level, exp } = unit;
            exp += expAmount;
            while (level < master.maxLevel && exp >= EXP_PER_LEVEL(level)) {
              exp -= EXP_PER_LEVEL(level);
              level++;
            }
            if (level >= master.maxLevel) exp = 0;
            const currentStats = calcUnitStats(master, level, unit.awakenRank);
            return { ...unit, level, exp, currentStats };
          }),
        }));
      },

      awakenUnit: (instanceId) => {
        const unit = get().ownedUnits.find(u => u.instanceId === instanceId);
        if (!unit) return false;
        const master = UNIT_MASTER.find(u => u.id === unit.masterId)!;
        if (unit.awakenRank >= master.maxAwaken) return false;
        set(s => ({
          ownedUnits: s.ownedUnits.map(u => {
            if (u.instanceId !== instanceId) return u;
            const newAwaken = u.awakenRank + 1;
            const currentStats = calcUnitStats(master, u.level, newAwaken);
            return { ...u, awakenRank: newAwaken, currentStats };
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
        const master = UNIT_MASTER.find(u => u.id === unit.masterId)!;
        return calcUnitStats(master, unit.level, unit.awakenRank);
      },
    }),
    { name: 'arcana-units' }
  )
);
