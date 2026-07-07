import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedEquipment } from '../types';
import { getEquipmentMaster, getEffectiveMaxLevel, MAX_EVOLVE_RANK } from '../data/equipments';

let instCounter = 0;
const newInstId = () => `eq_${Date.now()}_${instCounter++}`;

interface EquipmentStore {
  ownedEquipments: OwnedEquipment[];
  addEquipment: (masterId: string) => string;
  equipToUnit: (equipInstanceId: string, unitInstanceId: string, slot: string) => void;
  unequipFromUnit: (unitInstanceId: string, slot: string) => void;
  unequipEquipment: (equipInstanceId: string) => void;
  levelUpEquipment: (equipInstanceId: string, expGain: number) => void;
  evolveEquipment: (equipInstanceId: string) => boolean;
  getEquippedByUnit: (unitInstanceId: string) => OwnedEquipment[];
  sellEquipment: (equipInstanceId: string) => boolean;
}

export const EXP_PER_LEVEL = (level: number) => Math.floor(80 * Math.pow(level, 1.2));

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      ownedEquipments: [],

      addEquipment: (masterId) => {
        const id = newInstId();
        set(s => ({
          ownedEquipments: [...s.ownedEquipments, { instanceId: id, masterId, level: 1, exp: 0 }],
        }));
        return id;
      },

      equipToUnit: (equipInstanceId, unitInstanceId, _slot) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq => {
            // 同じスロットの既装備を外す
            if (eq.equippedTo === unitInstanceId) {
              return eq;
            }
            if (eq.instanceId === equipInstanceId) {
              return { ...eq, equippedTo: unitInstanceId };
            }
            return eq;
          }),
        }));
      },

      unequipFromUnit: (unitInstanceId, _slot) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq =>
            eq.equippedTo === unitInstanceId ? { ...eq, equippedTo: undefined } : eq
          ),
        }));
      },

      unequipEquipment: (equipInstanceId) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq =>
            eq.instanceId === equipInstanceId ? { ...eq, equippedTo: undefined } : eq
          ),
        }));
      },

      levelUpEquipment: (equipInstanceId, expGain) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq => {
            if (eq.instanceId !== equipInstanceId) return eq;
            const master = getEquipmentMaster(eq.masterId);
            const maxLevel = master ? getEffectiveMaxLevel(master, eq.evolveRank ?? 0) : 80;
            let { level, exp } = eq;
            exp += expGain;
            const needed = EXP_PER_LEVEL(level);
            if (exp >= needed && level < maxLevel) {
              exp -= needed;
              level++;
            }
            return { ...eq, level, exp };
          }),
        }));
      },

      // 進化: 実効最大レベル到達時のみ可（素材・ゴールドの確認と消費は呼び出し側で行う）
      evolveEquipment: (equipInstanceId) => {
        const eq = get().ownedEquipments.find(e => e.instanceId === equipInstanceId);
        if (!eq) return false;
        const master = getEquipmentMaster(eq.masterId);
        if (!master) return false;
        const rank = eq.evolveRank ?? 0;
        if (rank >= MAX_EVOLVE_RANK) return false;
        if (eq.level < getEffectiveMaxLevel(master, rank)) return false;
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(e =>
            e.instanceId === equipInstanceId ? { ...e, evolveRank: rank + 1 } : e
          ),
        }));
        return true;
      },

      getEquippedByUnit: (unitInstanceId) => {
        return get().ownedEquipments.filter(eq => eq.equippedTo === unitInstanceId);
      },

      sellEquipment: (equipInstanceId) => {
        const eq = get().ownedEquipments.find(e => e.instanceId === equipInstanceId);
        if (!eq || eq.equippedTo) return false;
        set(s => ({
          ownedEquipments: s.ownedEquipments.filter(e => e.instanceId !== equipInstanceId),
        }));
        return true;
      },
    }),
    { name: 'arcana-equipments' }
  )
);
