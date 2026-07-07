import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNIT_MASTER } from '../../data/units';
import { EQUIPMENT_MASTER } from '../../data/equipments';
import { useUnitStore } from '../../stores/unitStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { TopBar } from '../../components/layout/TopBar';
import { RARITY_TO_STAR, STAR_COLORS, ELEMENT_NAMES } from '../../types';
import type { ElementType, EquipmentRarity, EquipmentSlot } from '../../types';

const ELEMENT_FILTERS: (ElementType | 'all')[] = ['all', 'fire', 'water', 'wind', 'earth', 'thunder', 'light', 'dark'];
const ELEMENT_LABELS: Record<string, string> = {
  all: '全', fire: '炎', water: '水', wind: '風', earth: '土', thunder: '雷', light: '光', dark: '闇',
};
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

const EQ_RARITY_COLOR: Record<EquipmentRarity, string> = {
  N: '#9ca3af', R: '#60a5fa', SR: '#a78bfa', SSR: '#fbbf24',
};
const EQ_SLOT_FILTERS: (EquipmentSlot | 'all')[] = ['all', 'weapon', 'armor', 'accessory'];
const EQ_SLOT_LABELS: Record<string, string> = {
  all: '全', weapon: '⚔️ 武器', armor: '🛡️ 防具', accessory: '💍 アクセ',
};

type CollectionTab = 'units' | 'equipment';

