import { useState } from 'react';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useUnitStore } from '../../stores/unitStore';
import { UNIT_MASTER } from '../../data/units';
import { calcEquipmentStats, getEquipmentMaster } from '../../data/equipments';
import { TopBar } from '../../components/layout/TopBar';
import { elementGradient } from '../../utils/elementUtils';
import type { EquipmentSlot, EquipmentRarity, OwnedEquipment } from '../../types';

const RARITY_COLOR: Record<EquipmentRarity, string> = {
  N:   '#6b7280',
  R:   '#3b82f6',
  SR:  '#7c3aed',
  SSR: '#f59e0b',
};

const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: '⚔️ 武器', armor: '🛡️ 防具', accessory: '💍 アクセサリー',
};

type TabType = 'list' | 'equip';

export const EquipmentPage = () => {
  const { ownedEquipments, sellEquipment, equipToUnit } = useEquipmentStore();
  const { ownedUnits } = useUnitStore();
  const [tab, setTab] = useState<TabType>('list');
  const [selectedEq, setSelectedEq] = useState<OwnedEquipment | null>(null);
  const [filterSlot, setFilterSlot] = useState<EquipmentSlot | 'all'>('all');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const filtered = ownedEquipments.filter(eq => {
    const m = getEquipmentMaster(eq.masterId);
    return m && (filterSlot === 'all' || m.slot === filterSlot);
  });

  const handleEquip = (unitInstanceId: string) => {
    if (!selectedEq) return;
    const master = getEquipmentMaster(selectedEq.masterId);
    if (!master) return;
    equipToUnit(selectedEq.instanceId, unitInstanceId, master.slot);
    showToast(`${master.name} を装備しました`);
    setSelectedEq(null);
    setTab('list');
  };

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="装備" />

      {/* タブ */}
      <div className="px-4 mb-4 flex gap-2">
        {(['list', 'equip'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${t === tab ? 'tab-active' : 'tab-inactive'}`}>
            {t === 'list' ? '📦 所持装備' : '🔗 ユニット装備管理'}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <>
          {/* スロットフィルター */}
          <div className="px-4 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'weapon', 'armor', 'accessory'] as const).map(s => (
              <button key={s} onClick={() => setFilterSlot(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterSlot === s ? 'tab-active' : 'tab-inactive'}`}>
                {s === 'all' ? '全て' : SLOT_LABEL[s]}
              </button>
            ))}
          </div>

          {/* 装備一覧 */}
          <div className="px-4 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🗡️</p>
                <p className="text-gray-500">装備がありません</p>
                <p className="text-gray-600 text-sm mt-1">クエストをクリアして入手しよう</p>
              </div>
            )}
            {filtered.map(eq => {
              const master = getEquipmentMaster(eq.masterId);
              if (!master) return null;
              const stats = calcEquipmentStats(master, eq.level);
              const equippedUnit = eq.equippedTo ? ownedUnits.find(u => u.instanceId === eq.equippedTo) : null;
              const equippedMaster = equippedUnit ? UNIT_MASTER.find(m => m.id === equippedUnit.masterId) : null;

              return (
                <div key={eq.instanceId}
                  className={`card-base p-3.5 cursor-pointer unit-card-hover ${selectedEq?.instanceId === eq.instanceId ? 'border-yellow-500/60' : ''}`}
                  onClick={() => setSelectedEq(prev => prev?.instanceId === eq.instanceId ? null : eq)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${RARITY_COLOR[master.rarity]}22`, border: `1px solid ${RARITY_COLOR[master.rarity]}44` }}>
                      {master.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black px-1.5 rounded"
                          style={{ background: `${RARITY_COLOR[master.rarity]}33`, color: RARITY_COLOR[master.rarity] }}>
                          {master.rarity}
                        </span>
                        <p className="text-white font-bold text-sm">{master.name}</p>
                      </div>
                      <p className="text-gray-500 text-xs">{SLOT_LABEL[master.slot]} · Lv{eq.level}</p>
                      <div className="flex gap-2 mt-1 text-xs">
                        {stats.atk > 0 && <span className="text-red-400">ATK +{stats.atk}</span>}
                        {stats.def > 0 && <span className="text-blue-400">DEF +{stats.def}</span>}
                        {stats.hp  > 0 && <span className="text-green-400">HP +{stats.hp}</span>}
                        {stats.rec > 0 && <span className="text-teal-400">REC +{stats.rec}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {equippedMaster ? (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>{equippedMaster.emoji}</span>
                          <span>{equippedMaster.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">未装備</span>
                      )}
                    </div>
                  </div>

                  {/* 展開メニュー */}
                  {selectedEq?.instanceId === eq.instanceId && (
                    <div className="mt-3 pt-3 border-t border-gray-700/40 flex gap-2">
                      <button className="btn-primary flex-1 text-xs py-2 min-h-0"
                        onClick={(e) => { e.stopPropagation(); setTab('equip'); }}>
                        ユニットに装備
                      </button>
                      {!eq.equippedTo && (
                        <button className="btn-secondary text-xs py-2 px-3 min-h-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            sellEquipment(eq.instanceId);
                            setSelectedEq(null);
                            showToast('売却しました');
                          }}>
                          売却
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* ユニット装備管理 */
        <div className="px-4 space-y-3">
          {selectedEq && (
            <div className="card-base p-3 border-yellow-600/40 mb-3">
              <p className="text-yellow-400 text-xs font-bold mb-1">装備中の選択</p>
              <p className="text-white font-bold">{getEquipmentMaster(selectedEq.masterId)?.emoji} {getEquipmentMaster(selectedEq.masterId)?.name}</p>
              <p className="text-gray-500 text-xs">装備するユニットを選択してください</p>
            </div>
          )}
          {ownedUnits.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">所持ユニットがありません</p>
            </div>
          )}
          {ownedUnits.map(unit => {
            const master = UNIT_MASTER.find(m => m.id === unit.masterId);
            if (!master) return null;
            const equips = ownedEquipments.filter(eq => eq.equippedTo === unit.instanceId);

            return (
              <div key={unit.instanceId} className="card-base p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: elementGradient(master.element) }}>
                    {master.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{master.name}</p>
                    <p className="text-gray-500 text-xs">Lv {unit.level} · 覚醒{unit.awakenRank}</p>
                  </div>
                  {selectedEq && (
                    <button className="ml-auto btn-primary text-xs py-2 px-3 min-h-0"
                      onClick={() => handleEquip(unit.instanceId)}>
                      装備する
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['weapon', 'armor', 'accessory'] as EquipmentSlot[]).map(slot => {
                    const equipped = equips.find(eq => getEquipmentMaster(eq.masterId)?.slot === slot);
                    const em = equipped ? getEquipmentMaster(equipped.masterId) : null;
                    return (
                      <div key={slot} className="bg-black/30 rounded-lg p-2 text-center border border-gray-700/30">
                        <p className="text-gray-600 text-[10px] mb-1">{SLOT_LABEL[slot].replace(/⚔️|🛡️|💍/, '').trim()}</p>
                        {em ? (
                          <>
                            <p className="text-lg">{em.emoji}</p>
                            <p className="text-gray-300 text-[10px] truncate">{em.name}</p>
                          </>
                        ) : (
                          <p className="text-gray-700 text-xs mt-2">空</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="card-glass px-5 py-3 border-purple-700/40">
            <p className="text-white text-sm font-medium whitespace-nowrap">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
};
