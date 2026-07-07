import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestWorlds } from '../../data/quests';
import { getActiveEvents } from '../../data/events';
import { getScenario } from '../../data/scenarios';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { useGuildStore } from '../../stores/guildStore';
import { saveImmediately } from '../../lib/syncService';
import { ENEMY_MASTER } from '../../data/enemies';
import { getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import { StaminaModal } from '../../components/ui/StaminaModal';
import { GameBadge } from '../../components/ui/game/UIDecorations';
import type { QuestArea, QuestStage } from '../../types';

interface SweepResult {
  stageName: string;
  gold: number;
  exp: number;
  items: string[];
}

type MainTab = 'story' | 'event';

export const QuestsPage = () => {
  const navigate = useNavigate();
  const { isCleared, setPendingStage, lastSelectedWorldId, setLastSelectedWorldId } = useQuestStore();
  const { player, recoverStamina, spendStamina, addGold, addExp, addItem, syncCurrencyToServer, recordBattleWin, recordQuestClear } = usePlayerStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits, levelUpUnit } = useUnitStore();
  const { addDailyProgress, addWeeklyProgress } = useMissionStore();

  const [mainTab, setMainTab] = useState<MainTab>('story');
  const [selectedWorldId, setSelectedWorldId] = useState(() =>
    lastSelectedWorldId ?? getQuestWorlds()[0].id
  );
  const [selectedArea, setSelectedArea] = useState<QuestArea | null>(null);
  const [staminaModal, setStaminaModal] = useState<{ stageId: string; cost: number } | null>(null);
  const [sweepResult, setSweepResult] = useState<SweepResult | null>(null);
  const [sweepError, setSweepError] = useState('');

  const questWorlds = getQuestWorlds();

  // 前ワールドの最終ステージをクリアしないと次ワールドは非表示
  const isWorldAccessible = (worldIdx: number): boolean => {
    if (worldIdx === 0) return true;
    const prevWorld = questWorlds[worldIdx - 1];
    const prevLastArea = prevWorld.areas[prevWorld.areas.length - 1];
    const prevLastStage = prevLastArea?.stages[prevLastArea.stages.length - 1];
    return prevLastStage ? isCleared(prevLastStage.id) : false;
  };
  const accessibleWorlds = questWorlds.filter((_, idx) => isWorldAccessible(idx));
  // 選択中ワールドがロックされた場合は最後の解放済みワールドへ
  const effectiveWorldId = accessibleWorlds.some(w => w.id === selectedWorldId)
    ? selectedWorldId
    : (accessibleWorlds[accessibleWorlds.length - 1]?.id ?? questWorlds[0].id);
  const selectedWorld = questWorlds.find(w => w.id === effectiveWorldId)!;

  const party = getActiveParty();
  const hasParty = party.slots.some(Boolean);
  const activeEvents = getActiveEvents();

  const navigateToStage = (stageId: string) => {
    setPendingStage(stageId);
    const hasScenario = !!getScenario(stageId);
    navigate(hasScenario ? `/scenario/${stageId}` : '/friends');
  };

  const handleStageSelect = (stage: QuestStage) => {
    if (!hasParty) { navigate('/party'); return; }
    if (player.stamina < stage.staminaCost) {
      setStaminaModal({ stageId: stage.id, cost: stage.staminaCost });
      return;
    }
    navigateToStage(stage.id);
  };

  const handleStaminaUsed = () => {
    if (!staminaModal) return;
    const { stageId, cost } = staminaModal;
    if (player.stamina >= cost) {
      setStaminaModal(null);
      navigateToStage(stageId);
    }
  };

  // クリア済みステージの掃討（スキップ）：バトルなしで即時報酬を獲得
  const handleSweep = (stage: QuestStage) => {
    recoverStamina();
    const ok = spendStamina(stage.staminaCost);
    if (!ok) {
      setSweepError('スタミナが足りません');
      setTimeout(() => setSweepError(''), 2500);
      return;
    }

    // 報酬計算（通常バトル勝利と同じロジック）
    const gold = stage.rewardGold;
    const exp = stage.rewardExp;
    const items: string[] = [];
    stage.rewardItems.forEach(ri => {
      if (Math.random() < ri.chance) {
        for (let i = 0; i < ri.quantity; i++) items.push(ri.itemId);
      }
    });

    addGold(gold);
    addExp(exp);
    items.forEach(id => addItem(id, 1));

    // パーティユニットへ経験値分配
    const party = getActiveParty();
    const partyUnitIds = party.slots.filter(Boolean) as string[];
    const partyCount = partyUnitIds.length || 1;
    partyUnitIds.forEach(instanceId => {
      if (ownedUnits.some(u => u.instanceId === instanceId)) {
        levelUpUnit(instanceId, Math.floor(exp / partyCount));
      }
    });

    // ミッション・実績・ギルド進捗
    addDailyProgress('battle_win');
    addDailyProgress('quest_clear');
    addWeeklyProgress('battle_win');
    addWeeklyProgress('quest_clear');
    recordBattleWin();
    recordQuestClear();
    useGuildStore.getState().addGuildExp(Math.floor(exp * 0.1));
    useGuildStore.getState().updateGuildMissionProgress('battle', 1);

    setTimeout(() => {
      void syncCurrencyToServer();
      saveImmediately();
    }, 500);

    setSweepResult({ stageName: stage.name, gold, exp, items });
  };

  // 残り時間計算
  const formatTimeLeft = (endTs: number) => {
    const diff = endTs - Date.now();
    if (diff <= 0) return '終了';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return d > 0 ? `残り${d}日${h}時間` : `残り${h}時間`;
  };

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="クエスト" />

      {/* メインタブ */}
      <div className="px-4 mb-4 flex gap-2">
        <button onClick={() => setMainTab('story')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mainTab === 'story' ? 'tab-active' : 'tab-inactive'}`}>
          ストーリー
        </button>
        <button onClick={() => setMainTab('event')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all relative ${mainTab === 'event' ? 'tab-active' : 'tab-inactive'}`}>
          イベント
          {activeEvents.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {activeEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* パーティ未設定バナー */}
      {!hasParty && (
        <button
          onClick={() => navigate('/party')}
          className="mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl p-3 flex items-center gap-3 text-left active:scale-98 transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(180,28,28,0.12))', border: '1px solid rgba(239,68,68,0.3)' }}>
          <span className="text-xl">⚔️</span>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#f87171' }}>パーティが設定されていません</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>タップして編成画面へ</p>
          </div>
          <span style={{ color: '#4b5563' }}>›</span>
        </button>
      )}

      {/* ストーリー */}
      {mainTab === 'story' && (
        <>
          {/* ワールドタブ（解放済みワールドのみ表示） */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {accessibleWorlds.map(w => (
                <button key={w.id} onClick={() => { setSelectedWorldId(w.id); setLastSelectedWorldId(w.id); setSelectedArea(null); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    effectiveWorldId === w.id ? 'tab-active' : 'tab-inactive'
                  }`}>
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {!selectedArea ? (
            <div className="px-4 space-y-3">
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-3">エリア選択</p>
              {/* 前エリアの最終ステージをクリアしないと次エリアは非表示（ステージと同様） */}
              {selectedWorld.areas
                .filter((_, areaIdx) => {
                  if (areaIdx === 0) return true;
                  const prevArea = selectedWorld.areas[areaIdx - 1];
                  const prevLastStage = prevArea.stages[prevArea.stages.length - 1];
                  return isCleared(prevLastStage.id);
                })
                .map((area) => {
                  const totalStages = area.stages.length;
                  const cleared = area.stages.filter(s => isCleared(s.id)).length;
                  const isComplete = cleared === totalStages;
                  return (
                    <button key={area.id} onClick={() => setSelectedArea(area)}
                      className="w-full card-base p-4 text-left unit-card-hover">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                          isComplete ? 'bg-emerald-900/50 border border-emerald-700/40' : 'bg-purple-900/40 border border-purple-700/30'
                        }`}>
                          {area.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-white font-bold text-sm">{area.name}</p>
                            {isComplete && <span className="text-emerald-400 text-xs">✓</span>}
                          </div>
                          <p className="text-gray-500 text-xs mb-2">{area.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                style={{ width: `${(cleared / totalStages) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums">{cleared}/{totalStages}</span>
                          </div>
                        </div>
                        <span className="text-gray-600 text-lg flex-shrink-0">›</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            <StageList
              stages={selectedArea.stages}
              title={`${selectedArea.emoji} ${selectedArea.name}`}
              onBack={() => setSelectedArea(null)}
              onSelect={handleStageSelect}
              onSweep={handleSweep}
              isCleared={isCleared}
              playerStamina={player.stamina}
            />
          )}
        </>
      )}

      {/* イベント */}
      {mainTab === 'event' && (
        <div className="px-4 space-y-4">
          {activeEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-5xl mb-4">🎉</p>
              <p className="text-white font-bold text-lg">開催中のイベントはありません</p>
              <p className="text-gray-500 text-sm mt-1">次のイベントをお楽しみに！</p>
            </div>
          ) : (
            activeEvents.map(event => (
              <div key={event.id}>
                {/* イベントバナー */}
                <div className="rounded-2xl overflow-hidden border border-purple-800/30 mb-3 p-4"
                  style={{ background: event.bannerColor }}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{event.emoji}</span>
                    <div>
                      <p className="text-white font-black text-lg">{event.name}</p>
                      <p className="text-gray-300 text-xs">{event.description}</p>
                      <p className="text-yellow-400 text-xs font-bold mt-1">{formatTimeLeft(event.endTimestamp)}</p>
                    </div>
                  </div>
                </div>
                <StageList
                  stages={event.stages}
                  title=""
                  onBack={() => {}}
                  onSelect={handleStageSelect}
                  onSweep={handleSweep}
                  isCleared={isCleared}
                  playerStamina={player.stamina}
                  showBack={false}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* スタミナ不足モーダル */}
      {staminaModal && (
        <StaminaModal
          requiredStamina={staminaModal.cost}
          onClose={() => setStaminaModal(null)}
          onUsed={handleStaminaUsed}
        />
      )}

      {/* 掃討エラートースト */}
      {sweepError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl font-bold text-sm text-white"
          style={{ background: 'rgba(220,38,38,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          ⚠️ {sweepError}
        </div>
      )}

      {/* 掃討結果モーダル */}
      {sweepResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setSweepResult(null); }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{
            background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
            border: '1px solid rgba(240,192,64,0.4)',
            boxShadow: '0 0 40px rgba(240,192,64,0.15)',
          }}>
            <p className="text-center text-3xl mb-2">⏩</p>
            <h3 className="text-center text-white font-black text-lg mb-1">スキップ完了！</h3>
            <p className="text-center text-gray-500 text-xs mb-4">{sweepResult.stageName}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)' }}>
                <span className="text-gray-400 text-sm">🪙 ゴールド</span>
                <span className="text-yellow-400 font-black">+{sweepResult.gold.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <span className="text-gray-400 text-sm">⭐ EXP</span>
                <span className="text-blue-300 font-black">+{sweepResult.exp.toLocaleString()}</span>
              </div>
              {sweepResult.items.length > 0 && (
                <div className="rounded-xl px-4 py-2.5"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p className="text-gray-400 text-sm mb-1.5">📦 ドロップアイテム</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(sweepResult.items.reduce<Record<string, number>>((acc, id) => {
                      acc[id] = (acc[id] ?? 0) + 1;
                      return acc;
                    }, {})).map(([itemId, count]) => {
                      const m = getItemMaster(itemId);
                      return (
                        <span key={itemId} className="text-xs bg-gray-800/60 rounded px-2 py-1 text-gray-300 border border-gray-700/40">
                          {m ? `${m.emoji} ${m.name}` : itemId} ×{count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setSweepResult(null)}
              className="w-full py-3 rounded-xl font-black text-sm text-white active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ステージリスト（共通コンポーネント）
const StageList = ({
  stages, title, onBack, onSelect, onSweep, isCleared, playerStamina, showBack = true,
}: {
  stages: QuestStage[];
  title: string;
  onBack: () => void;
  onSelect: (s: QuestStage) => void;
  onSweep?: (s: QuestStage) => void;
  isCleared: (id: string) => boolean;
  playerStamina: number;
  showBack?: boolean;
}) => (
  <div className="px-4 space-y-3">
    {showBack && (
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-400 text-sm">
          ‹
        </button>
        <p className="text-white font-bold">{title}</p>
      </div>
    )}
    {/* 前ステージクリアで次ステージが解放される（idx=0は常に表示）*/}
    {stages.filter((_, idx) => idx === 0 || isCleared(stages[idx - 1].id)).map((stage, idx) => {
      const cleared = isCleared(stage.id);
      const noStamina = playerStamina < stage.staminaCost;
      return (
        <button key={stage.id} onClick={() => onSelect(stage)}
          className={`relative w-full card-base p-4 text-left transition-all unit-card-hover ${cleared ? 'border-emerald-700/30' : ''}`}>
          {/* CLEARバッジ + スキップボタン */}
          {cleared && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              {onSweep && (
                <span
                  role="button"
                  onClick={e => { e.stopPropagation(); if (!noStamina) onSweep(stage); }}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${noStamina ? 'opacity-40' : 'active:scale-95'}`}
                  style={{
                    background: 'rgba(96,165,250,0.15)',
                    border: '1px solid rgba(96,165,250,0.4)',
                    color: '#93c5fd',
                  }}>
                  ⏩ スキップ ⚡{stage.staminaCost}
                </span>
              )}
              <GameBadge color="teal">CLEAR</GameBadge>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${
              cleared ? 'bg-emerald-700/40 text-emerald-400' : 'bg-gray-800 text-gray-500'
            }`}>
              {cleared ? '✓' : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm mb-1">{stage.name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
                <span className={noStamina ? 'text-red-400 font-bold' : ''}>スタミナ {stage.staminaCost}</span>
                <span>推奨 {stage.recommendedPower.toLocaleString()}</span>
                <span className="text-yellow-600">{stage.rewardGold.toLocaleString()}G</span>
                <span className="text-blue-400">EXP {stage.rewardExp}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {stage.waves.map((wave, i) => (
                  <div key={i} className="flex gap-1 flex-wrap">
                    {wave.isBoss && <span className="text-red-400 text-xs font-bold mr-0.5">BOSS</span>}
                    {wave.enemies.map((e, j) => {
                      const em = ENEMY_MASTER.find(m => m.id === e.enemyId);
                      return (
                        <span key={j} className="text-xs bg-gray-800/60 border border-gray-700/40 rounded px-1.5 py-0.5 flex items-center gap-0.5"
                          style={{ color: wave.isBoss ? '#f87171' : '#9ca3af' }}>
                          {em ? `${em.emoji} ${em.name}` : e.enemyId} Lv{e.level}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {noStamina && (
              <div className="flex-shrink-0">
                <span className="text-xs bg-red-900/50 text-red-400 rounded-lg px-2 py-1 border border-red-900/40">スタミナ不足</span>
              </div>
            )}
          </div>
        </button>
      );
    })}
  </div>
);
