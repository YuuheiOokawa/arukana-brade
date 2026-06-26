import { useEffect } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { DAILY_MISSIONS } from '../../data/missions';
import { TopBar } from '../../components/layout/TopBar';
import type { MissionProgress } from '../../types';
import { GaugeBar } from '../../components/ui/game/GaugeBar';

export const MissionsPage = () => {
  const { daily, checkDailyReset, claimDailyReward, getCompletedCount, getClaimedCount } = useMissionStore();

  useEffect(() => { checkDailyReset(); }, [checkDailyReset]);

  const completed = getCompletedCount();
  const claimed   = getClaimedCount();
  const total     = DAILY_MISSIONS.length;

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="デイリーミッション" />

      {/* 進捗サマリ */}
      <div className="mx-4 mb-5 card-base p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">本日の達成状況</p>
          <p className="text-white font-bold">{completed}/{total}</p>
        </div>
        <GaugeBar type="exp" value={completed} max={total} showLabel={false} />
        <p className="text-gray-600 text-xs mt-2">受取済み {claimed}/{total}</p>
        {completed === total && claimed < total && (
          <p className="text-yellow-400 text-xs font-bold mt-1 animate-glow">✓ 全ミッション達成！報酬を受け取ろう</p>
        )}
        {claimed === total && (
          <p className="text-emerald-400 text-xs font-bold mt-1">🎉 本日の全報酬を受け取りました！</p>
        )}
      </div>

      {/* ミッションリスト */}
      <div className="px-4 space-y-2">
        {DAILY_MISSIONS.map(mission => {
          const prog: MissionProgress = daily.progresses.find(p => p.missionId === mission.id) ?? {
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

                  {/* 進捗バー */}
                  <div className="mb-2">
                    <GaugeBar
                      type={prog.completed ? 'exp' : 'mp'}
                      value={prog.progress}
                      max={mission.target}
                      showLabel={false}
                      animated={false}
                    />
                  </div>

                  {/* 報酬表示 */}
                  <div className="flex flex-wrap gap-1.5">
                    {mission.rewards.map((r, i) => (
                      <span key={i} className="text-xs bg-gray-800/60 rounded px-2 py-0.5 text-gray-300 border border-gray-700/40">
                        {r.type === 'gold' ? `🪙 ${r.amount.toLocaleString()}` :
                         r.type === 'diamond' ? `💎 ${r.amount}` :
                         r.type === 'stamina' ? `⚡ ${r.amount}` :
                         `📦 ×${r.amount}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 受取ボタン */}
                <div className="flex-shrink-0 ml-1">
                  {prog.claimed ? (
                    <span className="text-xs text-gray-600">受取済</span>
                  ) : prog.completed ? (
                    <button
                      onClick={() => claimDailyReward(mission.id)}
                      className="btn-gold text-xs px-3 py-2 rounded-xl min-h-0 font-bold"
                    >
                      受取
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">未達成</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* リセット時刻 */}
      <div className="text-center mt-6 pb-4">
        <p className="text-gray-600 text-xs">ミッションは毎日0:00にリセットされます</p>
      </div>
    </div>
  );
};
