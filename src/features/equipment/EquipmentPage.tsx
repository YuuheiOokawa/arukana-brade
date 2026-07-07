import { useState } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { UNIT_MASTER } from '../../data/units';
import {
  calcEquipmentStats, getEquipmentMaster,
  getEffectiveMaxLevel, EVOLVE_MATERIALS, EVOLVE_GOLD_COST, MAX_EVOLVE_RANK,
  calcEquipSellPrice,
} from '../../data/equipments';
import { getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import { elementGradient } from '../../utils/elementUtils';
import { ELEMENT_NAMES } from '../../types';
import type { EquipmentSlot, EquipmentRarity, OwnedEquipment } from '../../types';

const RARITY_COLOR: Record<EquipmentRarity, string> = {
  N:   '#6b7280',
  R:   '#3b82f6',
  SR:  '#7c3aed',
  SSR: '#f59e0b',
};

const RARITY_ORDER: Record<EquipmentRarity, number> = { SSR: 3, SR: 2, R: 1, N: 0 };
const SLOT_ORDER: Record<EquipmentSlot, number> = { weapon: 0, armor: 1, accessory: 2 };

const ELEMENT_BADGE_COLOR: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: '⚔️ 武器', armor: '🛡️ 防具', accessory: '💍 アクセサリー',
};

// 強化コスト: レベル×150G。fromLevel から n レベル分の合計
const costForLevels = (fromLevel: number, n: number): number => {
  let total = 0;
  for (let i = 0; i < n; i++) total += (fromLevel + i) * 150;
  return total;
};

type TabType = 'list' | 'equip';
type SortType = 'rarity' | 'level' | 'slot';

