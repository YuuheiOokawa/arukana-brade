import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { useLoginBonusStore } from '../../stores/loginBonusStore';
import { getActiveEvents, getActiveRaids } from '../../data/events';
import { formatCompact } from '../../utils/format';
import { RANK_EXP_TABLE } from '../../stores/playerStore';
import {
  IconSword, IconTeam, IconCrystal, IconArrowUp,
  IconGear, IconShield, IconDragon, IconScroll,
  IconTrophy, IconCastle, IconBag, IconFriends,
} from '../../components/ui/FantasyIcon';
import { LoginBonusModal } from '../login/LoginBonusModal';

const QUICK_ACTIONS = [
  { label: 'クエスト',  Icon: IconSword,    path: '/quests',   bg: 'linear-gradient(145deg,#6b0e0e,#3d0808)', accent: '#ef4444' },
  { label: 'ユニット',  Icon: IconTeam,     path: '/units',    bg: 'linear-gradient(145deg,#0e3a6b,#081e3d)', accent: '#3b82f6' },
  { label: '召喚',     Icon: IconCrystal,  path: '/summon',   bg: 'linear-gradient(145deg,#4a1080,#260850)', accent: '#8b5cf6' },
  { label: '強化',     Icon: IconArrowUp,  path: '/enhance',  bg: 'linear-gradient(145deg,#7a5200,#3d2900)', accent: '#f59e0b' },
  { label: '装備',     Icon: IconGear,     path: '/equipment',bg: 'linear-gradient(145deg,#334155,#1e2a3a)', accent: '#94a3b8' },
  { label: '編成',     Icon: IconShield,   path: '/party',    bg: 'linear-gradient(145deg,#064030,#021e17)', accent: '#10b981' },
  { label: 'アリーナ', Icon: IconTrophy,   path: '/pvp',      bg: 'linear-gradient(145deg,#3d2800,#1e1000)', accent: '#f59e0b' },
  { label: 'ショップ', Icon: IconBag,      path: '/shop',     bg: 'linear-gradient(145deg,#063040,#021820)', accent: '#22d3ee' },
  { label: 'フレンド', Icon: IconFriends,  path: '/social',   bg: 'linear-gradient(145deg,#2d1460,#120a30)', accent: '#a855f7' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { player, recoverStamina } = usePlayerStore();
  const { checkDailyReset, getCompletedCount, getClaimedCount } = useMissionStore();
  const { canClaim, markLoggedInToday } = useLoginBonusStore();
  const [showLoginBonus, setShowLoginBonus] = useState(false);
  const [staminaCd, setStaminaCd] = useState('');

  const updateCd = useCallback(() => {
    const { player: p } = usePlayerStore.getState();
    if (p.stamina >= p.maxStamina) { setStaminaCd(''); return; }
    const left = Math.max(0, p.staminaRecoveryTime - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    setStaminaCd(`${m}:${String(s).padStart(2, '0')}`);
  }, []);

  useEffect(() => {
    recoverStamina();
    checkDailyReset();
    updateCd();
    const interval = setInterval(recoverStamina, 60000);
    const cdInterval = setInterval(updateCd, 1000);
    // ログインボーナスを自動表示（当日初回ログイン時のみ）
    if (markLoggedInToday() && canClaim()) setTimeout(() => setShowLoginBonus(true), 800);
    return () => { clearInterval(interval); clearInterval(cdInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recoverStamina, checkDailyReset, updateCd]);

  const activeEvents = getActiveEvents();
  const activeRaids = getActiveRaids();
  const missionCompleted = getCompletedCount();
  const missionClaimed   = getClaimedCount();
  const missionPending   = missionCompleted - missionClaimed;
  const rankExpNeeded = RANK_EXP_TABLE[player.rank - 1] ?? 9999;
  const expPercent = Math.min(100, (player.exp / rankExpNeeded) * 100);

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
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(26,10,56,0.55) 0%, rgba(8,8,26,0.65) 55%)' }} />

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

      {/* ヒーローバナー (コンパクト) */}
      <div className="relative px-4 pt-4 pb-3 text-center">
        <h1 className="text-2xl font-black" style={{
          background: 'linear-gradient(160deg, #fde68a 0%, #f0c040 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>ARCANA BLADE</h1>
      </div>

      {/* プレイヤー情報パネル */}
      <div className="px-4 mb-3">
        <div className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, rgba(22,12,55,0.96) 0%, rgba(14,8,36,0.98) 100%)',
            border: '1px solid rgba(139,92,246,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          {/* 装飾ライン */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #a855f7, transparent)' }} />
          <div className="p-4">
            {/* 名前・ランク行 */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-0.5" style={{ color: '#6b7280' }}>SUMMONER</p>
                <p className="text-xl font-black text-white leading-none">{player.name}</p>
                {player.title && <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: '#a78bfa' }}>{player.title}</p>}
              </div>
              <div className="text-center">
                <div className="rounded-xl px-3 py-1.5" style={{ background: 'linear-gradient(135deg, rgba(240,192,64,0.15), rgba(217,119,6,0.1))', border: '1px solid rgba(240,192,64,0.3)' }}>
                  <p className="text-[9px] font-bold tracking-widest" style={{ color: '#d97706' }}>Lv</p>
                  <p className="text-2xl font-black leading-none" style={{
                    background: 'linear-gradient(135deg, #fde68a, #f0c040, #d97706)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{player.rank}</p>
                </div>
                {canClaim() && (
                  <button onClick={() => setShowLoginBonus(true)}
                    className="mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                    style={{ background: 'rgba(240,192,64,0.2)', color: '#f0c040', border: '1px solid rgba(240,192,64,0.4)' }}>
                    🎁 受取
                  </button>
                )}
              </div>
            </div>

            {/* EXPゲージ */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold" style={{ color: '#4b5563' }}>EXP</span>
                <span className="text-[10px]" style={{ color: '#6b7280' }}>{player.exp.toLocaleString()} / {rankExpNeeded.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)' }} />
              </div>
            </div>

            {/* スタミナ */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold" style={{ color: '#4b5563' }}>⚡ スタミナ</span>
                <div className="flex items-center gap-2">
                  {player.stamina < player.maxStamina && staminaCd && (
                    <span className="text-[9px]" style={{ color: '#6b7280' }}>次の回復まで {staminaCd}</span>
                  )}
                  <span className="text-[10px] font-bold" style={{ color: player.stamina >= player.maxStamina ? '#34d399' : '#f59e0b' }}>
                    {player.stamina} / {player.maxStamina}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (player.stamina / player.maxStamina) * 100)}%`,
                    background: player.stamina >= player.maxStamina ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  }} />
              </div>
            </div>

            {/* 通貨 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)' }}>
                <span className="text-lg">🪙</span>
                <div>
                  <p className="text-[9px] font-bold" style={{ color: '#6b7280' }}>GOLD</p>
                  <p className="text-sm font-black" style={{ color: '#f0c040' }}>{formatCompact(player.gold)}</p>
                </div>
              </div>
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(99,202,255,0.08)', border: '1px solid rgba(99,202,255,0.2)' }}>
                <span className="text-lg">💎</span>
                <div>
                  <p className="text-[9px] font-bold" style={{ color: '#6b7280' }}>DIAMOND</p>
                  <p className="text-sm font-black" style={{ color: '#7bc8ff' }}>{formatCompact(player.diamond)}</p>
                </div>
              </div>
            </div>
          </div>
          {/* 下装飾ライン */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
        </div>
      </div>

      {/* お知らせ */}
      <div className="px-4 space-y-2 mb-4" style={{ position: 'relative', zIndex: 2 }}>
        {missionPending > 0 && (
          <button onClick={() => navigate('/missions')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{
              background: 'linear-gradient(145deg, #6b3800, #3d2000)',
              border: '2px solid #f59e0b',
              boxShadow: '0 0 20px rgba(245,158,11,0.8), 0 4px 12px rgba(0,0,0,0.6)',
            }}>
            <IconScroll size={22} color="#fbbf24" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#fde68a' }}>デイリーミッション達成！</p>
              <p className="text-xs" style={{ color: '#fcd34d' }}>{missionPending} 件の報酬が受け取れます</p>
            </div>
            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
              {missionPending}
            </span>
          </button>
        )}
        {activeRaids.slice(0, 1).map(raid => (
          <button key={raid.id} onClick={() => navigate('/raid')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{
              background: 'linear-gradient(145deg, #3d0870, #1e0440)',
              border: '2px solid #a855f7',
              boxShadow: '0 0 20px rgba(168,85,247,0.8), 0 4px 12px rgba(0,0,0,0.6)',
            }}>
            <IconDragon size={22} color="#d8b4fe" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#e9d5ff' }}>{raid.name}</p>
              <p className="text-xs" style={{ color: '#c4b5fd' }}>レイドボス開催中！</p>
            </div>
            <span style={{ color: '#c4b5fd' }}>›</span>
          </button>
        ))}
        {activeEvents.slice(0, 1).map(event => (
          <button key={event.id} onClick={() => navigate('/quests')}
            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-98"
            style={{
              background: 'linear-gradient(145deg, #0a0870, #060548)',
              border: '2px solid #6366f1',
              boxShadow: '0 0 20px rgba(99,102,241,0.8), 0 4px 12px rgba(0,0,0,0.6)',
            }}>
            <IconSword size={22} color="#a5b4fc" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#c7d2fe' }}>{event.name}</p>
              <p className="text-xs" style={{ color: '#a5b4fc' }}>期間限定イベント開催中！</p>
            </div>
            <span style={{ color: '#a5b4fc' }}>›</span>
          </button>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="px-4 mb-4" style={{ position: 'relative', zIndex: 2 }}>
        <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#4b5563' }}>— メニュー —</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map(btn => {
            const IconComp = btn.Icon;
            return (
              <button key={btn.path} onClick={() => navigate(btn.path)}
                className="rounded-2xl p-3 flex flex-col items-center text-center transition-all active:scale-95 relative overflow-hidden"
                style={{
                  background: btn.bg,
                  border: `2px solid ${btn.accent}`,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 18px ${btn.accent}88`,
                }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent, ${btn.accent}50, transparent)`,
                }} />
                <IconComp size={24} color={btn.accent} />
                <p className="text-white font-black text-sm mt-2">{btn.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* コンテンツ一覧 */}
      <div className="px-4 grid grid-cols-2 gap-2.5 mb-4" style={{ position: 'relative', zIndex: 2 }}>
        {[
          { path: '/pvp',      label: 'アリーナ',   sub: 'PvP対戦',     Icon: IconTrophy,  accent: '#f59e0b', bg: 'linear-gradient(145deg,#3d2800,#1e1000)' },
          { path: '/guild',    label: 'ギルド',     sub: '仲間と協力',   Icon: IconCastle,  accent: '#8b5cf6', bg: 'linear-gradient(145deg,#2d1460,#120a30)' },
          { path: '/missions', label: 'ミッション', sub: 'デイリー報酬', Icon: IconScroll,  accent: '#10b981', bg: 'linear-gradient(145deg,#053828,#021c15)', badge: missionPending > 0 },
          { path: '/raid',     label: 'レイドボス', sub: '協力討伐',     Icon: IconDragon,  accent: '#ef4444', bg: 'linear-gradient(145deg,#3d0a0a,#1e0505)' },
        ].map(item => {
          const IconComp = item.Icon;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="rounded-2xl p-4 text-left transition-all active:scale-95 relative"
              style={{
                background: item.bg,
                border: `2px solid ${item.accent}`,
                boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 18px ${item.accent}88`,
              }}>
              <IconComp size={26} color={item.accent} />
              <p className="text-white font-black text-sm mt-2">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.sub}</p>
              {item.badge && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {missionPending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ログインボーナスモーダル */}
      {showLoginBonus && <LoginBonusModal onClose={() => setShowLoginBonus(false)} />}
    </div>
  );
};
