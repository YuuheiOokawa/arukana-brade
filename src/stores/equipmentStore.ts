import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedEquipment } from '../types';

let instCounter = 0;
const newInstId = () => `eq_${Date.now()}_${instCounter++}`;

interface EquipmentStore {
  ownedEquipments: OwnedEquipment[];
  addEquipment: (masterId: string) => string;
  equipToUnit: (equipInstanceId: string, unitInstanceId: string, slot: string) => void;
  unequipFromUnit: (unitInstanceId: string, slot: string) => void;
  levelUpEquipment: (equipInstanceId: string, expGain: number) => void;
  getEquippedByUnit: (unitInstanceId: string) => OwnedEquipment[];
  sellEquipment: (equipInstanceId: string) => boolean;
}

const EXP_PER_LEVEL = (level: number) => Math.floor(80 * Math.pow(level, 1.2));

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      ownedEquipments: [
        { instanceId: 'eq_init_1', masterId: 'equip_sword_silver',   level: 1, exp: 0 },
        { instanceId: 'eq_init_2', masterId: 'equip_chain_mail',     level: 1, exp: 0 },
        { instanceId: 'eq_init_3', masterId: 'equip_ring_iron',      level: 1, exp: 0 },
        { instanceId: 'eq_init_4', masterId: 'equip_leather_armor',  level: 1, exp: 0 },
        { instanceId: 'eq_init_5', masterId: 'equip_amulet_guardian',level: 1, exp: 0 },
      ],

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

      levelUpEquipment: (equipInstanceId, expGain) => {
        set(s => ({
          ownedEquipments: s.ownedEquipments.map(eq => {
            if (eq.instanceId !== equipInstanceId) return eq;
            let { level, exp } = eq;
            exp += expGain;
            const needed = EXP_PER_LEVEL(level);
            if (exp >= needed && level < 80) {
              exp -= needed;
              level++;
            }
            return { ...eq, level, exp };
          }),
        }));
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
