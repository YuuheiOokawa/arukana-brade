import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePartyStore } from '../../stores/partyStore';
import { getUnitMaster } from '../../data/units';
import { UnitCard } from '../../components/ui/UnitCard';
import { TopBar } from '../../components/layout/TopBar';
import { getStarRarityOrder } from '../../data/rarityConfig';
import type { ElementType, StarRarity, OwnedUnit } from '../../types';

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

const releaseGold = (unit: OwnedUnit): number => {
  const master = getUnitMaster(unit.masterId);
  if (!master) return 0;
  const rarityMul: Record<string, number> = { '1': 1, '2': 2, '3': 5, '4': 10, '5': 20, '6': 40, '7': 80, 'CROWN': 200 };
  const mul = rarityMul[String(unit.currentRarity)] ?? 1;
  return Math.floor((unit.level * 50 + 100) * mul);
};

export const UnitsPage = () => {
  const navigate = useNavigate();
  const { ownedUnits } = useUnitStore();
  const { addGold } = usePlayerStore();
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterStar, setFilterStar] = useState<StarFilter>('all');
  const [sortBy, setSortBy] = useState<'acquired' | 'level' | 'rarity'>('acquired');
  const [releaseMode, setReleaseMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [actionUnit, setActionUnit] = useState<OwnedUnit | null>(null);

  const { setSlot, getActiveParty } = usePartyStore();
  const activeParty = getActiveParty();
  const isInParty = (instanceId: string) => activeParty.slots.includes(instanceId);
  const toggleParty = (unit: OwnedUnit) => {
    const slotIdx = activeParty.slots.findIndex(s => s === unit.instanceId);
    if (slotIdx !== -1) {
      setSlot(activeParty.id, slotIdx, null);
    } else {
      const emptySlot = activeParty.slots.findIndex(s => s === null);
      if (emptySlot !== -1) setSlot(activeParty.id, emptySlot, unit.instanceId);
    }
  };

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

  const toggleSelect = (id: string) => {
    const u = ownedUnits.find(u => u.instanceId === id);
    if (u?.isLocked) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalReleaseGold = Array.from(selected).reduce((sum, id) => {
    const u = ownedUnits.find(u => u.instanceId === id);
    return sum + (u ? releaseGold(u) : 0);
  }, 0);

  const doRelease = () => {
    const { ownedUnits: current } = useUnitStore.getState();
    const keep = current.filter(u => !selected.has(u.instanceId));
    useUnitStore.setState({ ownedUnits: keep });
    addGold(totalReleaseGold);
    setSelected(new Set());
    setReleaseMode(false);
    setConfirmRelease(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'radial-gradient(ellipse at 50% 0%, #12082a 0%, #080818 60%)' }}>
      <TopBar title="ユニット一覧" />

      {/* フィルター */}
      <div className="px-4 py-2 space-y-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {ELEMENTS.map(el => (
            <button key={el} onClick={() => setFilterElement(el)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                filterElement === el ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-400'
              }`}>
              {ELEMENT_LABELS[el]}
            </button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {STAR_FILTERS.map(f => (
            <button key={String(f)} onClick={() => setFilterStar(f)}
              className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold transition-colors ${
                filterStar === f ? 'bg-yellow-600 text-white' : 'bg-gray-800/70 text-gray-400'
              }`}>
              {starFilterLabel(f)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs">{filtered.length} / {ownedUnits.length} 体</p>
          <div className="flex gap-1 items-center">
            {(['acquired', 'level', 'rarity'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-800/70 text-gray-400'
                }`}>
                {s === 'acquired' ? '取得順' : s === 'level' ? 'Lv順' : 'レア順'}
              </button>
            ))}
            <button
              onClick={() => { setReleaseMode(r => !r); setSelected(new Set()); }}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                releaseMode ? 'bg-red-700 text-white' : 'bg-gray-800/70 text-red-400'
              }`}>
              {releaseMode ? 'キャンセル' : '解放'}
            </button>
          </div>
        </div>

        {releaseMode && (
          <div className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div>
              <p className="text-red-400 text-xs font-bold">解放モード：ロックされていないユニットを選択</p>
              <p className="text-yellow-400 text-xs">{selected.size}体選択 → 🪙 {totalReleaseGold.toLocaleString()} G</p>
            </div>
            {selected.size > 0 && (
              <button onClick={() => setConfirmRelease(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                解放する
              </button>
            )}
          </div>
        )}
      </div>

      {/* ユニット一覧 */}
      <div className="px-4 grid grid-cols-1 gap-2">
        {filtered.map(unit => {
          const isSelected = selected.has(unit.instanceId);
          return (
            <div key={unit.instanceId} className="relative"
              onClick={() => releaseMode ? toggleSelect(unit.instanceId) : setActionUnit(unit)}>
              {releaseMode && (
                <div className="absolute inset-0 z-10 rounded-xl pointer-events-none transition-all"
                  style={{
                    border: isSelected ? '2px solid #ef4444' : unit.isLocked ? '2px solid #374151' : '2px solid transparent',
                    background: isSelected ? 'rgba(239,68,68,0.15)' : 'transparent',
                  }}>
                  {isSelected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-black">✓</div>}
                  {unit.isLocked && <div className="absolute top-2 right-2 text-xs">🔒</div>}
                </div>
              )}
              <UnitCard unit={unit} onClick={() => {}} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>条件に合うユニットがいません</p>
          </div>
        )}
      </div>

      {/* ユニットアクションシート */}
      {actionUnit && !releaseMode && (() => {
        const master = getUnitMaster(actionUnit.masterId);
        const inParty = isInParty(actionUnit.instanceId);
        const partyFull = activeParty.slots.filter(Boolean).length >= 5;
        return (
          <div className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setActionUnit(null)}>
            <div className="w-full max-w-lg mx-auto rounded-t-2xl px-5 pt-4"
              style={{
                background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
                border: '1px solid rgba(139,92,246,0.4)',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              {master && (
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="text-2xl">{master.emoji}</span>
                  <div>
                    <p className="text-white font-bold">{master.name}</p>
                    <p className="text-gray-400 text-xs">Lv.{actionUnit.level} · {master.title}</p>
                  </div>
                  {inParty && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(124,58,237,0.4)', color: '#c4b5fd' }}>
                      編成中
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => { toggleParty(actionUnit); setActionUnit(null); }}
                  disabled={!inParty && partyFull}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: inParty
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(185,28,28,0.3))'
                      : partyFull
                      ? 'rgba(55,65,81,0.4)'
                      : 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(79,70,229,0.5))',
                    border: inParty
                      ? '1px solid rgba(239,68,68,0.5)'
                      : '1px solid rgba(139,92,246,0.5)',
                    color: inParty ? '#fca5a5' : partyFull ? '#6b7280' : '#c4b5fd',
                  }}>
                  {inParty ? '⚔️ パーティから外す' : partyFull ? 'パーティが満員です' : '⚔️ パーティに追加'}
                </button>
                <button
                  onClick={() => { navigate(`/units/${actionUnit.instanceId}`); setActionUnit(null); }}
                  className="w-full py-3 rounded-xl font-bold text-sm text-gray-300 transition-all active:scale-95"
                  style={{ background: 'rgba(40,30,60,0.6)', border: '1px solid rgba(100,80,140,0.3)' }}>
                  詳細を見る
                </button>
                <button
                  onClick={() => setActionUnit(null)}
                  className="w-full py-2.5 rounded-xl text-sm text-gray-500 transition-all">
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 解放確認モーダル */}
      {confirmRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#1a0a2e', border: '1px solid rgba(239,68,68,0.4)' }}>
            <h2 className="text-red-400 font-black text-lg mb-2">本当に解放しますか？</h2>
            <p className="text-gray-300 text-sm mb-1">{selected.size}体のユニットを解放します</p>
            <p className="text-yellow-400 font-bold mb-4">🪙 {totalReleaseGold.toLocaleString()} G 獲得</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRelease(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-300"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                キャンセル
              </button>
              <button onClick={doRelease}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                解放する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