export const EquipmentPage = () => {
  const { ownedEquipments, sellEquipment, equipToUnit, unequipEquipment, levelUpEquipmentBy, evolveEquipment } = useEquipmentStore();
  const { ownedUnits } = useUnitStore();
  const { player, spendGold, addGold, items, useItem } = usePlayerStore();
  const [tab, setTab] = useState<TabType>('list');
  const [selectedEq, setSelectedEq] = useState<OwnedEquipment | null>(null);
  const [filterSlot, setFilterSlot] = useState<EquipmentSlot | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortType>('rarity');
  const [toast, setToast] = useState('');
  const [sellConfirm, setSellConfirm] = useState<OwnedEquipment | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const filtered = ownedEquipments
    .filter(eq => {
      const m = getEquipmentMaster(eq.masterId);
      return m && (filterSlot === 'all' || m.slot === filterSlot);
    })
    .sort((a, b) => {
      const ma = getEquipmentMaster(a.masterId);
      const mb = getEquipmentMaster(b.masterId);
      if (!ma || !mb) return 0;
      if (sortBy === 'level') return b.level - a.level || RARITY_ORDER[mb.rarity] - RARITY_ORDER[ma.rarity];
      if (sortBy === 'slot') return SLOT_ORDER[ma.slot] - SLOT_ORDER[mb.slot] || RARITY_ORDER[mb.rarity] - RARITY_ORDER[ma.rarity];
      return RARITY_ORDER[mb.rarity] - RARITY_ORDER[ma.rarity] || b.level - a.level;
    });

  const sellPriceOf = (eq: OwnedEquipment): number => {
    const m = getEquipmentMaster(eq.masterId);
    return m ? calcEquipSellPrice(m, eq.level, eq.evolveRank ?? 0) : 0;
  };

  const bulkTotal = Array.from(bulkSelected).reduce((sum, id) => {
    const eq = ownedEquipments.find(e => e.instanceId === id);
    return sum + (eq ? sellPriceOf(eq) : 0);
  }, 0);

  const toggleBulkSelect = (eq: OwnedEquipment) => {
    if (eq.equippedTo) return; // 装備中は選択不可
    setBulkSelected(prev => {
      const next = new Set(prev);
      next.has(eq.instanceId) ? next.delete(eq.instanceId) : next.add(eq.instanceId);
      return next;
    });
  };

  const handleSell = (eq: OwnedEquipment) => {
    const m = getEquipmentMaster(eq.masterId);
    const price = sellPriceOf(eq);
    if (!sellEquipment(eq.instanceId)) { showToast('売却できませんでした'); return; }
    addGold(price);
    showToast(`🪙 ${m?.name ?? '装備'} を ${price.toLocaleString()} G で売却！`);
    setSellConfirm(null);
    setSelectedEq(null);
  };

  const handleBulkSell = () => {
    let total = 0;
    let count = 0;
    bulkSelected.forEach(id => {
      const eq = ownedEquipments.find(e => e.instanceId === id);
      if (!eq || eq.equippedTo) return;
      const price = sellPriceOf(eq);
      if (sellEquipment(id)) { total += price; count++; }
    });
    addGold(total);
    showToast(`🪙 ${count}個の装備を ${total.toLocaleString()} G で売却！`);
    setBulkSelected(new Set());
    setBulkMode(false);
    setBulkConfirm(false);
  };

  const handleEquip = (unitInstanceId: string) => {
    if (!selectedEq) return;
    const master = getEquipmentMaster(selectedEq.masterId);
    if (!master) return;
    // 属性専用装備のチェック
    if (master.requiredElement) {
      const unit = ownedUnits.find(u => u.instanceId === unitInstanceId);
      const um = unit ? UNIT_MASTER.find(m => m.id === unit.masterId) : null;
      if (um && um.element !== master.requiredElement) {
        showToast(`⚠️ この装備は${ELEMENT_NAMES[master.requiredElement]}属性専用です`);
        return;
      }
    }
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
          <div className="px-4 mb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'weapon', 'armor', 'accessory'] as const).map(s => (
              <button key={s} onClick={() => setFilterSlot(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterSlot === s ? 'tab-active' : 'tab-inactive'}`}>
                {s === 'all' ? '全て' : SLOT_LABEL[s]}
              </button>
            ))}
          </div>

          {/* ソート + 一括売却 */}
          <div className="px-4 mb-3 flex items-center justify-between">
            <div className="flex gap-1">
              {([['rarity', 'レア順'], ['level', 'Lv順'], ['slot', '部位順']] as const).map(([s, label]) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-800/70 text-gray-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); setSelectedEq(null); }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                bulkMode ? 'bg-red-700 text-white' : 'bg-gray-800/70 text-yellow-500'
              }`}>
              {bulkMode ? 'キャンセル' : '一括売却'}
            </button>
          </div>

          {/* 一括売却バー */}
          {bulkMode && (
            <div className="mx-4 mb-3 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div>
                <p className="text-yellow-400 text-xs font-bold">一括売却モード：未装備の装備を選択</p>
                <p className="text-yellow-300 text-xs">{bulkSelected.size}個選択 → 🪙 {bulkTotal.toLocaleString()} G</p>
              </div>
              {bulkSelected.size > 0 && (
                <button onClick={() => setBulkConfirm(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                  売却する
                </button>
              )}
            </div>
          )}

          {/* 装備一覧 */}
          <div className="px-4 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🗡️</p>
                <p className="text-gray-500">装備がありません</p>
                <p className="text-gray-600 text-sm mt-1">イベント「⚒️ 武具の試練場」やワールドボスから入手しよう</p>
                <p className="text-gray-600 text-xs mt-1">プレゼントボックスの「冒険者の装備一式」もチェック！</p>
              </div>
            )}
            {filtered.map(eq => {
              const master = getEquipmentMaster(eq.masterId);
              if (!master) return null;
              const evolveRank = eq.evolveRank ?? 0;
              const stats = calcEquipmentStats(master, eq.level, evolveRank);
              const effectiveMax = getEffectiveMaxLevel(master, evolveRank);
              const equippedUnit = eq.equippedTo ? ownedUnits.find(u => u.instanceId === eq.equippedTo) : null;
              const equippedMaster = equippedUnit ? UNIT_MASTER.find(m => m.id === equippedUnit.masterId) : null;

              const isBulkSelected = bulkSelected.has(eq.instanceId);
              return (
                <div key={eq.instanceId}
                  className={`card-base p-3.5 cursor-pointer unit-card-hover ${
                    selectedEq?.instanceId === eq.instanceId ? 'border-yellow-500/60' : ''
                  } ${isBulkSelected ? 'border-red-500/70' : ''} ${bulkMode && eq.equippedTo ? 'opacity-40' : ''}`}
                  style={isBulkSelected ? { background: 'rgba(239,68,68,0.08)' } : undefined}
                  onClick={() => bulkMode
                    ? toggleBulkSelect(eq)
                    : setSelectedEq(prev => prev?.instanceId === eq.instanceId ? null : eq)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative"
                      style={{ background: `${RARITY_COLOR[master.rarity]}22`, border: `1px solid ${RARITY_COLOR[master.rarity]}44` }}>
                      {master.emoji}
                      {isBulkSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-black">✓</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-black px-1.5 rounded"
                          style={{ background: `${RARITY_COLOR[master.rarity]}33`, color: RARITY_COLOR[master.rarity] }}>
                          {master.rarity}
                        </span>
                        {master.requiredElement && (
                          <span className="text-[9px] font-bold px-1 rounded"
                            style={{
                              background: `${ELEMENT_BADGE_COLOR[master.requiredElement]}22`,
                              border: `1px solid ${ELEMENT_BADGE_COLOR[master.requiredElement]}55`,
                              color: ELEMENT_BADGE_COLOR[master.requiredElement],
                            }}>
                            {ELEMENT_NAMES[master.requiredElement]}専用
                          </span>
                        )}
                        <p className="text-white font-bold text-sm">
                          {master.name}
                          {evolveRank > 0 && <span className="text-yellow-400 ml-1">+{evolveRank}</span>}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs">{SLOT_LABEL[master.slot]} · Lv{eq.level}/{effectiveMax} · 売却 🪙{sellPriceOf(eq).toLocaleString()}</p>
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
                  {selectedEq?.instanceId === eq.instanceId && !bulkMode && (() => {
                    const isMaxLevel = eq.level >= effectiveMax;
                    const levelsToMax = effectiveMax - eq.level;
                    // +1 / +5 / MAX（所持ゴールドで可能な範囲）の強化プラン
                    const plans = [1, 5].map(n => {
                      const lv = Math.min(n, levelsToMax);
                      return { label: `+${n}`, levels: lv, cost: costForLevels(eq.level, lv) };
                    });
                    const maxAffordable = (() => {
                      let g = player.gold, lv = eq.level, n = 0;
                      while (n < levelsToMax && g >= lv * 150) { g -= lv * 150; lv++; n++; }
                      return n;
                    })();
                    const maxPlan = { label: 'MAX', levels: maxAffordable, cost: costForLevels(eq.level, maxAffordable) };
                    const doEnhance = (levels: number, cost: number) => {
                      if (levels <= 0 || player.gold < cost) return;
                      spendGold(cost);
                      levelUpEquipmentBy(eq.instanceId, levels);
                      showToast(`⬆️ Lv${eq.level + levels} に強化！ (🪙 ${cost.toLocaleString()})`);
                      setSelectedEq(null);
                    };
                    const canEvolveMore = evolveRank < MAX_EVOLVE_RANK;
                    const evolveMats = EVOLVE_MATERIALS[master.rarity] ?? [];
                    const evolveGold = EVOLVE_GOLD_COST[master.rarity] ?? 0;
                    const hasMats = evolveMats.every(mat =>
                      (items.find(i => i.itemId === mat.itemId)?.quantity ?? 0) >= mat.quantity);
                    const hasEvolveGold = player.gold >= evolveGold;
                    const handleEvolve = () => {
                      if (!isMaxLevel || !canEvolveMore || !hasMats || !hasEvolveGold) return;
                      // evolveEquipment 成功後に素材・ゴールドを消費（失敗時の素材消滅を防ぐ）
                      const ok = evolveEquipment(eq.instanceId);
                      if (!ok) { showToast('進化できませんでした'); return; }
                      evolveMats.forEach(mat => useItem(mat.itemId, mat.quantity));
                      spendGold(evolveGold);
                      showToast(`✨ ${master.name} +${evolveRank + 1} に進化！`);
                      setSelectedEq(null);
                    };
                    return (
                      <div className="mt-3 pt-3 border-t border-gray-700/40 space-y-2" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <GameButton variant="primary" size="sm" fullWidth
                            onClick={() => setTab('equip')}>
                            ユニットに装備
                          </GameButton>
                          {eq.equippedTo ? (
                            <GameButton variant="secondary" size="sm"
                              onClick={() => {
                                unequipEquipment(eq.instanceId);
                                setSelectedEq(null);
                                showToast('装備を外しました');
                              }}>
                              外す
                            </GameButton>
                          ) : (
                            <GameButton variant="secondary" size="sm"
                              onClick={() => setSellConfirm(eq)}>
                              売却
                            </GameButton>
                          )}
                        </div>
                        {/* 強化ボタン (+1 / +5 / MAX) */}
                        {isMaxLevel ? (
                          <div className="w-full py-2 rounded-xl text-xs font-bold text-center"
                            style={{ background: 'rgba(55,65,81,0.3)', border: '1px solid rgba(75,85,99,0.3)', color: '#9ca3af' }}>
                            {canEvolveMore ? '⭐ 最大Lv到達！進化できます' : '⭐ 最大Lvです'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1.5">
                            {[...plans, maxPlan].map(plan => {
                              const disabled = plan.levels <= 0 || player.gold < plan.cost;
                              return (
                                <button key={plan.label}
                                  disabled={disabled}
                                  onClick={() => doEnhance(plan.levels, plan.cost)}
                                  className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                  style={{
                                    background: disabled ? 'rgba(55,65,81,0.3)' : 'linear-gradient(135deg, rgba(245,158,11,0.4), rgba(180,83,9,0.4))',
                                    border: disabled ? '1px solid rgba(75,85,99,0.3)' : '1px solid rgba(245,158,11,0.5)',
                                    color: disabled ? '#6b7280' : '#fbbf24',
                                  }}>
                                  <span className="block font-black">⬆️ {plan.label}{plan.label === 'MAX' && plan.levels > 0 ? ` (+${plan.levels})` : ''}</span>
                                  <span className="block text-[9px] mt-0.5">🪙 {plan.cost.toLocaleString()}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {/* 進化ボタン: 最大レベル到達で解放 */}
                        {isMaxLevel && canEvolveMore && (
                          <div className="rounded-xl p-3 space-y-2"
                            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
                            <p className="text-purple-300 text-xs font-bold">
                              ✨ 進化 +{evolveRank + 1}（ステータス+30% / Lv上限+10）
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {evolveMats.map(mat => {
                                const owned = items.find(i => i.itemId === mat.itemId)?.quantity ?? 0;
                                const im = getItemMaster(mat.itemId);
                                const enough = owned >= mat.quantity;
                                return (
                                  <span key={mat.itemId} className="text-[10px] px-2 py-1 rounded-lg font-bold"
                                    style={{
                                      background: enough ? 'rgba(52,211,153,0.12)' : 'rgba(220,38,38,0.12)',
                                      border: `1px solid ${enough ? 'rgba(52,211,153,0.35)' : 'rgba(220,38,38,0.35)'}`,
                                      color: enough ? '#6ee7b7' : '#fca5a5',
                                    }}>
                                    {im?.emoji} {im?.name} {owned}/{mat.quantity}
                                  </span>
                                );
                              })}
                              <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                                style={{
                                  background: hasEvolveGold ? 'rgba(240,192,64,0.12)' : 'rgba(220,38,38,0.12)',
                                  border: `1px solid ${hasEvolveGold ? 'rgba(240,192,64,0.35)' : 'rgba(220,38,38,0.35)'}`,
                                  color: hasEvolveGold ? '#fbbf24' : '#fca5a5',
                                }}>
                                🪙 {evolveGold.toLocaleString()}
                              </span>
                            </div>
                            <button
                              disabled={!hasMats || !hasEvolveGold}
                              onClick={handleEvolve}
                              className="w-full py-2.5 rounded-xl text-xs font-black transition-all active:scale-95"
                              style={{
                                background: hasMats && hasEvolveGold
                                  ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                                  : 'rgba(55,65,81,0.3)',
                                border: hasMats && hasEvolveGold
                                  ? '1px solid rgba(167,139,250,0.6)'
                                  : '1px solid rgba(75,85,99,0.3)',
                                color: hasMats && hasEvolveGold ? '#fff' : '#6b7280',
                                boxShadow: hasMats && hasEvolveGold ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                              }}>
                              {hasMats && hasEvolveGold ? `✨ 進化する（+${evolveRank} → +${evolveRank + 1}）` : '素材またはゴールドが不足'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
            const selectedEqMaster = selectedEq ? getEquipmentMaster(selectedEq.masterId) : null;
            const elementMismatch = !!selectedEqMaster?.requiredElement && master.element !== selectedEqMaster.requiredElement;

            return (
              <div key={unit.instanceId} className="card-base p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: elementGradient(master.element) }}>
                    {master.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{master.name}</p>
                    <p className="text-gray-500 text-xs">
                      Lv {unit.level} · 覚醒{unit.awakenRank} ·
                      <span style={{ color: ELEMENT_BADGE_COLOR[master.element] }}> {ELEMENT_NAMES[master.element]}属性</span>
                    </p>
                  </div>
                  {selectedEq && (
                    elementMismatch ? (
                      <span className="ml-auto flex-shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>
                        属性不一致
                      </span>
                    ) : (
                      <GameButton variant="primary" size="sm" className="ml-auto"
                        onClick={() => handleEquip(unit.instanceId)}>
                        装備する
                      </GameButton>
                    )
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

      {/* 売却確認モーダル */}
      {sellConfirm && (() => {
        const m = getEquipmentMaster(sellConfirm.masterId);
        const price = sellPriceOf(sellConfirm);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={e => { if (e.target === e.currentTarget) setSellConfirm(null); }}>
            <div className="rounded-2xl p-5 w-full max-w-sm" style={{ background: '#1a0a2e', border: '1px solid rgba(245,158,11,0.4)' }}>
              <h2 className="text-yellow-400 font-black text-lg mb-3">装備を売却しますか？</h2>
              <div className="flex items-center gap-3 mb-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-2xl">{m?.emoji}</span>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {m?.name}{(sellConfirm.evolveRank ?? 0) > 0 && <span className="text-yellow-400"> +{sellConfirm.evolveRank}</span>}
                  </p>
                  <p className="text-gray-500 text-xs">Lv{sellConfirm.level} · {m?.rarity}</p>
                </div>
              </div>
              <p className="text-yellow-400 font-black text-center text-lg mb-4">🪙 {price.toLocaleString()} G</p>
              <div className="flex gap-3">
                <button onClick={() => setSellConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-300"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  キャンセル
                </button>
                <button onClick={() => handleSell(sellConfirm)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                  売却する
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 一括売却確認モーダル */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setBulkConfirm(false); }}>
          <div className="rounded-2xl p-5 w-full max-w-sm" style={{ background: '#1a0a2e', border: '1px solid rgba(239,68,68,0.4)' }}>
            <h2 className="text-red-400 font-black text-lg mb-2">一括売却しますか？</h2>
            <p className="text-gray-300 text-sm mb-1">{bulkSelected.size}個の装備を売却します</p>
            <p className="text-yellow-400 font-bold mb-4">🪙 {bulkTotal.toLocaleString()} G 獲得</p>
            <div className="flex gap-3">
              <button onClick={() => setBulkConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-300"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                キャンセル
              </button>
              <button onClick={handleBulkSell}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                売却する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
