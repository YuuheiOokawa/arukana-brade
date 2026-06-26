import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUEST_WORLDS } from '../../data/quests';
import { getActiveEvents } from '../../data/events';
import { getScenario } from '../../data/scenarios';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePartyStore } from '../../stores/partyStore';
import { TopBar } from '../../components/layout/TopBar';
import { StaminaModal } from '../../components/ui/StaminaModal';
import type { QuestArea, QuestStage } from '../../types';

type MainTab = 'story' | 'event';

export const QuestsPage = () => {
  const navigate = useNavigate();
  const { isCleared, setPendingStage } = useQuestStore();
  const { player } = usePlayerStore();
  const { getActiveParty } = usePartyStore();

  const [mainTab, setMainTab] = useState<MainTab>('story');
  const [selectedWorldId, setSelectedWorldId] = useState(QUEST_WORLDS[0].id);
  const [selectedArea, setSelectedArea] = useState<QuestArea | null>(null);
  const [staminaModal, setStaminaModal] = useState<{ stageId: string; cost: number } | null>(null);

  const selectedWorld = QUEST_WORLDS.find(w => w.id === selectedWorldId)!;
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
          {/* ワールドタブ */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {QUEST_WORLDS.map(w => (
                <button key={w.id} onClick={() => { setSelectedWorldId(w.id); setSelectedArea(null); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedWorldId === w.id ? 'tab-active' : 'tab-inactive'
                  }`}>
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {!selectedArea ? (
            <div className="px-4 space-y-3">
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-3">エリア選択</p>
              {selectedWorld.areas.map(area => {
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
    </div>
  );
};

// ステージリスト（共通コンポーネント）
const StageList = ({
  stages, title, onBack, onSelect, isCleared, playerStamina, showBack = true,
}: {
  stages: QuestStage[];
  title: string;
  onBack: () => void;
  onSelect: (s: QuestStage) => void;
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
    {stages.map((stage, idx) => {
      const cleared = isCleared(stage.id);
      const noStamina = playerStamina < stage.staminaCost;
      return (
        <button key={stage.id} onClick={() => onSelect(stage)}
          className={`relative w-full card-base p-4 text-left transition-all unit-card-hover ${cleared ? 'border-emerald-700/30' : ''}`}>
          {/* CLEARバッジ */}
          {cleared && (
            <div className="absolute top-2 right-2 z-10">
              <span
                className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))',
                  color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.45)',
                  letterSpacing: '0.1em',
                }}>
                CLEAR
              </span>
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
                  <div key={i} className="flex gap-1">
                    {wave.isBoss && <span className="text-red-400 text-xs font-bold">BOSS</span>}
                    {wave.enemies.map((e, j) => (
                      <span key={j} className="text-xs bg-gray-800/60 border border-gray-700/40 rounded px-1.5 py-0.5 text-gray-400">
                        {e.enemyId.includes('dragon') ? 'Dragon' : e.enemyId.includes('boss') || e.enemyId.includes('lich') ? 'Boss' : 'Enemy'} Lv{e.level}
                      </span>
                    ))}
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
