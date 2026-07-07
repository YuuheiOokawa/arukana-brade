import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNIT_MASTER } from '../../data/units';
import { useUnitStore } from '../../stores/unitStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { TopBar } from '../../components/layout/TopBar';
import { RARITY_TO_STAR, STAR_COLORS, ELEMENT_NAMES } from '../../types';
import type { ElementType } from '../../types';

const ELEMENT_FILTERS: (ElementType | 'all')[] = ['all', 'fire', 'water', 'wind', 'earth', 'thunder', 'light', 'dark'];
const ELEMENT_LABELS: Record<string, string> = {
  all: '全', fire: '炎', water: '水', wind: '風', earth: '土', thunder: '雷', light: '光', dark: '闇',
};
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

export const CollectionPage = () => {
  const navigate = useNavigate();
  const { ownedUnits } = useUnitStore();
  const { discovered, registerDiscovered } = useCollectionStore();
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');

  // 現在所持しているユニットを図鑑に登録（過去に登録済みのものは維持される）
  useEffect(() => {
    if (ownedUnits.length > 0) {
      registerDiscovered(ownedUnits.map(u => u.masterId));
    }
  }, [ownedUnits, registerDiscovered]);

  const discoveredSet = useMemo(() => {
    const s = new Set(discovered);
    ownedUnits.forEach(u => s.add(u.masterId));
    return s;
  }, [discovered, ownedUnits]);

  const filtered = UNIT_MASTER.filter(m => filterElement === 'all' || m.element === filterElement);
  const totalCount = UNIT_MASTER.length;
  const discoveredCount = UNIT_MASTER.filter(m => discoveredSet.has(m.id)).length;
  const pct = totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'radial-gradient(ellipse at 50% 0%, #12082a 0%, #080818 60%)' }}>
      <TopBar title="ユニット図鑑" />

      {/* 達成状況サマリー */}
      <div className="mx-4 mb-4 rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(22,12,55,0.96), rgba(14,8,36,0.98))',
          border: '1px solid rgba(139,92,246,0.35)',
        }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm font-bold">📖 コレクション達成率</p>
          <p className="text-white font-black">
            {discoveredCount} <span className="text-gray-500 text-sm">/ {totalCount}</span>
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

      {/* 属性フィルター */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {ELEMENT_FILTERS.map(el => (
            <button key={el} onClick={() => setFilterElement(el)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filterElement === el ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-400'
              }`}>
              {ELEMENT_LABELS[el]}
            </button>
          ))}
        </div>
      </div>

      {/* 図鑑グリッド */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {filtered.map(m => {
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

      <p className="text-center text-gray-600 text-xs mt-5">
        召喚やクエストでユニットを入手すると図鑑に登録されます
      </p>
    </div>
  );
};
