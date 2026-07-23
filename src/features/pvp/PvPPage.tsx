import { useState, useEffect } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { useArenaStore } from '../../stores/arenaStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { TopBar } from '../../components/layout/TopBar';
import { elementGradient } from '../../utils/elementUtils';
import { calcTotalPower } from '../../utils/format';
import type { ArenaOpponent } from '../../types';
import { ELEMENT_ADVANTAGE } from '../../types';
import { getRankTitle, getRankProgressPct, getPointsToNextRank, RANK_TITLES } from '../../data/arenaRank';

type Phase = 'list' | 'confirm' | 'battle' | 'result';

export const PvPPage = () => {
  const { record, getMatchOpponents, recordWin, recordLoss, battleHistory, checkDailyRefresh } = useArenaStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits } = useUnitStore();
  const { addGold, addDiamond } = usePlayerStore();
  const { addDailyProgress, addWeeklyProgress } = useMissionStore();

  const [phase, setPhase] = useState<Phase>('list');
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);
  const [currentOpponent, setCurrentOpponent] = useState<ArenaOpponent | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [result, setResult] = useState<{ won: boolean; pointsGained: number; gold: number; diamond: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRankList, setShowRankList] = useState(false);

  useEffect(() => {
    try {
      checkDailyRefresh();
      setOpponents(getMatchOpponents());
    } catch (e) {
      console.error('Arena init error:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.points]);

  const calcPlayerPower = () => {
    try {
      const party = getActiveParty();
      if (!party) return 0;
      return (party.slots ?? [])
        .filter(Boolean)
        .reduce((sum, id) => {
          const unit = ownedUnits.find(u => u.instanceId === id);
          if (!unit) return sum;
          const master = UNIT_MASTER.find(m => m.id === unit.masterId);
          if (!master) return sum;
          return sum + calcTotalPower(calcUnitStats(master, unit.level, unit.awakenRank, unit.awakeningCount ?? 0));
        }, 0);
    } catch { return 0; }
  };

  const simulateBattle = (opponent: ArenaOpponent): { won: boolean; logs: string[] } => {
    const playerPower = calcPlayerPower();
    const oppPower = opponent.power;
    const ratio = playerPower / Math.max(1, oppPower);
    const winChance = Math.min(0.85, Math.max(0.15, 0.5 + (ratio - 1) * 0.3));
    const won = Math.random() < winChance;

    const party = getActiveParty();
    const partyUnits = (party?.slots ?? [])
      .filter(Boolean)
      .map(id => ownedUnits.find(u => u.instanceId === id))
      .filter((u): u is NonNullable<typeof u> => u != null);

    const oppMaster = UNIT_MASTER.find(m => m.id === opponent.leaderUnitMasterId);
    const oppStats = oppMaster
      ? calcUnitStats(oppMaster, opponent.leaderUnitLevel, opponent.leaderUnitAwakenRank)
      : { atk: Math.floor(oppPower / 10), def: Math.floor(oppPower / 20), hp: oppPower, rec: 100 };

    const logs: string[] = [];
    logs.push(`⚔️ ${opponent.playerName} への挑戦開始！`);
    logs.push(`相手リーダー: ${oppMaster?.name ?? '???'} (戦力 ${oppPower.toLocaleString()})`);
    logs.push('');

    partyUnits.forEach(unit => {
      const master = UNIT_MASTER.find(m => m.id === unit.masterId);
      if (!master) return;
      const stats = calcUnitStats(master, unit.level, unit.awakenRank, unit.awakeningCount ?? 0);
      const elemMult = ELEMENT_ADVANTAGE[master.element]?.[oppMaster?.element ?? 'none' as never] ?? 1.0;
      const baseDmg = Math.max(1, stats.atk * (0.85 + Math.random() * 0.3) - oppStats.def * 0.3);
      const dmg = Math.floor(baseDmg * elemMult);
      const elemNote = elemMult > 1.0 ? ' ⚡属性有利！' : elemMult < 1.0 ? ' ↓属性不利' : '';
      logs.push(`${master.emoji} ${master.name} → ${dmg.toLocaleString()} ダメージ！${elemNote}`);
    });

    if (oppMaster) {
      const enemyDmg = Math.floor(oppStats.atk * (0.8 + Math.random() * 0.4));
      logs.push(`${oppMaster.emoji} ${oppMaster.name} の反撃 → ${enemyDmg.toLocaleString()} ダメージ！`);
    }
    logs.push('');
    logs.push(won ? '✨ 勝利！相手のHPを削り切った！' : '💀 敗北...HPが尽きた');
    return { won, logs };
  };

  // 相手選択 → 確認フェーズへ
  const handleSelectOpponent = (opponent: ArenaOpponent) => {
    try {
      const party = getActiveParty();
      if (!party || !(party.slots ?? []).some(Boolean)) {
        setErrorMsg('パーティを編成してください');
        return;
      }
      setErrorMsg(null);
      setCurrentOpponent(opponent);
      setPhase('confirm');
    } catch (e) {
      console.error('Arena select error:', e);
    }
  };

  // バトル実行 → battle → result
  const handleStartBattle = () => {
    if (!currentOpponent) return;
    try {
      const { won, logs } = simulateBattle(currentOpponent);
      setBattleLog(logs);
      setPhase('battle');

      const battleResult = won ? recordWin(currentOpponent.id) : recordLoss(currentOpponent.id);
      if (battleResult.goldReward > 0) addGold(battleResult.goldReward);
      if (battleResult.diamondReward > 0) addDiamond(battleResult.diamondReward);
      if (won) {
        addDailyProgress('battle_win');
        addWeeklyProgress('battle_win');
      }
      setResult({ won, pointsGained: battleResult.pointsGained, gold: battleResult.goldReward, diamond: battleResult.diamondReward });

      void fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'arena_battle', won, pointsGained: battleResult.pointsGained, goldReward: battleResult.goldReward, diamondReward: battleResult.diamondReward }),
      }).catch(() => {});
    } catch (e) {
      console.error('Arena battle error:', e);
      setPhase('list');
    }
  };

  const backToList = () => {
    setPhase('list');
    setCurrentOpponent(null);
    setBattleLog([]);
    setResult(null);
    try { setOpponents(getMatchOpponents()); } catch { /* ignore */ }
  };

  const rankTitle = getRankTitle(record.points);
  const pointsToNext = getPointsToNextRank(record.points);

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="アリーナ" />

      {/* ── 自分のランク（list / confirm で表示） ── */}
      {(phase === 'list' || phase === 'confirm') && (
        <div className="mx-4 mb-5 rounded-2xl p-5 border border-purple-800/30"
          style={{ background: 'linear-gradient(135deg, #0d0530, #1a0a40)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">現在のランク</p>
              <p className="text-3xl font-black" style={{ color: rankTitle.color }}>{rankTitle.label}</p>
              <p className="text-gray-400 text-sm mt-0.5">{record.points} pt · #{record.rank}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs">勝利</p>
                <p className="text-emerald-400 font-black text-xl">{record.wins}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">敗北</p>
                <p className="text-red-400 font-black text-xl">{record.losses}</p>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${getRankProgressPct(record.points)}%`, background: `linear-gradient(90deg, ${rankTitle.color}88, ${rankTitle.color})` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-gray-500 text-xs">
              {pointsToNext !== null ? <>次のランクまで あと <span className="font-bold" style={{ color: rankTitle.color }}>{pointsToNext.toLocaleString()}</span> pt</> : '👑 最上位ランクに到達済み'}
            </p>
            <button onClick={() => setShowRankList(true)}
              className="text-purple-400 text-xs px-2.5 py-1 rounded-lg active:scale-95 transition-all flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
              階級一覧
            </button>
          </div>
        </div>
      )}

      {/* ── 対戦相手リスト ── */}
      {phase === 'list' && (
        <div className="px-4">
          {errorMsg && (
            <div className="mb-3 px-4 py-2 rounded-xl bg-red-900/40 border border-red-700/40 text-red-300 text-sm">{errorMsg}</div>
          )}
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">対戦相手を選択</p>
            <button onClick={() => { try { setOpponents(getMatchOpponents()); } catch { /* ignore */ } }}
              className="text-purple-400 text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>更新</button>
          </div>
          <div className="space-y-2 mb-6">
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
                    <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{opp.playerName}</p>
                      <span className="text-[10px] font-bold flex-shrink-0" style={{ color: oppTitle.color }}>{oppTitle.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs">Rank {opp.playerRank} · {opp.arenaPoints} pt · 戦力 {opp.power.toLocaleString()}</p>
                    {master && <p className="text-gray-600 text-xs mt-0.5">リーダー: {master.name} Lv{opp.leaderUnitLevel}</p>}
                  </div>
                  <GameButton variant="primary" size="sm" onClick={() => handleSelectOpponent(opp)}>挑戦</GameButton>
                </div>
              );
            })}
          </div>

          {battleHistory.length > 0 && (
            <>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">最近の戦績</p>
              <div className="space-y-1.5">
                {battleHistory.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/30 rounded-xl px-3 py-2">
                    <span className={`text-xs font-black w-8 text-center ${h.won ? 'text-emerald-400' : 'text-red-400'}`}>{h.won ? '勝' : '敗'}</span>
                    <span className="text-gray-400 text-xs flex-1 min-w-0 truncate">{h.opponentName}</span>
                    <span className={`text-xs font-bold ${h.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{h.points >= 0 ? '+' : ''}{h.points} pt</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 確認画面 ── */}
      {phase === 'confirm' && currentOpponent && (() => {
        const opp = currentOpponent;
        const master = UNIT_MASTER.find(m => m.id === opp.leaderUnitMasterId);
        const oppTitle = getRankTitle(opp.arenaPoints);
        const playerPower = calcPlayerPower();
        const powerDiff = playerPower - opp.power;
        return (
          <div className="px-4">
            <div className="card-base p-5 mb-4">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 text-center">対戦確認</p>
              <div className="flex items-center justify-between mb-5">
                {/* 自分 */}
                <div className="text-center flex-1">
                  <div className="w-14 h-14 rounded-xl bg-purple-900/40 flex items-center justify-center text-2xl mx-auto mb-1">🧑</div>
                  <p className="text-white font-bold text-sm">あなた</p>
                  <p className="text-purple-400 text-xs">{rankTitle.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">戦力 {playerPower.toLocaleString()}</p>
                </div>
                <div className="text-gray-500 font-black text-2xl px-2">VS</div>
                {/* 相手 */}
                <div className="text-center flex-1">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-1"
                    style={{ background: master ? elementGradient(master.element) : '#1a1a35' }}>
                    {master?.emoji ?? '👤'}
                  </div>
                  <p className="text-white font-bold text-sm">{opp.playerName}</p>
                  <p className="text-xs" style={{ color: oppTitle.color }}>{oppTitle.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">戦力 {opp.power.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-center text-xs mb-4" style={{ color: powerDiff >= 0 ? '#34d399' : '#f87171' }}>
                {powerDiff >= 0 ? `戦力差 +${powerDiff.toLocaleString()} 有利` : `戦力差 ${powerDiff.toLocaleString()} 不利`}
              </div>
              <div className="flex gap-3">
                <GameButton variant="secondary" fullWidth onClick={backToList}>キャンセル</GameButton>
                <GameButton variant="primary" fullWidth onClick={handleStartBattle}>バトル開始！</GameButton>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── バトルログ ── */}
      {phase === 'battle' && (
        <div className="px-4">
          <div className="card-base p-5 mb-4" style={{ minHeight: '320px' }}>
            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">バトルログ</p>
            <div className="space-y-1.5 mb-4">
              {battleLog.map((log, i) => (
                <p key={i} className={`text-sm font-mono ${
                  log.includes('勝利') ? 'text-yellow-400 font-bold' :
                  log.includes('敗北') ? 'text-red-400 font-bold' :
                  log.startsWith('⚔️') || log.startsWith('相手') ? 'text-purple-300' :
                  log === '' ? 'h-2 block' : 'text-gray-300'
                }`}>{log}</p>
              ))}
            </div>
          </div>
          {result && (
            <GameButton variant="primary" fullWidth onClick={() => setPhase('result')}>
              {result.won ? '🏆 結果を見る' : '💀 結果を見る'}
            </GameButton>
          )}
        </div>
      )}

      {/* ── 結果 ── */}
      {phase === 'result' && result && (
        <div className="px-4">
          <div className={`rounded-2xl p-6 text-center mb-4 ${result.won ? 'border border-yellow-700/40' : 'border border-red-900/40'}`}
            style={{ background: result.won ? 'linear-gradient(135deg,#1a1000,#3d2000)' : 'linear-gradient(135deg,#1a0000,#3d0000)' }}>
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
            <GameButton variant="secondary" fullWidth onClick={backToList}>戻る</GameButton>
            {currentOpponent && (
              <GameButton variant="primary" fullWidth onClick={() => { setPhase('confirm'); setResult(null); setBattleLog([]); }}>
                再挑戦
              </GameButton>
            )}
          </div>
        </div>
      )}

      {/* ── 階級一覧モーダル ── */}
      {showRankList && (
        <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowRankList(false); }}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl flex flex-col" style={{
            background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            maxHeight: '85vh',
          }}>
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <p className="text-white font-black text-center">🏆 アリーナ階級一覧</p>
              <p className="text-gray-500 text-xs text-center mt-1">現在: {record.points.toLocaleString()} pt</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {[...RANK_TITLES].sort((a, b) => a.min - b.min).map((t, i) => {
                const rankNo = i + 1;
                const isCurrent = t.label === rankTitle.label && t.min === rankTitle.min;
                const achieved = record.points >= t.min;
                return (
                  <div key={`${rankNo}_${t.min}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{
                      background: isCurrent ? `${t.color}22` : achieved ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: isCurrent ? `1px solid ${t.color}88` : '1px solid transparent',
                    }}>
                    <span className="text-gray-600 text-[10px] font-bold w-8 flex-shrink-0">No.{rankNo}</span>
                    <span className="flex-1 min-w-0 text-sm font-bold truncate"
                      style={{ color: achieved ? t.color : '#4b5563' }}>{t.label}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: achieved ? '#9ca3af' : '#374151' }}>
                      {t.min.toLocaleString()} pt〜
                    </span>
                    {isCurrent && <span className="text-[9px] font-black flex-shrink-0" style={{ color: t.color }}>現在</span>}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(100,80,140,0.2)' }}>
              <button onClick={() => setShowRankList(false)}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-400"
                style={{ background: 'rgba(40,30,60,0.6)', border: '1px solid rgba(100,80,140,0.3)' }}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