export const CollectionPage = () => {
  const navigate = useNavigate();
  const { ownedUnits } = useUnitStore();
  const { ownedEquipments } = useEquipmentStore();
  const { discovered, discoveredEquips, registerDiscovered, registerDiscoveredEquips } = useCollectionStore();
  const [tab, setTab] = useState<CollectionTab>('units');
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterSlot, setFilterSlot] = useState<EquipmentSlot | 'all'>('all');

  // 現在所持しているユニット・装備を図鑑に登録（過去に登録済みのものは維持される）
  useEffect(() => {
    if (ownedUnits.length > 0) {
      registerDiscovered(ownedUnits.map(u => u.masterId));
    }
    if (ownedEquipments.length > 0) {
      registerDiscoveredEquips(ownedEquipments.map(e => e.masterId));
    }
  }, [ownedUnits, ownedEquipments, registerDiscovered, registerDiscoveredEquips]);

  const discoveredSet = useMemo(() => {
    const s = new Set(discovered);
    ownedUnits.forEach(u => s.add(u.masterId));
    return s;
  }, [discovered, ownedUnits]);

  const discoveredEquipSet = useMemo(() => {
    const s = new Set(discoveredEquips);
    ownedEquipments.forEach(e => s.add(e.masterId));
    return s;
  }, [discoveredEquips, ownedEquipments]);

  // ユニット図鑑
  const filteredUnits = UNIT_MASTER.filter(m => filterElement === 'all' || m.element === filterElement);
  const unitTotal = UNIT_MASTER.length;
  const unitFound = UNIT_MASTER.filter(m => discoveredSet.has(m.id)).length;

  // 装備図鑑
  const filteredEquips = EQUIPMENT_MASTER.filter(m => filterSlot === 'all' || m.slot === filterSlot);
  const equipTotal = EQUIPMENT_MASTER.length;
  const equipFound = EQUIPMENT_MASTER.filter(m => discoveredEquipSet.has(m.id)).length;

  const total = tab === 'units' ? unitTotal : equipTotal;
  const found = tab === 'units' ? unitFound : equipFound;
  const pct = total > 0 ? (found / total) * 100 : 0;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'radial-gradient(ellipse at 50% 0%, #12082a 0%, #080818 60%)' }}>
      <TopBar title="図鑑" />

      {/* タブ */}
      <div className="px-4 mb-4 flex gap-2">
        <button onClick={() => setTab('units')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'units' ? 'tab-active' : 'tab-inactive'}`}>
          👥 ユニット
        </button>
        <button onClick={() => setTab('equipment')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'equipment' ? 'tab-active' : 'tab-inactive'}`}>
          ⚔️ 装備
        </button>
      </div>

      {/* 達成状況サマリー */}
      <div className="mx-4 mb-4 rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(22,12,55,0.96), rgba(14,8,36,0.98))',
          border: '1px solid rgba(139,92,246,0.35)',
        }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm font-bold">📖 コレクション達成率</p>
          <p className="text-white font-black">
            {found} <span className="text-gray-500 text-sm">/ {total}</span>
          </p>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #f0c040)' }} />
        </div>
        <p className="text-right text-xs font-bold" style={{ color: pct >= 100 ? '#f0c040' : '#a78bfa' }}>
          {pct.toFixed(1)}%{pct >= 100 ? ' 🎉 コンプリート！' : ''}
        </p>
      </div>

      {/* フィルター */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {tab === 'units'
            ? ELEMENT_FILTERS.map(el => (
                <button key={el} onClick={() => setFilterElement(el)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    filterElement === el ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-400'
                  }`}>
                  {ELEMENT_LABELS[el]}
                </button>
              ))
            : EQ_SLOT_FILTERS.map(s => (
                <button key={s} onClick={() => setFilterSlot(s)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    filterSlot === s ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-400'
                  }`}>
                  {EQ_SLOT_LABELS[s]}
                </button>
              ))}
        </div>
      </div>

      {/* ユニット図鑑グリッド */}
      {tab === 'units' && (
        <div className="px-4 grid grid-cols-3 gap-2">
          {filteredUnits.map(m => {
            const isDiscovered = discoveredSet.has(m.id);
            const star = RARITY_TO_STAR[m.rarity];
            const starColor = STAR_COLORS[star];
            const ownedInstance = ownedUnits.find(u => u.masterId === m.id);
            return (
              <button key={m.id}
                onClick={() => { if (ownedInstance) navigate(`/units/${ownedInstance.instanceId}`); }}
                className={`rounded-xl p-3 text-center transition-all ${ownedInstance ? 'active:scale-95' : ''}`}
                style={{
                  background: isDiscovered
                    ? 'linear-gradient(145deg, rgba(20,10,40,0.9), rgba(10,5,20,0.95))'
                    : 'rgba(10,8,20,0.8)',
                  border: `1px solid ${isDiscovered ? `${starColor}55` : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isDiscovered ? `0 0 10px ${starColor}22` : 'none',
                }}>
                <p className="text-3xl mb-1.5"
                  style={{ filter: isDiscovered ? 'none' : 'grayscale(1) brightness(0.25)' }}>
                  {m.emoji}
                </p>
                {isDiscovered ? (
                  <>
                    <p className="text-white text-[10px] font-bold leading-tight truncate">{m.name}</p>
                    <p className="text-[9px] font-bold mt-0.5" style={{ color: starColor }}>{'★'.repeat(star)}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: ELEMENT_COLORS[m.element] }}>
                      {ELEMENT_NAMES[m.element]}属性
                    </p>
                    {ownedInstance && (
                      <p className="text-[8px] text-gray-500 mt-0.5">Lv.{ownedInstance.level} 所持中</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-[10px] font-bold">？？？</p>
                    <p className="text-[9px] font-bold mt-0.5 text-gray-700">{'★'.repeat(star)}</p>
                    <p className="text-[9px] mt-0.5 text-gray-700">{ELEMENT_NAMES[m.element]}属性</p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 装備図鑑グリッド */}
      {tab === 'equipment' && (
        <div className="px-4 grid grid-cols-3 gap-2">
          {filteredEquips.map(m => {
            const isDiscovered = discoveredEquipSet.has(m.id);
            const color = EQ_RARITY_COLOR[m.rarity];
            const ownedCount = ownedEquipments.filter(e => e.masterId === m.id).length;
            return (
              <div key={m.id}
                className="rounded-xl p-3 text-center"
                style={{
                  background: isDiscovered
                    ? 'linear-gradient(145deg, rgba(20,10,40,0.9), rgba(10,5,20,0.95))'
                    : 'rgba(10,8,20,0.8)',
                  border: `1px solid ${isDiscovered ? `${color}55` : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isDiscovered ? `0 0 10px ${color}22` : 'none',
                }}>
                <p className="text-3xl mb-1.5"
                  style={{ filter: isDiscovered ? 'none' : 'grayscale(1) brightness(0.25)' }}>
                  {m.emoji}
                </p>
                {isDiscovered ? (
                  <>
                    <p className="text-white text-[10px] font-bold leading-tight truncate">{m.name}</p>
                    <p className="text-[9px] font-black mt-0.5" style={{ color }}>{m.rarity}</p>
                    <p className="text-[9px] mt-0.5 text-gray-500">{EQ_SLOT_LABELS[m.slot]}</p>
                    {m.requiredElement && (
                      <p className="text-[8px] mt-0.5" style={{ color: ELEMENT_COLORS[m.requiredElement] }}>
                        {ELEMENT_NAMES[m.requiredElement]}専用
                      </p>
                    )}
                    {ownedCount > 0 && (
                      <p className="text-[8px] text-gray-500 mt-0.5">×{ownedCount} 所持中</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-[10px] font-bold">？？？</p>
                    <p className="text-[9px] font-black mt-0.5 text-gray-700">{m.rarity}</p>
                    <p className="text-[9px] mt-0.5 text-gray-700">{EQ_SLOT_LABELS[m.slot]}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-gray-600 text-xs mt-5">
        {tab === 'units'
          ? '召喚やクエストでユニットを入手すると図鑑に登録されます'
          : '武具の試練場やワールドボスで装備を入手すると図鑑に登録されます'}
      </p>
    </div>
  );
};
