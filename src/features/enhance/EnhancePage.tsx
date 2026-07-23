import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { getUnitMaster } from '../../data/units';
import { getItemMaster } from '../../data/items';
import { UnitCard } from '../../components/ui/UnitCard';
import { GaugeBar } from '../../components/ui/game/GaugeBar';
import { GameButton } from '../../components/ui/game/GameButton';
import { TopBar } from '../../components/layout/TopBar';
import { formatNumber, calcTotalPower, getExpForLevel } from '../../utils/format';
import { getLevelCap, getStarDisplay, NEXT_RARITY, AWAKENING_CONFIG, EVOLUTION_MATERIALS, EVOLUTION_GOLD_COST } from '../../data/rarityConfig';
import { saveImmediately } from '../../lib/syncService';

export const EnhancePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initUnit = params.get('unit');
  const initTab = (params.get('tab') as 'level' | 'awaken') ?? 'level';

  const { ownedUnits, levelUpUnit, awakenUnit, incrementAwakeningCount, getAwakeningCrystalCount, rarityUp } = useUnitStore();
  const { items, useItem, player, spendGold } = usePlayerStore();
  const { addDailyProgress, addWeeklyProgress } = useMissionStore();
  const [selectedId, setSelectedId] = useState<string | null>(initUnit);
  const [tab, setTab] = useState<'level' | 'awaken'>(initTab);
  const [selectingUnit, setSelectingUnit] = useState(false);
  const [message, setMessage] = useState('');

  const unit = selectedId ? ownedUnits.find(u => u.instanceId === selectedId) : null;
  const master = unit ? (getUnitMaster(unit.masterId) ?? null) : null;

  const EXP_ITEMS = [
    { itemId: 'item_exp_s',  exp: 500,   label: '経験値の雫(小)' },
    { itemId: 'item_exp_m',  exp: 2000,  label: '経験値の雫(中)' },
    { itemId: 'item_exp_l',  exp: 8000,  label: '経験値の雫(大)' },
    { itemId: 'item_exp_xl', exp: 30000, label: '経験値の雫(特大)' },
  ];

  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLongPress = useCallback(() => {
    if (pressIntervalRef.current) { clearInterval(pressIntervalRef.current); pressIntervalRef.current = null; }
  }, []);

  const handleUseExpItem = useCallback((itemId: string, exp: number, silent = false) => {
    if (!selectedId) return;
    const freshUnit = useUnitStore.getState().ownedUnits.find(u => u.instanceId === selectedId);
    if (!freshUnit) return;
    if (freshUnit.level >= getLevelCap(freshUnit.currentRarity)) {
      stopLongPress();
      if (!silent) setMessage('MAX LEVEL！進化しましょう');
      return;
    }
    const ok = usePlayerStore.getState().useItem(itemId, 1);
    if (!ok) { stopLongPress(); if (!silent) setMessage('アイテムが足りません'); return; }
    levelUpUnit(freshUnit.instanceId, exp);
    addDailyProgress('enhance');
    addWeeklyProgress('enhance');
    if (!silent) { setMessage(`EXP +${exp.toLocaleString()} 獲得！`); setTimeout(() => setMessage(''), 2000); }
  }, [selectedId, levelUpUnit, addDailyProgress, addWeeklyProgress, stopLongPress]);

  const startLongPress = useCallback((itemId: string, exp: number) => {
    handleUseExpItem(itemId, exp, false);
    pressIntervalRef.current = setInterval(() => handleUseExpItem(itemId, exp, true), 150);
  }, [handleUseExpItem]);

  const handleAwaken = () => {
    if (!unit || !master) return;
    if (unit.awakenRank >= master.maxAwaken) { setMessage('最大覚醒済み'); return; }
    const mats = master.awakenMaterials ?? [];
    for (const mat of mats) {
      const owned = items.find(i => i.itemId === mat.itemId);
      if (!owned || owned.quantity < mat.quantity) {
        const item = getItemMaster(mat.itemId);
        setMessage(`素材不足: ${item?.name ?? mat.itemId} x${mat.quantity}`);
        return;
      }
    }
    // awakenUnit を先に試みて、成功後に素材を消費する
    // (逆順だと二重タップ等で awakenRank が上限を超えられないのに素材だけ2重に消費されるバグを防ぐ)
    const ok = awakenUnit(unit.instanceId);
    if (!ok) { setMessage('覚醒できませんでした'); return; }
    mats.forEach(mat => useItem(mat.itemId, mat.quantity));
    addDailyProgress('enhance');
    addWeeklyProgress('enhance');
    setMessage('覚醒成功！');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleCrystalAwaken = () => {
    if (!unit || !master) return;
    if ((unit.awakeningCount ?? 0) >= AWAKENING_CONFIG.maxAwakeningCount) { setMessage('覚醒結晶上限に達しています'); return; }
    const crystalCount = getAwakeningCrystalCount(unit.masterId);
    if (crystalCount <= 0) { setMessage(`${master.name}の覚醒結晶が足りません`); return; }
    const ok = incrementAwakeningCount(unit.instanceId);
    if (!ok) { setMessage('覚醒できませんでした'); return; }
    addDailyProgress('enhance');
    addWeeklyProgress('enhance');
    setMessage('💠 覚醒結晶で覚醒！');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRarityUp = () => {
    if (!unit) return;
    const lvCap = getLevelCap(unit.currentRarity);
    if (unit.level < lvCap) { setMessage(`Lv${lvCap}に達してから進化できます`); return; }
    const mats = EVOLUTION_MATERIALS[String(unit.currentRarity)] ?? [];
    const goldCost = EVOLUTION_GOLD_COST[String(unit.currentRarity)] ?? 0;
    for (const mat of mats) {
      const owned = items.find(i => i.itemId === mat.itemId);
      if (!owned || owned.quantity < mat.quantity) {
        setMessage(`素材不足: ${mat.label} ×${mat.quantity}`);
        setTimeout(() => setMessage(''), 2500);
        return;
      }
    }
    if (player.gold < goldCost) {
      setMessage(`ゴールド不足: ${goldCost.toLocaleString()} G 必要`);
      setTimeout(() => setMessage(''), 2500);
      return;
    }
    // rarityUp を先に試みて、成功後に素材・ゴールドを消費する
    // (逆順だと rarityUp 失敗時に素材が消滅するバグを防ぐ)
    const nextR = NEXT_RARITY[String(unit.currentRarity)];
    const ok = rarityUp(unit.instanceId);
    if (!ok) { setMessage('進化できません'); return; }
    for (const mat of mats) useItem(mat.itemId, mat.quantity);
    spendGold(goldCost);
    addDailyProgress('enhance');
    addWeeklyProgress('enhance');
    // この操作に関わる状態更新がすべて終わってから保存する
    // (以前は addDailyProgress/addWeeklyProgress より前に呼んでいたため、
    //  即時保存に間に合わずミッション進捗がデバウンス保存待ちになっていた)
    saveImmediately();
    setMessage(`✨ ${getStarDisplay(nextR!)} に進化！`);
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="ユニット強化" onBack={() => navigate(-1)} />

      {/* ユニット選択 */}
      <div className="px-4 mb-4">
        {unit ? (
          <div onClick={() => setSelectingUnit(true)} className="cursor-pointer">
            <UnitCard unit={unit} />
          </div>
        ) : (
          <button onClick={() => setSelectingUnit(true)}
            className="w-full card-base p-6 text-center border-dashed border-gray-600 hover:border-purple-500">
            <p className="text-3xl mb-2">+</p>
            <p className="text-gray-400">強化するユニットを選択</p>
          </button>
        )}
      </div>

      {/* タブ */}
      {unit && master && (
        <>
          <div className="px-4 flex gap-2 mb-4">
            <button onClick={() => setTab('level')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${tab === 'level' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              レベル強化
            </button>
            <button onClick={() => setTab('awaken')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${tab === 'awaken' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              覚醒ランクアップ
            </button>
          </div>

          {message && (
            <div className="mx-4 mb-3 bg-purple-900/60 border border-purple-700 rounded-lg px-3 py-2 text-center text-purple-200 text-sm animate-slide-up">
              {message}
            </div>
          )}

          {tab === 'level' ? (
            <div className="px-4 space-y-4">
              {/* 現在のレベル */}
              <div className="card-base p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 font-bold">現在のレベル</span>
                  <span className="text-white font-black text-xl">{unit.level} <span className="text-gray-400 text-sm font-normal">/ {getLevelCap(unit.currentRarity)}</span></span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{getStarDisplay(unit.currentRarity)} レアリティ</p>
                {unit.level < getLevelCap(unit.currentRarity) && (
                  <GaugeBar type="exp" value={unit.exp} max={getExpForLevel(unit.level)} />
                )}
                {unit.level >= getLevelCap(unit.currentRarity) && unit.currentRarity !== 'CROWN' && (
                  <p className="text-yellow-400 text-sm mt-1 font-bold">MAX LEVEL！進化可能 ▼</p>
                )}
                {unit.currentRarity === 'CROWN' && unit.level >= getLevelCap(unit.currentRarity) && (
                  <p className="text-yellow-400 text-sm mt-1">★👑 MAX LEVEL！</p>
                )}
              </div>

              {/* 進化セクション */}
              {unit.level >= getLevelCap(unit.currentRarity) && unit.currentRarity !== 'CROWN' && (
                <div className="card-base p-4 border border-yellow-700/40" style={{ background: 'linear-gradient(135deg, rgba(120,80,0,0.3), rgba(40,20,0,0.4))' }}>
                  <h3 className="text-yellow-400 font-bold text-sm mb-3">✨ 進化</h3>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-lg font-black" style={{ color: '#ffe48d' }}>{getStarDisplay(unit.currentRarity)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-lg font-black text-yellow-400">
                      {getStarDisplay(NEXT_RARITY[String(unit.currentRarity)]!)}
                    </span>
                  </div>
                  {/* 必要素材 */}
                  <div className="space-y-1.5 mb-3">
                    {(EVOLUTION_MATERIALS[String(unit.currentRarity)] ?? []).map(mat => {
                      const owned = items.find(i => i.itemId === mat.itemId)?.quantity ?? 0;
                      const enough = owned >= mat.quantity;
                      const itemMaster = getItemMaster(mat.itemId);
                      return (
                        <div key={mat.itemId} className="flex items-center gap-2 text-sm">
                          <span className="text-base">{itemMaster?.emoji ?? '🔷'}</span>
                          <span className="flex-1 text-gray-300 text-xs">{mat.label}</span>
                          <span className={`text-xs font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
                            {owned}/{mat.quantity} {enough ? '✓' : '✗'}
                          </span>
                        </div>
                      );
                    })}
                    {/* ゴールドコスト */}
                    {(() => {
                      const cost = EVOLUTION_GOLD_COST[String(unit.currentRarity)] ?? 0;
                      const enough = player.gold >= cost;
                      return (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-base">🪙</span>
                          <span className="flex-1 text-gray-300 text-xs">ゴールド</span>
                          <span className={`text-xs font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
                            {player.gold.toLocaleString()}/{cost.toLocaleString()} {enough ? '✓' : '✗'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <GameButton variant="gold" fullWidth onClick={handleRarityUp}>
                    進化する
                  </GameButton>
                </div>
              )}

              {/* 現在のステータス */}
              <div className="card-base p-4">
                <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">現在のステータス</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'HP', value: unit.currentStats.hp, icon: '❤️', color: 'text-green-400' },
                    { label: '攻撃', value: unit.currentStats.atk, icon: '⚔️', color: 'text-red-400' },
                    { label: '防御', value: unit.currentStats.def, icon: '🛡️', color: 'text-blue-400' },
                    { label: '回復', value: unit.currentStats.rec, icon: '💚', color: 'text-emerald-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-800/60 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">{s.icon} {s.label}</p>
                      <p className={`font-black text-lg ${s.color}`}>{formatNumber(s.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-400">戦力: <span className="text-yellow-400 font-bold">{formatNumber(calcTotalPower(unit.currentStats))}</span></p>
                </div>
              </div>

              {/* 経験値アイテム */}
              <div className="card-base p-4">
                <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">経験値アイテムを使用</h3>
                <div className="space-y-2">
                  {EXP_ITEMS.map(({ itemId, exp, label }) => {
                    const owned = items.find(i => i.itemId === itemId)?.quantity ?? 0;
                    const itemMaster = getItemMaster(itemId);
                    return (
                      <div key={itemId} className="flex items-center gap-3">
                        <span className="text-2xl">{itemMaster?.emoji}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm">{label}</p>
                          <p className="text-blue-400 text-xs">+{exp.toLocaleString()} EXP</p>
                        </div>
                        <span className="text-gray-400 text-sm">×{owned}</span>
                        <button
                          onPointerDown={() => startLongPress(itemId, exp)}
                          onPointerUp={stopLongPress}
                          onPointerLeave={stopLongPress}
                          onPointerCancel={stopLongPress}
                          disabled={owned === 0 || unit.level >= getLevelCap(unit.currentRarity)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 select-none touch-none"
                          style={{ background: owned > 0 ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#374151', color: 'white' }}
                        >
                          使用
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 space-y-4">
              {/* 覚醒状況 */}
              <div className="card-base p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-bold">覚醒ランク</span>
                  <div>
                    <span className="text-yellow-400 text-2xl">{'★'.repeat(unit.awakenRank)}</span>
                    <span className="text-gray-600 text-2xl">{'☆'.repeat(master.maxAwaken - unit.awakenRank)}</span>
                  </div>
                </div>
                {unit.awakenRank < master.maxAwaken ? (
                  <p className="text-gray-400 text-sm">次の覚醒ランク: {unit.awakenRank + 1}</p>
                ) : (
                  <p className="text-yellow-400 font-bold">最大覚醒達成！</p>
                )}
              </div>

              {/* 覚醒素材 */}
              {unit.awakenRank < master.maxAwaken && (
                <div className="card-base p-4">
                  <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">必要素材</h3>
                  <div className="space-y-2 mb-4">
                    {(master.awakenMaterials ?? []).map(mat => {
                      const itemM = getItemMaster(mat.itemId);
                      const owned = items.find(i => i.itemId === mat.itemId)?.quantity ?? 0;
                      const enough = owned >= mat.quantity;
                      return (
                        <div key={mat.itemId} className="flex items-center gap-2">
                          <span className="text-xl">{itemM?.emoji}</span>
                          <span className="text-white text-sm flex-1">{itemM?.name}</span>
                          <span className={`text-sm font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
                            {owned} / {mat.quantity}
                          </span>
                          {enough ? <span className="text-green-400 text-xs">✓</span> : <span className="text-red-400 text-xs">✗</span>}
                        </div>
                      );
                    })}
                  </div>
                  <GameButton variant="gold" fullWidth onClick={handleAwaken}>
                    ★ 覚醒ランクアップ
                  </GameButton>
                </div>
              )}

              {/* 覚醒結晶セクション */}
              <div className="card-base p-4">
                <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">覚醒結晶</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💠</span>
                  <div className="flex-1">
                    <p className="text-white text-sm mb-1">覚醒数</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: AWAKENING_CONFIG.maxAwakeningCount }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < (unit.awakeningCount ?? 0) ? 'text-cyan-400' : 'text-gray-600'}`}>◆</span>
                      ))}
                      <span className="text-xs text-gray-400 ml-2">{unit.awakeningCount ?? 0}/{AWAKENING_CONFIG.maxAwakeningCount}</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    所持: {getAwakeningCrystalCount(unit.masterId)}個
                  </span>
                </div>
                {(unit.awakeningCount ?? 0) < AWAKENING_CONFIG.maxAwakeningCount ? (
                  <GameButton variant="gold" fullWidth
                    disabled={getAwakeningCrystalCount(unit.masterId) === 0}
                    onClick={handleCrystalAwaken}>
                    💠 {master?.name}の覚醒結晶で覚醒
                  </GameButton>
                ) : (
                  <p className="text-cyan-400 font-bold text-center text-sm">覚醒結晶上限達成！</p>
                )}
              </div>

              {/* 覚醒ボーナス */}
              {master.awakenBonus && (
                <div className="card-base p-4">
                  <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">覚醒ボーナス</h3>
                  {master.awakenBonus.map((bonus, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm py-1 border-b border-gray-700/50 ${i < unit.awakenRank ? 'text-yellow-400' : 'text-gray-500'}`}>
                      <span>{'★'.repeat(i + 1)}</span>
                      <span>HP+{bonus.hp} ATK+{bonus.atk} DEF+{bonus.def} REC+{bonus.rec}</span>
                      {i < unit.awakenRank && <span className="ml-auto text-xs">取得済み</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ユニット選択モーダル */}
      {selectingUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full max-h-[80vh] bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-bold">強化するユニット</h3>
              <button onClick={() => setSelectingUnit(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
              {ownedUnits.map(u => (
                <div key={u.instanceId} onClick={() => { setSelectedId(u.instanceId); setSelectingUnit(false); }}>
                  <UnitCard unit={u} selected={u.instanceId === selectedId} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
