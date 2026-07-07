import { useEffect, useState } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from '../../data/missions';
import { getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import type { MissionProgress } from '../../types';
import { GaugeBar } from '../../components/ui/game/GaugeBar';
import { GameButton } from '../../components/ui/game/GameButton';

type Tab = 'daily' | 'weekly';

export const MissionsPage = () => {
  const {
    daily, weeklyProgresses,
    checkDailyReset, checkWeeklyReset,
    claimDailyReward, claimWeeklyReward,
    getCompletedCount, getClaimedCount,
    getWeeklyCompletedCount, getWeeklyClaimedCount,
  } = useMissionStore();
  const [tab, setTab] = useState<Tab>('daily');

  useEffect(() => {
    checkDailyReset();
    checkWeeklyReset();
  }, [checkDailyReset, checkWeeklyReset]);

  const dailyCompleted = getCompletedCount();
  const dailyClaimed   = getClaimedCount();
  const dailyTotal     = DAILY_MISSIONS.length;

  const weeklyCompleted = getWeeklyCompletedCount();
  const weeklyClaimed   = getWeeklyClaimedCount();
  const weeklyTotal     = WEEKLY_MISSIONS.length;

  const renderMissions = (
    missions: typeof DAILY_MISSIONS,
    progresses: MissionProgress[],
    onClaim: (id: string) => void,
  ) => missions.map(mission => {
    const prog: MissionProgress = progresses.find(p => p.missionId === mission.id) ?? {
      missionId: mission.id, progress: 0, completed: false, claimed: false,
    };
    return (
      <div key={mission.id} className={`card-base p-4 transition-all ${
        prog.claimed ? 'opacity-50' : prog.completed ? 'border-yellow-600/40' : ''
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
            prog.completed ? 'bg-yellow-900/40 border border-yellow-700/40' : 'bg-gray-800/60'
          }`}>
            {prog.claimed ? '✓' : mission.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm mb-0.5 ${prog.claimed ? 'text-gray-500 line-through' : 'text-white'}`}>
              {mission.title}
            </p>
            <p className="text-gray-500 text-xs mb-2">{mission.description}</p>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{prog.progress} / {mission.target}</span>
              </div>
              <GaugeBar
                type={prog.completed ? 'exp' : 'mp'}
                value={prog.progress}
                max={mission.target}
                showLabel={false}
                animated={false}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {mission.rewards.map((r, i) => (
                <span key={i} className="text-xs bg-gray-800/60 rounded px-2 py-0.5 text-gray-300 border border-gray-700/40">
                  {r.type === 'gold' ? `🪙 ${r.amount.toLocaleString()}` :
                   r.type === 'diamond' ? `💎 ${r.amount}` :
                   r.type === 'stamina' ? `⚡ ${r.amount}` :
                   r.itemId ? `${getItemMaster(r.itemId)?.emoji ?? '📦'} ${getItemMaster(r.itemId)?.name ?? ''} ×${r.amount}` :
                   `📦 ×${r.amount}`}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 ml-1">
            {prog.claimed ? (
              <span className="text-xs text-gray-600">受取済</span>
            ) : prog.completed ? (
              <GameButton variant="gold" size="sm" onClick={() => onClaim(mission.id)}>
                受取
              </GameButton>
            ) : (
              <span className="text-xs text-gray-600">未達成</span>
            )}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="ミッション" />

      {/* タブ */}
      <div className="px-4 mb-4 flex gap-2">
        <button onClick={() => setTab('daily')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'daily' ? 'tab-active' : 'tab-inactive'}`}>
          📅 デイリー
        </button>
        <button onClick={() => setTab('weekly')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'weekly' ? 'tab-active' : 'tab-inactive'}`}>
          📆 ウィークリー
        </button>
      </div>

      {tab === 'daily' ? (
        <>
          <div className="mx-4 mb-5 card-base p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">本日の達成状況</p>
              <p className="text-white font-bold">{dailyCompleted}/{dailyTotal}</p>
            </div>
            <GaugeBar type="exp" value={dailyCompleted} max={dailyTotal} showLabel={false} />
            <p className="text-gray-600 text-xs mt-2">受取済み {dailyClaimed}/{dailyTotal}</p>
            {dailyCompleted === dailyTotal && dailyClaimed < dailyTotal && (
              <p className="text-yellow-400 text-xs font-bold mt-1 animate-glow">✓ 全ミッション達成！報酬を受け取ろう</p>
            )}
            {dailyClaimed === dailyTotal && (
              <p className="text-emerald-400 text-xs font-bold mt-1">🎉 本日の全報酬を受け取りました！</p>
            )}
          </div>
          <div className="px-4 space-y-2">
            {renderMissions(DAILY_MISSIONS, daily.progresses, claimDailyReward)}
          </div>
          <div className="text-center mt-6 pb-4">
            <p className="text-gray-600 text-xs">デイリーミッションは毎日0:00にリセット</p>
          </div>
        </>
      ) : (
        <>
          <div className="mx-4 mb-5 card-base p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">今週の達成状況</p>
              <p className="text-white font-bold">{weeklyCompleted}/{weeklyTotal}</p>
            </div>
            <GaugeBar type="exp" value={weeklyCompleted} max={weeklyTotal} showLabel={false} />
            <p className="text-gray-600 text-xs mt-2">受取済み {weeklyClaimed}/{weeklyTotal}</p>
            {weeklyCompleted === weeklyTotal && weeklyClaimed < weeklyTotal && (
              <p className="text-yellow-400 text-xs font-bold mt-1 animate-glow">✓ 全ウィークリー達成！報酬を受け取ろう</p>
            )}
            {weeklyClaimed === weeklyTotal && weeklyCompleted > 0 && (
              <p className="text-emerald-400 text-xs font-bold mt-1">🎉 今週の全報酬を受け取りました！</p>
            )}
          </div>
          <div className="px-4 space-y-2">
            {renderMissions(WEEKLY_MISSIONS, weeklyProgresses, claimWeeklyReward)}
          </div>
          <div className="text-center mt-6 pb-4">
            <p className="text-gray-600 text-xs">ウィークリーミッションは毎週月曜0:00にリセット</p>
          </div>
        </>
      )}
    </div>
  );
};
