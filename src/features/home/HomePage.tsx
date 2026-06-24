import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { getActiveEvents, getActiveRaids } from '../../data/events';
import { formatNumber } from '../../utils/format';

const QUICK_ACTIONS = [
  { label: 'クエスト',  icon: '⚔️', path: '/quests',  desc: 'ストーリー・イベント',  color: 'from-red-900/60 to-red-700/40' },
  { label: 'ユニット',  icon: '👥', path: '/units',   desc: '所持ユニット管理',       color: 'from-blue-900/60 to-blue-700/40' },
  { label: '召喚',     icon: '✨', path: '/summon',  desc: '新ユニット獲得',          color: 'from-purple-900/60 to-purple-700/40' },
  { label: '強化',     icon: '⬆️', path: '/enhance', desc: 'ユニット育成',            color: 'from-yellow-900/60 to-yellow-700/40' },
  { label: '装備',     icon: '🗡️', path: '/equipment', desc: '装備管理・強化',        color: 'from-gray-800/60 to-gray-700/40' },
  { label: '編成',     icon: '🛡️', path: '/party',   desc: 'パーティ設定',           color: 'from-green-900/60 to-green-700/40' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { player, recoverStamina } = usePlayerStore();
  const { checkDailyReset, getCompletedCount, getClaimedCount } = useMissionStore();

  useEffect(() => {
    recoverStamina();
    checkDailyReset();
    const interval = setInterval(recoverStamina, 60000);
    return () => clearInterval(interval);
  }, [recoverStamina, checkDailyReset]);

  const staminaPct = (player.stamina / player.maxStamina) * 100;
  const activeEvents = getActiveEvents();
  const activeRaids = getActiveRaids();
  const missionCompleted = getCompletedCount();
  const missionClaimed   = getClaimedCount();
  const missionPending   = missionCompleted - missionClaimed;

  return (
    <div className="min-h-screen pb-28">
      {/* ヒーローバナー */}
      <div className="relative px-4 pt-10 pb-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-25"
          style={{ background: 'radial-gradient(ellipse at center top, #7c3aed 0%, transparent 65%)' }} />
        <div className="relative">
          <p className="text-purple-400 text-xs font-bold tracking-widest mb-2">DARK FANTASY RPG</p>
          <h1 className="text-4xl font-black mb-1 text-gradient-gold">アルカナブレイド</h1>
          <p className="text-gray-500 text-sm">～剣と召喚の覇者～</p>
        </div>
      </div>

      {/* プレイヤー情報 */}
      <div className="px-4 mb-4">
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-xs">プレイヤー</p>
              <p className="text-white font-bold text-lg">{player.name}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">ランク</p>
              <p className="text-gradient-gold font-black text-2xl">{player.rank}</p>
            </div>
          </div>

          {/* 通貨 */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-black/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <span>🪙</span>
              <div>
                <p className="text-xs text-gray-500">ゴールド</p>
                <p className="text-yellow-400 font-bold text-sm">{formatNumber(player.gold)}</p>
              </div>
            </div>
            <div className="flex-1 bg-black/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <span>💎</span>
              <div>
                <p className="text-xs text-gray-500">ダイヤ</p>
                <p className="text-blue-300 font-bold text-sm">{formatNumber(player.diamond)}</p>
              </div>
            </div>
          </div>

          {/* スタミナ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">⚡ スタミナ</span>
              <span className="text-xs text-yellow-400 font-bold">{player.stamina} / {player.maxStamina}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${staminaPct}%`,
                  background: staminaPct > 50 ? 'linear-gradient(90deg, #059669, #34d399)' :
                              staminaPct > 20 ? 'linear-gradient(90deg, #d97706, #f59e0b)' :
                                               'linear-gradient(90deg, #b91c1c, #ef4444)',
                  boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* お知らせバナー群 */}
      <div className="px-4 space-y-2 mb-4">
        {/* デイリーミッション */}
        {missionPending > 0 && (
          <button onClick={() => navigate('/missions')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: 'linear-gradient(135deg, #1a1500, #3d2800)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <p className="text-yellow-400 font-bold text-sm">デイリーミッション達成！</p>
              <p className="text-gray-400 text-xs">{missionPending} 件の報酬が受け取れます</p>
            </div>
            <span className="text-yellow-400 font-black text-lg">{missionPending}</span>
          </button>
        )}

        {/* アクティブレイド */}
        {activeRaids.slice(0, 1).map(raid => (
          <button key={raid.id} onClick={() => navigate('/raid')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: raid.bannerColor, border: '1px solid rgba(139,92,246,0.3)' }}>
            <span className="text-2xl">{raid.emoji}</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{raid.name}</p>
              <p className="text-gray-300 text-xs">レイドボス開催中！</p>
            </div>
            <span className="text-white/60 text-lg">›</span>
          </button>
        ))}

        {/* アクティブイベント */}
        {activeEvents.slice(0, 1).map(event => (
          <button key={event.id} onClick={() => navigate('/quests')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: event.bannerColor, border: '1px solid rgba(139,92,246,0.25)' }}>
            <span className="text-2xl">{event.emoji}</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{event.name}</p>
              <p className="text-gray-300 text-xs">期間限定イベント開催中！</p>
            </div>
            <span className="text-white/60 text-lg">›</span>
          </button>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="px-4 mb-4">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-3">メニュー</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(btn => (
            <button key={btn.path} onClick={() => navigate(btn.path)}
              className={`card-base p-3 text-left active:scale-95 transition-all unit-card-hover`}>
              <div className="text-2xl mb-1.5">{btn.icon}</div>
              <p className="text-white font-bold text-sm">{btn.label}</p>
              <p className="text-gray-500 text-[10px] leading-tight mt-0.5">{btn.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ一覧 */}
      <div className="px-4 grid grid-cols-2 gap-2.5 mb-4">
        <button onClick={() => navigate('/pvp')} className="card-base p-4 text-left unit-card-hover">
          <div className="text-3xl mb-1.5">🏆</div>
          <p className="text-white font-bold">アリーナ</p>
          <p className="text-gray-500 text-xs">PvP対戦</p>
        </button>
        <button onClick={() => navigate('/guild')} className="card-base p-4 text-left unit-card-hover">
          <div className="text-3xl mb-1.5">🏰</div>
          <p className="text-white font-bold">ギルド</p>
          <p className="text-gray-500 text-xs">仲間と協力</p>
        </button>
        <button onClick={() => navigate('/missions')} className="card-base p-4 text-left unit-card-hover relative">
          <div className="text-3xl mb-1.5">🎯</div>
          <p className="text-white font-bold">ミッション</p>
          <p className="text-gray-500 text-xs">デイリー報酬</p>
          {missionPending > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {missionPending}
            </span>
          )}
        </button>
        <button onClick={() => navigate('/raid')} className="card-base p-4 text-left unit-card-hover">
          <div className="text-3xl mb-1.5">🐲</div>
          <p className="text-white font-bold">レイドボス</p>
          <p className="text-gray-500 text-xs">協力討伐</p>
        </button>
      </div>
    </div>
  );
};
