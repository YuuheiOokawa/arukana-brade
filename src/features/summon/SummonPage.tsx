import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUMMON_POOLS } from '../../data/summons';
import { UNIT_MASTER } from '../../data/units';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { TopBar } from '../../components/layout/TopBar';
import type { SummonPool, RarityType, UnitMaster } from '../../types';

interface SummonResult {
  units: UnitMaster[];
  isNew: boolean[];
}

const performSummon = (pool: SummonPool, count: number): UnitMaster[] => {
  const results: UnitMaster[] = [];
  for (let i = 0; i < count; i++) {
    let rand = Math.random();
    let rarity: RarityType = 'N';
    const sortedRates = [...pool.rates].sort((a, b) => a.rate - b.rate);

    // 10連最後はSR以上保証
    const forceHighRarity = count === 10 && i === 9;
    if (forceHighRarity) {
      const srRates = pool.rates.filter(r => r.rarity === 'SSR' || r.rarity === 'SR');
      const totalSR = srRates.reduce((acc, r) => acc + r.rate, 0);
      rand = Math.random() * totalSR;
      let cum = 0;
      for (const rate of srRates) {
        cum += rate.rate;
        if (rand <= cum && rate.unitIds.length > 0) {
          rarity = rate.rarity;
          break;
        }
      }
    } else {
      let cum = 0;
      for (const rate of sortedRates.reverse()) {
        cum += rate.rate;
        if (rand <= cum) { rarity = rate.rarity; break; }
      }
    }

    const rarityPool = pool.rates.find(r => r.rarity === rarity);
    if (!rarityPool || rarityPool.unitIds.length === 0) {
      // フォールバック
      const fallback = UNIT_MASTER.filter(u => u.rarity === 'N');
      results.push(fallback[Math.floor(Math.random() * fallback.length)]);
      continue;
    }
    const unitId = rarityPool.unitIds[Math.floor(Math.random() * rarityPool.unitIds.length)];
    const unit = UNIT_MASTER.find(u => u.id === unitId);
    if (unit) results.push(unit);
  }
  return results;
};

