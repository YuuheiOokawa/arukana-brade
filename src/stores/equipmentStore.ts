import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedEquipment } from '../types';
import { getEquipmentMaster, getEffectiveMaxLevel, MAX_EVOLVE_RANK } from '../data/equipments';
import { useCollectionStore } from './collectionStore';

let instCounter = 0;
const newInstId = () => `eq_${Date.now()}_${instCounter++}`;

interface EquipmentStore {
  ownedEquipments: OwnedEquipment[];
  addEquipment: (masterId: string) => string;
  equipToUnit: (equipInstanceId: string, unitInstanceId: string, slot: string) => void;
  unequipFromUnit: (unitInstanceId: string, slot: string) => void;
  unequipEquipment: (equipInstanceId: string) => void;
  levelUpEquipment: (equipInstanceId: string, expGain: number) => void;
  levelUpEquipmentBy: (equipInstanceId: string, levels: number) => void;
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
        // 装備図鑑に発見登録
        useCollectionStore.getState().registerDiscoveredEquips([masterId]);
        return id;
      },

      equipToUnit: (equipInstanceId, unitInstanceId, _slot) => {
        const newEq = get().ownedEquipments.find(e => e.instanceId === equipInstanceId);
        if (!newEq) return;
        const newSlot = getEquipmentMaster(newEq.masterId)?.slot;
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq => {
            if (eq.instanceId === equipInstanceId) {
              return { ...eq, equippedTo: unitInstanceId };
            }
            // 同じユニットの同じスロットの既装備は自動で外す（スロット重複防止）
            if (
              eq.equippedTo === unitInstanceId &&
              getEquipmentMaster(eq.masterId)?.slot === newSlot
            ) {
              return { ...eq, equippedTo: undefined };
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

      // 一括レベルアップ（ゴールド消費の確認は呼び出し側で行う）
      levelUpEquipmentBy: (equipInstanceId, levels) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq => {
            if (eq.instanceId !== equipInstanceId) return eq;
            const master = getEquipmentMaster(eq.masterId);
            const maxLevel = master ? getEffectiveMaxLevel(master, eq.evolveRank ?? 0) : 80;
            return { ...eq, level: Math.min(eq.level + levels, maxLevel), exp: 0 };
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
