import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartyComposition } from '../types';

interface PartyStore {
  parties: PartyComposition[];
  activePartyId: string;
  setSlot: (partyId: string, slotIndex: number, instanceId: string | null) => void;
  setLeader: (partyId: string, instanceId: string | null) => void;
  createParty: (name: string) => void;
  setActiveParty: (partyId: string) => void;
  getActiveParty: () => PartyComposition;
  // ユニット解放(売却)時に、全パーティのスロット・リーダー指定から当該ユニットを取り除く
  removeUnitFromParties: (instanceId: string) => void;
}

const DEFAULT_PARTY: PartyComposition = {
  id: 'party_default',
  name: 'パーティ1',
  slots: [null, null, null, null, null],
  leaderId: null,
};

export const usePartyStore = create<PartyStore>()(
  persist(
    (set, get) => ({
      parties: [DEFAULT_PARTY],
      activePartyId: 'party_default',

      setSlot: (partyId, slotIndex, instanceId) => {
        if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 5) return;
        set(s => ({
          parties: s.parties.map(p => {
            if (p.id !== partyId) return p;
            const slots = [...p.slots];
            // 既に同じユニットが他スロットにいたら外す
            if (instanceId) {
              const existingIdx = slots.findIndex(s => s === instanceId);
              if (existingIdx !== -1 && existingIdx !== slotIndex) slots[existingIdx] = null;
            }
            slots[slotIndex] = instanceId;
            const leaderId = p.leaderId && slots.includes(p.leaderId)
              ? p.leaderId : slots.find(id => id !== null) ?? null;
            return { ...p, slots, leaderId };
          }),
        }));
      },

      setLeader: (partyId, instanceId) => {
        set(s => ({
          parties: s.parties.map(p =>
            p.id === partyId && (instanceId === null || p.slots.includes(instanceId)) ? { ...p, leaderId: instanceId } : p
          ),
        }));
      },

      createParty: (name) => {
        const id = `party_${Date.now()}`;
        set(s => ({
          parties: [...s.parties, { id, name, slots: [null, null, null, null, null], leaderId: null }],
        }));
      },

      setActiveParty: (partyId) => { if(get().parties.some(p => p.id === partyId)) set({activePartyId:partyId}); },

      removeUnitFromParties: (instanceId) => {
        set(s => ({
          parties: s.parties.map(p => {
            if (!p.slots.includes(instanceId) && p.leaderId !== instanceId) return p;
            const slots = p.slots.map(s2 => (s2 === instanceId ? null : s2));
            const leaderId = p.leaderId === instanceId
              ? (slots.find(s2 => s2 !== null) ?? null)
              : p.leaderId;
            return { ...p, slots, leaderId };
          }),
        }));
      },

      getActiveParty: () => {
        const { parties, activePartyId } = get();
        return parties.find(p => p.id === activePartyId) ?? parties[0] ?? DEFAULT_PARTY;
      },
    }),
    { name: 'arcana-party' }
  )
);
