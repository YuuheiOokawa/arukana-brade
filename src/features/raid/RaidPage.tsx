import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameButton } from '../../components/ui/game/GameButton';
import { useRaidStore } from '../../stores/raidStore';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePartyStore } from '../../stores/partyStore';
import { getActiveRaids } from '../../data/events';
import { getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import type { RaidBossMaster } from '../../types';

const ELEMENT_NAMES: Record<string, string> = {
  fire: '炎', water: '水', wind: '風', earth: '土', light: '光', dark: '闇',
};

export const RaidPage = () => {
  const navigate = useNavigate();
  const activeRaids = getActiveRaids();
  const [selectedRaid, setSelectedRaid] = useState<RaidBossMaster | null>(activeRaids[0] ?? null);

  if (activeRaids.length === 0) {
    return (
      <div className="min-h-screen pb-28">
        <TopBar title="レイドボス" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <p className="text-5xl mb-4">🏰</p>
          <p className="text-white font-bold text-xl mb-2">開催中のレイドはありません</p>
          <p className="text-gray-500 text-sm">次のレイドイベントをお楽しみに！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="レイドボス" />

      {/* ボス選択タブ */}
      {activeRaids.length > 1 && (
        <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {activeRaids.map(r => (
            <button key={r.id} onClick={() => setSelectedRaid(r)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ${
                selectedRaid?.id === r.id ? 'tab-active' : 'tab-inactive'
              }`}>
              <span>{r.emoji}</span><span>{r.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedRaid && <RaidBossDetail boss={selectedRaid} navigate={navigate} />}
    </div>
  );
};

const RaidBossDetail = ({ boss, navigate }: { boss: RaidBossMaster; navigate: ReturnType<typeof useNavigate> }) => {
  const { getRaidState, getRewardTier, resetRaid } = useRaidStore();
  const { player } = usePlayerStore();
  const { setPendingStage, setPendingFriend } = useQuestStore();
  const { getActiveParty } = usePartyStore();
  const [staminaError, setStaminaError] = useState(false);

  const state = getRaidState(boss.id);
  const hpPct = state.currentHp / boss.totalHp;
  const tier = getRewardTier(boss.id);
  const nextTierRewards = boss.rewards[tier + 1];
  const hoursLeft = Math.max(0, Math.floor((boss.endTimestamp - Date.now()) / 3600000));

  const formatHp = (hp: number) => {
    if (hp >= 1000000) return `${(hp / 1000000).toFixed(1)}M`;
    if (hp >= 1000) return `${(hp / 1000).toFixed(0)}K`;
    return hp.toString();
  };

  const handleChallenge = () => {
    if (Date.now() > boss.endTimestamp) {
      // 画面を開いたままの間にレイドが終了した場合は挑戦させない
      navigate('/raid', { replace: true });
      return;
    }
    const party = getActiveParty();
    if (!party.slots.some(Boolean)) {
      navigate('/party');
      return;
    }
    if (player.stamina < boss.entryStaminaCost) {
      setStaminaError(true);
      setTimeout(() => setStaminaError(false), 3000);
      return;
    }

    // レイドステージとしてバトルを起動
    // 擬似的なステージIDをセット
    const pseudoStageId = `raid_${boss.id}_stage`;
    setPendingStage(pseudoStageId);
    // フレンドなしでバトルへ
    setPendingFriend('');
    // ギルドミッションの「raid」進捗は、実際に戦闘が成立(勝利)した時にBattlePage側で加算する
    // (以前はここで即時加算していたため、スタミナ不足等でバトルに入れなかった場合も進捗が付与されていた)
    navigate('/battle', { state: { isRaid: true, raidBossId: boss.id, raidWaves: boss.waves } });
  };

  return (
    <div className="px-4 space-y-4">
      {/* ボスヘッダー */}
      <div className="rounded-2xl overflow-hidden border border-purple-800/40 p-5"
        style={{ background: boss.bannerColor }}>
        <div className="flex items-center gap-4">
          <div className="text-6xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.8))' }}>
            {boss.emoji}
          </div>
          <div>
            <p className="text-gray-300 text-xs mb-0.5">{ELEMENT_NAMES[boss.element]}属性</p>
            <h2 className="text-white font-black text-xl">{boss.name}</h2>
            <p className="text-yellow-400 text-xs font-bold mt-0.5">残り {hoursLeft}時間</p>
          </div>
        </div>
      </div>

      {/* HP */}
      <div className="card-base p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">ボスHP</span>
          <span className="text-white font-bold tabular-nums">
            {formatHp(state.currentHp)} / {formatHp(boss.totalHp)}
          </span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-1">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${hpPct * 100}%`,
              background: hpPct > 0.5 ? 'linear-gradient(90deg, #059669, #10b981)' :
                          hpPct > 0.2 ? 'linear-gradient(90deg, #d97706, #f59e0b)' :
                                        'linear-gradient(90deg, #b91c1c, #ef4444)',
            }} />
        </div>
        <p className="text-gray-600 text-xs text-right">{(hpPct * 100).toFixed(1)}%</p>
      </div>

      {/* 自分の戦績 */}
      <div className="card-base p-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">自分の戦績</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">参加回数</p>
            <p className="text-white font-black text-xl">{state.entryCount}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">総ダメージ</p>
            <p className="text-yellow-400 font-black text-xl">{formatHp(state.totalDamageDealt)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">報酬段階</p>
            <p className="text-purple-400 font-black text-xl">Tier {tier + 1}</p>
          </div>
        </div>
      </div>

      {/* 報酬テーブル */}
      <div className="card-base p-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">報酬段階</h3>
        <div className="space-y-2">
          {boss.rewards.map((r, i) => {
            const isCurrentTier = i === tier;
            const isClaimed = i < tier;
            return (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-2.5 ${
                isCurrentTier ? 'bg-yellow-900/20 border border-yellow-700/30' :
                isClaimed ? 'opacity-40' : 'bg-gray-800/30'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  isCurrentTier ? 'bg-yellow-400 text-black' :
                  isClaimed ? 'bg-gray-600 text-gray-400' : 'bg-gray-700 text-gray-500'
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">
                    {i === 0 ? '参加報酬' : `${formatHp(r.minDamage)} ダメージ以上`}
                  </p>
                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                    {r.items.map((itemId, j) => {
                      const m = getItemMaster(itemId);
                      return m ? (
                        <span key={j} className="text-xs text-gray-300">{m.emoji} {m.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
                {isClaimed && <span className="text-emerald-400 text-xs">✓</span>}
                {isCurrentTier && <span className="text-yellow-400 text-xs font-bold">現在</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 討伐済み → リセットボタン */}
      {state.currentHp <= 0 ? (
        <div className="pb-4 space-y-3">
          <div className="rounded-2xl p-4 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-emerald-400 font-black text-lg mb-1">🎉 討伐成功！</p>
            <p className="text-gray-400 text-sm">このボスを討伐しました</p>
          </div>
          <GameButton variant="secondary" fullWidth onClick={() => resetRaid(boss.id)}>
            🔄 次の挑戦を開始する
          </GameButton>
        </div>
      ) : (
        <div className="pb-4">
          {staminaError && (
            <div className="mb-2 rounded-xl px-3 py-2 text-sm text-red-400 font-bold text-center"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
              ⚠️ スタミナが足りません（必要: ⚡{boss.entryStaminaCost} / 現在: ⚡{player.stamina}）
            </div>
          )}
          <GameButton variant="primary" fullWidth onClick={handleChallenge}>
            ⚔️ 挑戦する (⚡{boss.entryStaminaCost})
          </GameButton>
          {nextTierRewards && (
            <p className="text-center text-gray-600 text-xs mt-2">
              次の報酬まであと {formatHp(nextTierRewards.minDamage - state.totalDamageDealt)} ダメージ
            </p>
          )}
        </div>
      )}
    </div>
  );
};