export const SummonPage = () => {
  const navigate = useNavigate();
  const { player, spendDiamond, useItem, items } = usePlayerStore();
  const { ownedUnits, addUnit } = useUnitStore();
  const { addDailyProgress } = useMissionStore();
  const [selectedPool, setSelectedPool] = useState(SUMMON_POOLS[0]);
  const [result, setResult] = useState<SummonResult | null>(null);
  const [animating, setAnimating] = useState(false);

  const ticketCount = items.find(i => i.itemId === 'item_summon_ticket')?.quantity ?? 0;

  const doSummon = (count: number, useTicket = false) => {
    if (animating) return;
    if (useTicket) {
      if (ticketCount < count) { alert('チケットが足りません'); return; }
      useItem('item_summon_ticket', count);
    } else {
      const cost = count === 1 ? selectedPool.cost1 : selectedPool.cost10;
      const ok = spendDiamond(cost);
      if (!ok) { alert('ダイヤが足りません'); return; }
    }

    setAnimating(true);
    setTimeout(() => {
      const summonedMasters = performSummon(selectedPool, count);
      const ownedMasterIds = new Set(ownedUnits.map(u => u.masterId));
      const isNew = summonedMasters.map(m => !ownedMasterIds.has(m.id));
      summonedMasters.forEach(m => addUnit(m.id));
      addDailyProgress('summon');
      setResult({ units: summonedMasters, isNew });
      setAnimating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="召喚" />

      {/* 召喚台 選択 */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SUMMON_POOLS.map(pool => (
            <button
              key={pool.id}
              onClick={() => setSelectedPool(pool)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedPool.id === pool.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {pool.name}
            </button>
          ))}
        </div>
      </div>

      {/* 召喚台 詳細 */}
      <div className="px-4 mb-6">
        <div className="card-base overflow-hidden">
          <div className="h-32 flex flex-col items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #1e1065, #7c3aed)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, white 0%, transparent 60%)' }} />
            {selectedPool.banner && (
              <p className="relative z-10 text-yellow-400 font-bold text-sm mb-1">{selectedPool.banner}</p>
            )}
            <p className="relative z-10 text-white font-black text-xl">✨ {selectedPool.name}</p>
            <p className="relative z-10 text-purple-200 text-xs mt-1">{selectedPool.description}</p>
          </div>

          {/* 排出率 */}
          <div className="p-4">
            <h3 className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">排出率</h3>
            <div className="grid grid-cols-4 gap-2">
              {selectedPool.rates.map(rate => (
                <div key={rate.rarity} className={`text-center p-2 rounded-lg ${RARITY_BG[rate.rarity]}`}>
                  <p className="text-white font-black text-sm">{rate.rarity}</p>
                  <p className="text-white text-xs">{(rate.rate * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 召喚ボタン */}
      <div className="px-4 mb-6 space-y-3">
        <button
          onClick={() => doSummon(1)}
          disabled={animating}
          className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-98 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}
        >
          {animating ? '✨ 召喚中...' : `✨ 1回召喚 (💎 ${selectedPool.cost1})`}
        </button>
        <button
          onClick={() => doSummon(10)}
          disabled={animating}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-98 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#1a1100', boxShadow: '0 4px 20px rgba(245,158,11,0.5)' }}
        >
          {animating ? '✨ 召喚中...' : `🌟 10連召喚 (💎 ${selectedPool.cost10}) SR以上確定`}
        </button>
        {ticketCount > 0 && (
          <button
            onClick={() => doSummon(1, true)}
            disabled={animating}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-98 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #374151, #1f2937)', border: '1px solid #6b7280' }}
          >
            🎫 チケット召喚 × {ticketCount}枚所持
          </button>
        )}
        <p className="text-center text-gray-500 text-xs">所持ダイヤ: 💎 {player.diamond}</p>
      </div>

      {/* 演出アニメーション */}
      {animating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #7c3aed55, #0a0a1a)' }}>
          <div className="text-center animate-pulse">
            <p className="text-8xl mb-4">✨</p>
            <p className="text-white font-black text-2xl">召喚中...</p>
          </div>
        </div>
      )}

      {/* 召喚結果 */}
      {result && !animating && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-white font-black text-xl">召喚結果</h2>
            <button onClick={() => setResult(null)} className="text-gray-400 text-xl border border-gray-700 px-3 py-1 rounded-lg text-sm">
              閉じる
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              {result.units.map((unit, i) => (
                <div
                  key={i}
                  className={`card-base p-3 animate-slide-up text-center ${result.isNew[i] ? 'border-yellow-500/60' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {result.isNew[i] && (
                    <p className="text-yellow-400 text-xs font-black mb-1">NEW!</p>
                  )}
                  <div className="h-16 flex items-center justify-center text-4xl mb-2 rounded-lg"
                    style={{ background: elementGradient(unit.element) }}>
                    {unit.emoji}
                  </div>
                  <div className="flex justify-center gap-1 mb-1">
                    <RarityBadge rarity={unit.rarity} size="sm" />
                    <ElementBadge element={unit.element} size="sm" />
                  </div>
                  <p className="text-white font-bold text-sm">{unit.name}</p>
                  <p className="text-gray-400 text-xs">{unit.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 pb-6 pt-2">
            <button onClick={() => { setResult(null); navigate('/units'); }}
              className="w-full btn-primary py-4 text-base">
              ユニット確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RARITY_BG: Record<string, string> = {
  SSR: 'bg-gradient-to-br from-amber-600 to-red-600',
  SR: 'bg-gradient-to-br from-purple-700 to-indigo-600',
  R: 'bg-gradient-to-br from-blue-700 to-cyan-600',
  N: 'bg-gradient-to-br from-gray-600 to-gray-500',
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
  return map[element] ?? '#1a1a35';
};
