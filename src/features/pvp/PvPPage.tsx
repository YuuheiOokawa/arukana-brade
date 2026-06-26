import { useState, useEffect } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { useArenaStore } from '../../stores/arenaStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { TopBar } from '../../components/layout/TopBar';
import { elementGradient } from '../../utils/elementUtils';
import { calcTotalPower } from '../../utils/format';
import type { ArenaOpponent } from '../../types';

type Phase = 'list' | 'battle' | 'result';

const RANK_TITLES: { min: number; label: string; color: string }[] = [
  { min: 3000, label: '覇者',       color: '#f0c040' },
  { min: 2500, label: 'グランドマスター', color: '#c4b5fd' },
  { min: 2000, label: 'マスター',   color: '#60a5fa' },
  { min: 1700, label: 'ダイヤ',     color: '#34d399' },
  { min: 1400, label: 'プラチナ',   color: '#94a3b8' },
  { min: 1100, label: 'ゴールド',   color: '#f59e0b' },
  { min: 0,    label: 'シルバー',   color: '#6b7280' },
];

const getRankTitle = (pts: number) => RANK_TITLES.find(r => pts >= r.min) ?? RANK_TITLES[RANK_TITLES.length - 1];

export const PvPPage = () => {
  const { record, getMatchOpponents, recordWin, recordLoss, battleHistory } = useArenaStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits } = useUnitStore();
  const { addGold, addDiamond } = usePlayerStore();

  const [phase, setPhase] = useState<Phase>('list');
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);
  const [currentOpponent, setCurrentOpponent] = useState<ArenaOpponent | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [result, setResult] = useState<{ won: boolean; pointsGained: number; gold: number; diamond: number } | null>(null);
  const [isBattling, setIsBattling] = useState(false);

  useEffect(() => {
    setOpponents(getMatchOpponents());
  }, [record.points]);

  const calcPlayerPower = () => {
    const party = getActiveParty();
    return party.slots
      .filter(Boolean)
      .reduce((sum, id) => {
        const unit = ownedUnits.find(u => u.instanceId === id);
        if (!unit) return sum;
        const master = UNIT_MASTER.find(m => m.id === unit.masterId);
        if (!master) return sum;
        const stats = calcUnitStats(master, unit.level, unit.awakenRank);
        return sum + calcTotalPower(stats);
      }, 0);
  };

  const simulateBattle = (opponent: ArenaOpponent) => {
    const playerPower = calcPlayerPower();
    const oppPower = opponent.power;

    // 勝率計算: 戦力比 + ランダム要素
    const ratio = playerPower / Math.max(1, oppPower);
    const winChance = Math.min(0.85, Math.max(0.15, 0.5 + (ratio - 1) * 0.3));
    const won = Math.random() < winChance;

    // バトルログ生成
    const party = getActiveParty();
    const partyUnits = party.slots
      .filter(Boolean)
      .map(id => ownedUnits.find(u => u.instanceId === id))
      .filter(Boolean);

    const oppMaster = UNIT_MASTER.find(m => m.id === opponent.leaderUnitMasterId);
    const logs: string[] = [];
    logs.push(`アリーナバトル開始！`);
    logs.push(`${opponent.playerName} の ${oppMaster?.name ?? '???'} に挑戦...`);

    for (let i = 0; i < 3; i++) {
      const unit = partyUnits[i % partyUnits.length];
      if (!unit) continue;
      const master = UNIT_MASTER.find(m => m.id === unit.masterId);
      if (!master) continue;
      const dmg = Math.floor(Math.random() * 5000 + 2000);
      logs.push(`${master.emoji} ${master.name} が ${dmg.toLocaleString()} ダメージ！`);
    }

    if (won) {
      logs.push(`✨ 勝利！相手のHPを削り切った！`);
    } else {
      logs.push(`💀 敗北...HPが尽きた`);
    }

    return { won, logs };
  };

  const handleChallenge = (opponent: ArenaOpponent) => {
    const party = getActiveParty();
    if (!party.slots.some(Boolean)) {
      alert('パーティを編成してください');
      return;
    }
    setCurrentOpponent(opponent);
    setPhase('battle');
    setIsBattling(true);
    setBattleLog([]);

    const { won, logs } = simulateBattle(opponent);

    let i = 0;
    const timer = setInterval(() => {
      if (i < logs.length) {
        setBattleLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(timer);
        setIsBattling(false);
        const battleResult = won ? recordWin(opponent.id) : recordLoss(opponent.id);
        if (battleResult.goldReward) addGold(battleResult.goldReward);
        if (battleResult.diamondReward) addDiamond(battleResult.diamondReward);
        setResult({ won, pointsGained: battleResult.pointsGained, gold: battleResult.goldReward, diamond: battleResult.diamondReward });
        setPhase('result');
      }
    }, 500);
  };

  const rankTitle = getRankTitle(record.points);

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="アリーナ" />

      {phase === 'list' && (
        <>
          {/* 自分のランク */}
          <div className="mx-4 mb-5 rounded-2xl p-5 border border-purple-800/30"
            style={{ background: 'linear-gradient(135deg, #0d0530, #1a0a40)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">現在のランク</p>
                <p className="text-3xl font-black" style={{ color: rankTitle.color }}>
                  {rankTitle.label}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">{record.points} pt · #{record.rank}</p>
              </div>
              <div className="text-right">
                <div className="flex gap-4">
                  <div>
                    <p className="text-gray-500 text-xs">勝利</p>
                    <p className="text-emerald-400 font-black text-xl">{record.wins}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">敗北</p>
                    <p className="text-red-400 font-black text-xl">{record.losses}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((record.points % 500) / 500) * 100)}%`,
                  background: `linear-gradient(90deg, ${rankTitle.color}88, ${rankTitle.color})`,
                }} />
            </div>
          </div>

          {/* 対戦相手 */}
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">対戦相手</p>
              <button onClick={() => setOpponents(getMatchOpponents())}
                className="text-purple-400 text-xs">更新</button>
            </div>
            <div className="space-y-2">
              {opponents.map(opp => {
                const master = UNIT_MASTER.find(m => m.id === opp.leaderUnitMasterId);
                const oppTitle = getRankTitle(opp.arenaPoints);
                return (
                  <div key={opp.id} className="card-base p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: master ? elementGradient(master.element) : '#1a1a35' }}>
                      {master?.emoji ?? '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-white font-bold text-sm">{opp.playerName}</p>
                        <span className="text-[10px] font-bold" style={{ color: oppTitle.color }}>
                          {oppTitle.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Rank {opp.playerRank} · {opp.arenaPoints} pt · 戦力 {opp.power.toLocaleString()}
                      </p>
                      {master && (
                        <p className="text-gray-600 text-xs mt-0.5">
                          リーダー: {master.name} Lv{opp.leaderUnitLevel}
                        </p>
                      )}
                    </div>
                    <GameButton variant="primary" size="sm" onClick={() => handleChallenge(opp)}>
                      挑戦
                    </GameButton>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 戦績履歴 */}
          {battleHistory.length > 0 && (
            <div className="px-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">最近の戦績</p>
              <div className="space-y-1.5">
                {battleHistory.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/30 rounded-xl px-3 py-2">
                    <span className={`text-xs font-black w-8 text-center ${h.won ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.won ? '勝' : '敗'}
                    </span>
                    <span className="text-gray-400 text-xs flex-1">{h.opponentName}</span>
                    <span className={`text-xs font-bold ${h.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.points >= 0 ? '+' : ''}{h.points} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'battle' && currentOpponent && (
        <div className="px-4">
          <div className="card-base p-5 min-h-[400px] flex flex-col">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">バトル進行中...</p>
            <div className="flex-1 space-y-2 font-mono">
              {battleLog.map((log, i) => (
                <p key={i} className={`text-sm animate-slide-up ${
                  log.includes('勝利') ? 'text-yellow-400 font-bold' :
                  log.includes('敗北') ? 'text-red-400 font-bold' :
                  log.includes('ダメージ') ? 'text-white' : 'text-gray-400'
                }`}>
                  {log}
                </p>
              ))}
              {isBattling && (
                <div className="flex gap-1 pt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="px-4">
          <div className={`rounded-2xl p-6 text-center mb-4 ${result.won ? 'border border-yellow-700/40' : 'border border-red-900/40'}`}
            style={{ background: result.won ? 'linear-gradient(135deg, #1a1000, #3d2000)' : 'linear-gradient(135deg, #1a0000, #3d0000)' }}>
            <p className="text-6xl mb-3">{result.won ? '🏆' : '💀'}</p>
            <h2 className={`text-3xl font-black mb-1 ${result.won ? 'text-gradient-gold' : 'text-red-400'}`}>
              {result.won ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <p className={`text-lg font-bold mb-4 ${result.pointsGained >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.pointsGained >= 0 ? '+' : ''}{result.pointsGained} pt
            </p>
            <div className="flex justify-center gap-6">
              {result.gold > 0 && <div><p className="text-gray-500 text-xs">🪙 ゴールド</p><p className="text-yellow-400 font-bold">{result.gold.toLocaleString()}</p></div>}
              {result.diamond > 0 && <div><p className="text-gray-500 text-xs">💎 ダイヤ</p><p className="text-blue-400 font-bold">{result.diamond}</p></div>}
            </div>
          </div>
          <div className="flex gap-3">
            <GameButton variant="secondary" fullWidth onClick={() => { setPhase('list'); setOpponents(getMatchOpponents()); }}>
              戻る
            </GameButton>
            {currentOpponent && (
              <GameButton variant="primary" fullWidth onClick={() => handleChallenge(currentOpponent)}>
                再挑戦
              </GameButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
