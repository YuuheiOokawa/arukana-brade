import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { UNIT_MASTER } from '../../data/units';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { TopBar } from '../../components/layout/TopBar';
import type { OwnedUnit } from '../../types';

export const PartyPage = () => {
  const navigate = useNavigate();
  const { setSlot, setLeader, getActiveParty } = usePartyStore();
  const { ownedUnits } = useUnitStore();
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);

  const party = getActiveParty();

  const getUnitInSlot = (instanceId: string | null) =>
    instanceId ? ownedUnits.find(u => u.instanceId === instanceId) : null;

  const handleSlotClick = (slotIndex: number) => {
    const current = party.slots[slotIndex];
    if (current) {
      // 外す
      setSlot(party.id, slotIndex, null);
    } else {
      setSelectingSlot(slotIndex);
    }
  };

  const handleUnitSelect = (unit: OwnedUnit) => {
    if (selectingSlot === null) return;
    setSlot(party.id, selectingSlot, unit.instanceId);
    setSelectingSlot(null);
  };

  const inPartyIds = new Set(party.slots.filter(Boolean));
  const availableUnits = ownedUnits.filter(u => !inPartyIds.has(u.instanceId));

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="パーティ編成" />

      {/* スロット */}
      <div className="px-4 mb-6">
        <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">パーティ編成 (最大5体)</h3>
        <div className="grid grid-cols-5 gap-2">
          {party.slots.map((instanceId, idx) => {
            const unit = getUnitInSlot(instanceId);
            const master = unit ? UNIT_MASTER.find(m => m.id === unit.masterId) : null;
            const isLeader = instanceId === party.leaderId;

            return (
              <div key={idx} className="relative">
                {isLeader && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-xs bg-yellow-500 text-black font-black px-1 rounded">L</div>
                )}
                <button
                  onClick={() => handleSlotClick(idx)}
                  className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    unit
                      ? 'border-purple-500 cursor-pointer active:scale-95'
                      : 'border-dashed border-gray-600 hover:border-gray-400'
                  } ${isLeader ? 'border-yellow-400' : ''}`}
                  style={master ? { background: elementGradient(master.element) } : { background: '#1a1a35' }}
                >
                  {unit && master ? (
                    <>
                      <span className="text-2xl">{master.emoji}</span>
                      <span className="text-white text-xs font-bold">{unit.level}</span>
                    </>
                  ) : (
                    <span className="text-gray-600 text-2xl">+</span>
                  )}
                </button>
                {unit && (
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <button
                      onClick={() => setLeader(party.id, instanceId)}
                      className={`text-xs ${isLeader ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                    >
                      {isLeader ? '👑' : '⭐'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {party.leaderId && (
          <p className="text-gray-400 text-xs mt-2 text-center">👑 = リーダー（タップで設定）</p>
        )}
      </div>

      {/* ユニット選択モーダル */}
      {selectingSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full max-h-[70vh] bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-bold">ユニットを選択</h3>
              <button onClick={() => setSelectingSlot(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {availableUnits.length === 0 ? (
                <p className="text-center text-gray-400 py-8">追加できるユニットがいません</p>
              ) : (
                availableUnits.map(unit => {
                  const master = UNIT_MASTER.find(m => m.id === unit.masterId);
                  if (!master) return null;
                  return (
                    <button
                      key={unit.instanceId}
                      onClick={() => handleUnitSelect(unit)}
                      className="w-full card-base p-3 flex items-center gap-3 active:scale-98 hover:border-purple-500 text-left"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ background: elementGradient(master.element) }}>
                        {master.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-1 mb-0.5">
                          <RarityBadge rarity={master.rarity} size="sm" />
                          <ElementBadge element={master.element} size="sm" />
                        </div>
                        <p className="text-white font-bold text-sm">{master.name}</p>
                        <p className="text-gray-400 text-xs">Lv.{unit.level} / ATK {unit.currentStats.atk.toLocaleString()}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 現在の編成サマリー */}
      <div className="px-4 mb-4">
        <div className="card-base p-3">
          <h3 className="text-gray-400 text-xs font-bold mb-2">編成中のユニット</h3>
          {party.slots.filter(Boolean).length === 0 ? (
            <p className="text-gray-500 text-sm">ユニットが選択されていません</p>
          ) : (
            <div className="space-y-1">
              {party.slots.map((id, idx) => {
                if (!id) return null;
                const unit = getUnitInSlot(id);
                const master = unit ? UNIT_MASTER.find(m => m.id === unit.masterId) : null;
                if (!unit || !master) return null;
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-4">{idx + 1}</span>
                    <span>{master.emoji}</span>
                    <span className="text-white flex-1">{master.name}</span>
                    <span className="text-gray-400">Lv.{unit.level}</span>
                    {id === party.leaderId && <span className="text-yellow-400 text-xs">👑</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <button onClick={() => navigate('/quests')} className="btn-primary w-full">
          ⚔️ クエストへ
        </button>
      </div>
    </div>
  );
};

const elementGradient = (element: string): string => {
  const map: Record<string, string> = {
    fire: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
    water: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    wind: 'linear-gradient(135deg, #064e3b, #10b981)',
    earth: 'linear-gradient(135deg, #451a03, #92400e)',
    light: 'linear-gradient(135deg, #713f12, #ca8a04)',
    dark: 'linear-gradient(135deg, #2e1065, #7c3aed)',
  };
  return map[element] ?? '';
};
