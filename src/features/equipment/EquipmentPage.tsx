import { useState } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { useEquipmentStore, EXP_PER_LEVEL } from '../../stores/equipmentStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { UNIT_MASTER } from '../../data/units';
import {
  calcEquipmentStats, getEquipmentMaster,
  getEffectiveMaxLevel, EVOLVE_MATERIALS, EVOLVE_GOLD_COST, MAX_EVOLVE_RANK,
} from '../../data/equipments';
import { getItemMaster } from '../../data/items';
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
  const { ownedEquipments, sellEquipment, equipToUnit, unequipEquipment, levelUpEquipment, evolveEquipment } = useEquipmentStore();
  const { ownedUnits } = useUnitStore();
  const { player, spendGold, items, useItem } = usePlayerStore();
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
                        <p className="text-white font-bold text-sm">
                          {master.name}
                          {evolveRank > 0 && <span className="text-yellow-400 ml-1">+{evolveRank}</span>}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs">{SLOT_LABEL[master.slot]} · Lv{eq.level}/{effectiveMax}</p>
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
                  {selectedEq?.instanceId === eq.instanceId && (() => {
                    const enhanceCost = eq.level * 150;
                    const isMaxLevel = eq.level >= effectiveMax;
                    const canAfford = player.gold >= enhanceCost;
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
                              onClick={() => {
                                sellEquipment(eq.instanceId);
                                setSelectedEq(null);
                                showToast('売却しました');
                              }}>
                              売却
                            </GameButton>
                          )}
                        </div>
                        {/* 強化ボタン */}
                        <button
                          disabled={isMaxLevel || !canAfford}
                          onClick={() => {
                            if (isMaxLevel || !canAfford) return;
                            spendGold(enhanceCost);
                            levelUpEquipment(eq.instanceId, EXP_PER_LEVEL(eq.level));
                            showToast(`強化しました！ (Lv${eq.level + 1})`);
                            setSelectedEq(null);
                          }}
                          className="w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                          style={{
                            background: isMaxLevel
                              ? 'rgba(55,65,81,0.3)'
                              : canAfford
                              ? 'linear-gradient(135deg, rgba(245,158,11,0.4), rgba(180,83,9,0.4))'
                              : 'rgba(55,65,81,0.3)',
                            border: isMaxLevel
                              ? '1px solid rgba(75,85,99,0.3)'
                              : canAfford
                              ? '1px solid rgba(245,158,11,0.5)'
                              : '1px solid rgba(75,85,99,0.3)',
                            color: isMaxLevel ? '#6b7280' : canAfford ? '#fbbf24' : '#6b7280',
                          }}>
                          {isMaxLevel
                            ? canEvolveMore ? '最大Lv到達！進化できます' : '最大Lvです'
                            : `⬆️ 強化 (🪙 ${enhanceCost.toLocaleString()} / 所持: ${player.gold.toLocaleString()})`}
                        </button>
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
                    <GameButton variant="primary" size="sm" className="ml-auto"
                      onClick={() => handleEquip(unit.instanceId)}>
                      装備する
                    </GameButton>
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
