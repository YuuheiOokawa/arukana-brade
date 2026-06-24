import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { UNIT_MASTER } from '../../data/units';
import { UnitCard } from '../../components/ui/UnitCard';
import { TopBar } from '../../components/layout/TopBar';
import type { ElementType, RarityType } from '../../types';

const ELEMENTS: (ElementType | 'all')[] = ['all', 'fire', 'water', 'wind', 'earth', 'light', 'dark'];
const RARITIES: (RarityType | 'all')[] = ['all', 'SSR', 'SR', 'R', 'N'];
const ELEMENT_LABELS: Record<string, string> = { all: '全', fire: '炎', water: '水', wind: '風', earth: '土', light: '光', dark: '闇' };

export const UnitsPage = () => {
  const navigate = useNavigate();
  const { ownedUnits } = useUnitStore();
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<RarityType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'acquired' | 'level' | 'rarity'>('acquired');

  const filtered = ownedUnits
    .filter(u => {
      const master = UNIT_MASTER.find(m => m.id === u.masterId);
      if (!master) return false;
      if (filterElement !== 'all' && master.element !== filterElement) return false;
      if (filterRarity !== 'all' && master.rarity !== filterRarity) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'rarity') {
        const ra = UNIT_MASTER.find(m => m.id === a.masterId)?.rarity ?? 'N';
        const rb = UNIT_MASTER.find(m => m.id === b.masterId)?.rarity ?? 'N';
        const order = { SSR: 3, SR: 2, R: 1, N: 0 };
        return (order[rb] ?? 0) - (order[ra] ?? 0);
      }
      return b.acquiredAt - a.acquiredAt;
    });

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="ユニット一覧" />

      {/* フィルター */}
      <div className="px-4 py-2 space-y-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {ELEMENTS.map(el => (
            <button
              key={el}
              onClick={() => setFilterElement(el)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                filterElement === el ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {ELEMENT_LABELS[el]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          {RARITIES.map(r => (
            <button
              key={r}
              onClick={() => setFilterRarity(r)}
              className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold transition-colors ${
                filterRarity === r ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {r === 'all' ? '全' : r}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {(['acquired', 'level', 'rarity'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {s === 'acquired' ? '取得順' : s === 'level' ? 'Lv順' : 'レア順'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-xs">{filtered.length} / {ownedUnits.length} 体</p>
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
            <p className="text-4xl mb-2">👥</p>
            <p>条件に合うユニットがいません</p>
          </div>
        )}
      </div>
    </div>
  );
};
