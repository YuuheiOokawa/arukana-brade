import { useState } from 'react';
import { useLoginBonusStore, LOGIN_BONUS_SCHEDULE } from '../../stores/loginBonusStore';
import { usePlayerStore } from '../../stores/playerStore';

interface Props {
  onClose: () => void;
}

export const LoginBonusModal = ({ onClose }: Props) => {
  const { canClaim, claimToday, currentDay, claimedDays } = useLoginBonusStore();
  const { addGold, addDiamond, addItem } = usePlayerStore();
  const [claimed, setClaimed] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<typeof LOGIN_BONUS_SCHEDULE[0]['rewards']>([]);

  const handleClaim = () => {
    const reward = claimToday();
    if (!reward) return;
    for (const r of reward.rewards) {
      if (r.type === 'gold')    addGold(r.amount);
      if (r.type === 'diamond') addDiamond(r.amount);
      if (r.type === 'item' && r.itemId) addItem(r.itemId, r.amount);
      if (r.type === 'stamina') {
        usePlayerStore.setState(s => ({
          player: { ...s.player, stamina: Math.min(s.player.stamina + r.amount, s.player.maxStamina) },
        }));
      }
    }
    setClaimedRewards(reward.rewards);
    setClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl overflow-hidden animate-slide-bottom"
        style={{ background: 'linear-gradient(180deg, #1a0a40 0%, #100828 100%)', border: '1px solid rgba(139,92,246,0.4)', borderBottom: 'none', maxHeight: '85vh' }}>

        {/* ヘッダー */}
        <div className="px-5 pt-5 pb-3 text-center relative">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(139,92,246,0.4)' }} />
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: '#8b5cf6' }}>DAILY</p>
          <h2 className="text-2xl font-black text-white mb-0.5">ログインボーナス</h2>
          <p className="text-gray-400 text-xs">毎日ログインして報酬をゲット！</p>
        </div>

        {/* カレンダーグリッド */}
        <div className="px-4 pb-2 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <div className="grid grid-cols-5 gap-1.5">
            {LOGIN_BONUS_SCHEDULE.slice(0, 30).map(day => {
              const isCurrent = day.day === currentDay;
              const isClaimed = claimedDays.includes(day.day);
              return (
                <div key={day.day}
                  className="rounded-xl p-1.5 flex flex-col items-center gap-0.5 relative"
                  style={{
                    background: isClaimed ? 'rgba(139,92,246,0.15)' : isCurrent ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isClaimed ? 'rgba(139,92,246,0.4)' : isCurrent ? 'rgba(240,192,64,0.6)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <span style={{ fontSize: 9, color: isCurrent ? '#f0c040' : '#4b5563', fontWeight: 700 }}>DAY{day.day}</span>
                  <span style={{ fontSize: 16 }}>{day.rewards[0].emoji}</span>
                  <span style={{ fontSize: 7, color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>
                    {day.rewards[0].label.slice(0, 6)}
                  </span>
                  {isClaimed && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <span style={{ fontSize: 18 }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 受取ボタン or 受取済み */}
        <div className="px-4 py-4">
          {claimed ? (
            <div className="text-center">
              <p className="text-yellow-400 font-bold mb-2">受取完了！</p>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {claimedRewards.map((r, i) => (
                  <div key={i} className="flex items-center gap-1 rounded-full px-2 py-1"
                    style={{ background: 'rgba(240,192,64,0.15)', border: '1px solid rgba(240,192,64,0.3)' }}>
                    <span>{r.emoji}</span>
                    <span className="text-yellow-400 text-xs font-bold">{r.label} ×{r.amount}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                閉じる
              </button>
            </div>
          ) : canClaim() ? (
            <button onClick={handleClaim}
              className="w-full py-3.5 rounded-xl font-black text-white text-lg transition-all active:scale-98"
              style={{ background: 'linear-gradient(135deg, #f0c040, #d97706)', boxShadow: '0 4px 20px rgba(240,192,64,0.4)' }}>
              🎁 DAY {currentDay} の報酬を受け取る
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-gray-400 font-bold">本日は受取済みです</p>
              <p className="text-gray-600 text-xs mt-0.5">明日また来てね！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
