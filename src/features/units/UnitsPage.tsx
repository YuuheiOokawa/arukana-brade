import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { getUnitMaster } from '../../data/units';
import { UnitCard } from '../../components/ui/UnitCard';
import { TopBar } from '../../components/layout/TopBar';
import { getStarRarityOrder } from '../../data/rarityConfig';
import type { ElementType, StarRarity } from '../../types';

const ELEMENTS: (ElementType | 'all')[] = ['all', 'fire', 'water', 'wind', 'earth', 'light', 'dark'];
const ELEMENT_LABELS: Record<string, string> = {
  all: '全', fire: '炎', water: '水', wind: '風', earth: '土', light: '光', dark: '闇',
};

type StarFilter = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'CROWN';
const STAR_FILTERS: StarFilter[] = ['all', 1, 2, 3, 4, 5, 6, 7, 'CROWN'];
const starFilterLabel = (f: StarFilter) => {
  if (f === 'all') return '全';
  if (f === 'CROWN') return '👑';
  return `★${f}`;
};

export const UnitsPage = () => {
  const navigate = useNavigate();
  const { ownedUnits } = useUnitStore();
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterStar, setFilterStar] = useState<StarFilter>('all');
  const [sortBy, setSortBy] = useState<'acquired' | 'level' | 'rarity'>('acquired');

  const filtered = ownedUnits
    .filter(u => {
      const master = getUnitMaster(u.masterId);
      if (!master) return false;
      if (filterElement !== 'all' && master.element !== filterElement) return false;
      if (filterStar !== 'all') {
        const cr: StarRarity = u.currentRarity ?? 1;
        if (cr !== filterStar) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'rarity') {
        const ra: StarRarity = a.currentRarity ?? 1;
        const rb: StarRarity = b.currentRarity ?? 1;
        return getStarRarityOrder(rb) - getStarRarityOrder(ra);
      }
      return b.acquiredAt - a.acquiredAt;
    });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'radial-gradient(ellipse at 50% 0%, #12082a 0%, #080818 60%)' }}>
      <TopBar title="ユニット一覧" />

      {/* フィルター */}
      <div className="px-4 py-2 space-y-2">
        {/* 属性フィルター */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {ELEMENTS.map(el => (
            <button
              key={el}
              onClick={() => setFilterElement(el)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                filterElement === el ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-400 hover:text-white'
              }`}
            >
              {ELEMENT_LABELS[el]}
            </button>
          ))}
        </div>

        {/* 星レアリティフィルター */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {STAR_FILTERS.map(f => (
            <button
              key={String(f)}
              onClick={() => setFilterStar(f)}
              className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold transition-colors ${
                filterStar === f ? 'bg-yellow-600 text-white' : 'bg-gray-800/70 text-gray-400 hover:text-white'
              }`}
            >
              {starFilterLabel(f)}
            </button>
          ))}
        </div>

        {/* ソート */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs">{filtered.length} / {ownedUnits.length} 体</p>
          <div className="flex gap-1">
            {(['acquired', 'level', 'rarity'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-800/70 text-gray-400'
                }`}
              >
                {s === 'acquired' ? '取得順' : s === 'level' ? 'Lv順' : 'レア順'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 gap-2">
        {filtered.map(unit => (
          <UnitCard
            key={unit.instanceId}
            unit={unit}
            onClick={() => navigate(`/units/${unit.instanceId}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>条件に合うユニットがいません</p>
          </div>
        )}
      </div>
    </div>
  );
};
