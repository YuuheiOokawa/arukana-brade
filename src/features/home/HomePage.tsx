import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { getActiveEvents, getActiveRaids } from '../../data/events';
import { formatNumber } from '../../utils/format';
import {
  IconSword, IconTeam, IconCrystal, IconArrowUp,
  IconGear, IconShield, IconTrophy, IconCastle,
  IconDragon, IconScroll,
} from '../../components/ui/FantasyIcon';
import { GaugeBar } from '../../components/ui/game/GaugeBar';
import { CurrencyIcon } from '../../components/ui/game/GameIcons';

const QUICK_ACTIONS = [
  { label: 'クエスト',  Icon: IconSword,   path: '/quests',   desc: 'ストーリー・イベント',  color: 'from-red-950/70 to-red-800/40',   accent: '#ef4444' },
  { label: 'ユニット',  Icon: IconTeam,    path: '/units',    desc: '所持ユニット管理',       color: 'from-blue-950/70 to-blue-800/40', accent: '#3b82f6' },
  { label: '召喚',     Icon: IconCrystal, path: '/summon',   desc: '新ユニット獲得',          color: 'from-purple-950/70 to-purple-800/40', accent: '#8b5cf6' },
  { label: '強化',     Icon: IconArrowUp, path: '/enhance',  desc: 'ユニット育成',            color: 'from-yellow-950/70 to-yellow-800/40', accent: '#f59e0b' },
  { label: '装備',     Icon: IconGear,    path: '/equipment',desc: '装備管理・強化',          color: 'from-slate-900/70 to-slate-700/40', accent: '#94a3b8' },
  { label: '編成',     Icon: IconShield,  path: '/party',    desc: 'パーティ設定',            color: 'from-emerald-950/70 to-emerald-800/40', accent: '#10b981' },
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

  const activeEvents = getActiveEvents();
  const activeRaids = getActiveRaids();
  const missionCompleted = getCompletedCount();
  const missionClaimed   = getClaimedCount();
  const missionPending   = missionCompleted - missionClaimed;

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* 背景画像 */}
      <img
        src="/assets/images/backgrounds/home/bg_ui_home_night.webp"
        alt=""
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{ opacity: 0.35 }}
      />
      {/* グラデーションオーバーレイ */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(26,10,56,0.82) 0%, rgba(8,8,26,0.88) 55%)' }} />

      {/* 背景装飾：魔法陣リング */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute" style={{
          top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'conic-gradient(from 0deg, transparent, rgba(139,92,246,.12), transparent, rgba(240,192,64,.07), transparent)',
          borderRadius: '50%',
          filter: 'blur(2px)',
          animation: 'spin 24s linear infinite',
        }} />
        <div className="absolute" style={{
          top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '340px', height: '340px',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '50%',
          animation: 'spin 18s linear infinite reverse',
        }} />
        {/* 星粒 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.35 + 0.05,
              animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }} />
        ))}
      </div>

      {/* ヒーローバナー */}
      <div className="relative px-4 pt-12 pb-8 text-center overflow-hidden">
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.4em] mb-2" style={{ color: '#8b5cf6' }}>DARK FANTASY RPG</p>
          <h1 className="text-4xl font-black mb-1" style={{
            background: 'linear-gradient(160deg, #fde68a 0%, #f0c040 40%, #f59e0b 70%, #d97706 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 16px rgba(240,192,64,0.35))',
          }}>アルカナブレイド</h1>
          <p className="text-xs" style={{ color: 'rgba(139,92,246,0.7)' }}>～ 剣と召喚の覇者 ～</p>
        </div>
      </div>

      {/* プレイヤー情報パネル */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(26,18,58,0.9), rgba(18,12,40,0.95))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          {/* 背景光 */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 30% 0%, rgba(139,92,246,0.12), transparent 60%)',
          }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>召喚士</p>
                <p className="text-lg font-black text-white">{player.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>ランク</p>
                <p className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #f0c040, #d97706)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{player.rank}</p>
              </div>
            </div>

            {/* 通貨 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                style={{ background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.18)' }}>
                <CurrencyIcon type="gold" size={32} />
                <div>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>ゴールド</p>
                  <p className="text-sm font-black" style={{ color: '#f0c040' }}>{formatNumber(player.gold)}</p>
                </div>
              </div>
              <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                style={{ background: 'rgba(99,202,255,0.08)', border: '1px solid rgba(99,202,255,0.18)' }}>
                <CurrencyIcon type="diamond" size={32} />
                <div>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>ダイヤ</p>
                  <p className="text-sm font-black" style={{ color: '#7bc8ff' }}>{formatNumber(player.diamond)}</p>
                </div>
              </div>
            </div>

            {/* スタミナ */}
            <GaugeBar type="stamina" value={player.stamina} max={player.maxStamina} />
          </div>
        </div>
      </div>

      {/* お知らせ */}
      <div className="px-4 space-y-2 mb-4">
        {missionPending > 0 && (
          <button onClick={() => navigate('/missions')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: 'linear-gradient(135deg, #1a1500, #3d2800)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <IconScroll size={22} color="#f59e0b" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#f59e0b' }}>デイリーミッション達成！</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>{missionPending} 件の報酬が受け取れます</p>
            </div>
            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
              {missionPending}
            </span>
          </button>
        )}
        {activeRaids.slice(0, 1).map(raid => (
          <button key={raid.id} onClick={() => navigate('/raid')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: raid.bannerColor, border: '1px solid rgba(139,92,246,0.3)' }}>
            <IconDragon size={22} color="#c4b5fd" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{raid.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>レイドボス開催中！</p>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>›</span>
          </button>
        ))}
        {activeEvents.slice(0, 1).map(event => (
          <button key={event.id} onClick={() => navigate('/quests')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{ background: event.bannerColor, border: '1px solid rgba(139,92,246,0.25)' }}>
            <IconSword size={22} color="#a78bfa" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{event.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>期間限定イベント開催中！</p>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>›</span>
          </button>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="px-4 mb-4">
        <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#4b5563' }}>— メニュー —</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(btn => {
            const IconComp = btn.Icon;
            return (
              <button key={btn.path} onClick={() => navigate(btn.path)}
                className="rounded-2xl p-3 text-left transition-all active:scale-95 relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${btn.color.split(' ').join(', ')})`,
                  border: `1px solid ${btn.accent}28`,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent, ${btn.accent}30, transparent)`,
                }} />
                <IconComp size={22} color={btn.accent} />
                <p className="text-white font-black text-sm mt-2">{btn.label}</p>
                <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{btn.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* コンテンツ一覧 */}
      <div className="px-4 grid grid-cols-2 gap-2.5 mb-4">
        {[
          { path: '/pvp',      label: 'アリーナ',   sub: 'PvP対戦',     Icon: IconTrophy,  accent: '#f59e0b' },
          { path: '/guild',    label: 'ギルド',     sub: '仲間と協力',   Icon: IconCastle,  accent: '#8b5cf6' },
          { path: '/missions', label: 'ミッション', sub: 'デイリー報酬', Icon: IconScroll,  accent: '#10b981', badge: missionPending > 0 },
          { path: '/raid',     label: 'レイドボス', sub: '協力討伐',     Icon: IconDragon,  accent: '#ef4444' },
        ].map(item => {
          const IconComp = item.Icon;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="rounded-2xl p-4 text-left transition-all active:scale-95 relative"
              style={{
                background: 'linear-gradient(145deg, rgba(26,18,58,0.9), rgba(14,10,30,0.95))',
                border: `1px solid ${item.accent}22`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}>
              <IconComp size={26} color={item.accent} />
              <p className="text-white font-black text-sm mt-2">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.sub}</p>
              {item.badge && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {missionPending}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
