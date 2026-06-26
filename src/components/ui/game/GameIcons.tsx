import type { JSX } from 'react';
import './GameUI.css';

/* ================================================================
   ナビゲーションアイコン 48×48 (8種)
   ================================================================ */

type NavIconType = 'home' | 'quest' | 'unit' | 'summon' | 'profile' | 'shop' | 'guild' | 'arena';

interface NavIconProps {
  type: NavIconType;
  active?: boolean;
  onClick?: () => void;
  size?: number;
  showLabel?: boolean;
}

const NAV_LABELS: Record<NavIconType, string> = {
  home:    'ホーム',
  quest:   'クエスト',
  unit:    'ユニット',
  summon:  '召喚',
  profile: 'プロフィール',
  shop:    'ショップ',
  guild:   'ギルド',
  arena:   'アリーナ',
};

const NavSvg = ({ type, color }: { type: NavIconType; color: string }) => {
  const svgProps = { width: 26, height: 26, viewBox: '0 0 26 26', fill: 'none' };
  switch (type) {
    case 'home':
      return (
        <svg {...svgProps}>
          <path d="M3 12L13 3L23 12V22H17V16H9V22H3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color + '22'}/>
          <rect x="10" y="16" width="6" height="6" rx="1" fill={color + '44'}/>
        </svg>
      );
    case 'quest':
      return (
        <svg {...svgProps}>
          {/* 剣 */}
          <path d="M18 3L23 8L11 20L6 22L8 17Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color + '22'}/>
          <path d="M18 3L20 5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          {/* 盾 */}
          <path d="M4 7V12C4 15 6.5 17 7 17C7.5 17 10 15 10 12V7L7 6Z" stroke={color} strokeWidth="1.5" fill={color + '22'}/>
          <path d="M7 9V14" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M5.5 11.5H8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case 'unit':
      return (
        <svg {...svgProps}>
          {/* 人物 */}
          <circle cx="13" cy="8" r="4" stroke={color} strokeWidth="1.8" fill={color + '22'}/>
          <path d="M5 22C5 17.6 8.6 14 13 14C17.4 14 21 17.6 21 22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          {/* 追加人物（右後ろ） */}
          <circle cx="19" cy="9" r="2.5" stroke={color} strokeWidth="1.4" fill={color + '22'} opacity=".6"/>
          <path d="M22 22C22 19.5 20.5 17.5 19 17.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity=".6"/>
        </svg>
      );
    case 'summon':
      return (
        <svg {...svgProps}>
          {/* クリスタル */}
          <path d="M13 2L20 8L22 15L13 24L4 15L6 8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color + '18'}/>
          <path d="M6 8L13 2L20 8L13 12Z" fill={color + '33'}/>
          <path d="M13 2L13 12" stroke={color} strokeWidth="1" opacity=".5"/>
          <path d="M6 8L13 12L20 8" stroke={color} strokeWidth="1" opacity=".5"/>
          {/* 光沢 */}
          <path d="M10 5L13 3L11 8Z" fill="rgba(255,255,255,.3)"/>
        </svg>
      );
    case 'profile':
      return (
        <svg {...svgProps}>
          {/* 王冠 */}
          <path d="M4 16L6 9L10 13L13 6L16 13L20 9L22 16Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color + '22'}/>
          <rect x="4" y="16" width="18" height="4" rx="1.5" fill={color + '33'} stroke={color} strokeWidth="1.5"/>
          <circle cx="7" cy="18" r="1.5" fill={color}/>
          <circle cx="13" cy="18" r="1.5" fill={color}/>
          <circle cx="19" cy="18" r="1.5" fill={color}/>
          <circle cx="13" cy="7" r="2" fill={color + 'aa'}/>
        </svg>
      );
    case 'shop':
      return (
        <svg {...svgProps}>
          {/* バッグ */}
          <path d="M5 9H21L19 22H7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={color + '22'}/>
          <path d="M9 9V7C9 4.8 11 3 13 3C15 3 17 4.8 17 7V9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          {/* コインマーク */}
          <circle cx="13" cy="15" r="3" stroke={color} strokeWidth="1.5" fill={color + '22'}/>
          <path d="M12 14V16" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M11.5 14.5H14.5" stroke={color} strokeWidth="1" strokeLinecap="round"/>
          <path d="M11.5 15.5H14.5" stroke={color} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case 'guild':
      return (
        <svg {...svgProps}>
          {/* 城 */}
          <rect x="5" y="10" width="16" height="14" rx="1" stroke={color} strokeWidth="1.8" fill={color + '18'}/>
          {/* 塔 */}
          <rect x="3" y="7" width="5" height="7" stroke={color} strokeWidth="1.5" fill={color + '18'}/>
          <rect x="18" y="7" width="5" height="7" stroke={color} strokeWidth="1.5" fill={color + '18'}/>
          {/* 塔の鋸歯 */}
          <rect x="3" y="5" width="1.5" height="3" fill={color}/>
          <rect x="5.5" y="5" width="1.5" height="3" fill={color}/>
          <rect x="18" y="5" width="1.5" height="3" fill={color}/>
          <rect x="20.5" y="5" width="1.5" height="3" fill={color}/>
          {/* 門 */}
          <path d="M10 24V18C10 15.8 11.8 14 14 14C16.2 14 18 15.8 18 18V24" stroke={color} strokeWidth="1.5"/>
          <circle cx="11.5" cy="17.5" r="1" fill={color}/>
          <circle cx="16.5" cy="17.5" r="1" fill={color}/>
          {/* 旗 */}
          <path d="M13 4V10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M13 4L17 6L13 8Z" fill={color}/>
        </svg>
      );
    case 'arena':
      return (
        <svg {...svgProps}>
          {/* トロフィー */}
          <path d="M8 3H18V13C18 17 15.5 19 13 19C10.5 19 8 17 8 13Z" stroke={color} strokeWidth="1.8" fill={color + '18'}/>
          {/* ハンドル */}
          <path d="M8 6C8 6 4 6 4 10C4 13 6 14 8 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M18 6C18 6 22 6 22 10C22 13 20 14 18 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* 台座 */}
          <path d="M10 19V22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 19V22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <rect x="8" y="22" width="10" height="2" rx="1" fill={color}/>
          {/* 星 */}
          <path d="M13 7L14 9.5H17L15 11L16 13.5L13 12L10 13.5L11 11L9 9.5H12Z"
            fill={color + 'cc'} stroke={color} strokeWidth=".5"/>
        </svg>
      );
    default:
      return null;
  }
};

export const GameNavIcon = ({ type, active = false, onClick, size = 48, showLabel = true }: NavIconProps) => (
  <div className="gb-nav-icon" onClick={onClick} style={{ width: size }}>
    <div
      className={`gb-nav-icon-bg ${active ? 'gb-nav-icon-bg-active' : 'gb-nav-icon-bg-default'}`}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    >
      <NavSvg type={type} color={active ? '#c4b5fd' : '#6b7280'} />
      {active && (
        <div style={{
          position: 'absolute',
          top: 4, left: 4, right: 4, height: '40%',
          background: 'rgba(255,255,255,.08)',
          borderRadius: size * 0.2,
        }} />
      )}
    </div>
    {showLabel && (
      <span className={`gb-nav-icon-label ${active ? 'gb-nav-icon-label-active' : ''}`}>
        {NAV_LABELS[type]}
      </span>
    )}
    {active && <div className="gb-nav-active-dot" />}
  </div>
);

/* ================================================================
   状態異常アイコン 48×48 (16種)
   ================================================================ */

type StatusType =
  | 'poison' | 'burn' | 'paralysis' | 'freeze'
  | 'sleep' | 'dark' | 'silence' | 'stone'
  | 'confusion' | 'charm' | 'def_up' | 'atk_up'
  | 'rec_up' | 'critical' | 'death_resist' | 'reflect';

interface StatusIconProps {
  type: StatusType;
  size?: number;
}

const STATUS_META: Record<StatusType, {
  label: string;
  bg: string;
  border: string;
  glow: string;
  svg: (size: number) => JSX.Element;
}> = {
  poison: {
    label: '毒',
    bg: 'linear-gradient(160deg, #4a1080, #2d0060)',
    border: 'rgba(180,50,255,.6)',
    glow: 'rgba(180,50,255,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 骸骨 */}
        <circle cx="14" cy="11" r="7" fill="#c084fc" stroke="#a855f7" strokeWidth="1"/>
        <circle cx="11" cy="11" r="2" fill="#1a0040"/>
        <circle cx="17" cy="11" r="2" fill="#1a0040"/>
        <path d="M11 16H17M12 16V18H14V16M14 16V18H16V16" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M9 18H19V20C19 21 18 21.5 14 21.5C10 21.5 9 21 9 20Z" fill="#c084fc" stroke="#a855f7" strokeWidth=".8"/>
        {/* 液滴 */}
        <path d="M4 4L5 8L3 8Z" fill="#e879f9" opacity=".7"/>
        <path d="M22 6L23 10L21 10Z" fill="#e879f9" opacity=".7"/>
      </svg>
    ),
  },
  burn: {
    label: 'やけど',
    bg: 'linear-gradient(160deg, #7c1d1d, #450a0a)',
    border: 'rgba(251,146,60,.6)',
    glow: 'rgba(239,68,68,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        <path d="M14 22C9 22 6 18 6 14C6 10 8 8 10 7C10 9 11 10 12 10C12 7 13 4 16 2C15 5 18 7 19 10C20 8 20 6 19 5C23 8 23 14 21 17C20 18 19 19 18 20C18 18 17 17 16 17C17 15 17 13 16 12C15 15 13 17 14 22Z"
          fill="url(#fire-g)" stroke="rgba(251,146,60,.5)" strokeWidth=".5"/>
        <defs>
          <linearGradient id="fire-g" x1="14" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047"/>
            <stop offset=".4" stopColor="#f97316"/>
            <stop offset="1" stopColor="#b91c1c"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  paralysis: {
    label: '麻痺',
    bg: 'linear-gradient(160deg, #713f12, #3d1a00)',
    border: 'rgba(250,204,21,.6)',
    glow: 'rgba(234,179,8,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        <path d="M15 2L8 14H14L9 26L22 11H15Z" fill="url(#bolt-g)" stroke="rgba(250,204,21,.4)" strokeWidth=".8"/>
        <defs>
          <linearGradient id="bolt-g" x1="8" y1="2" x2="22" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a"/>
            <stop offset="1" stopColor="#ca8a04"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  freeze: {
    label: '氷結',
    bg: 'linear-gradient(160deg, #1e3a5f, #0c1a2e)',
    border: 'rgba(147,210,255,.6)',
    glow: 'rgba(96,165,250,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 雪の結晶 */}
        <path d="M14 2V26M2 14H26M5.6 5.6L22.4 22.4M22.4 5.6L5.6 22.4"
          stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="3" fill="#bfdbfe" stroke="#60a5fa" strokeWidth=".8"/>
        {/* 枝の装飾 */}
        {[[14,2],[14,26],[2,14],[26,14],[5.6,5.6],[22.4,22.4],[22.4,5.6],[5.6,22.4]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#93c5fd"/>
        ))}
      </svg>
    ),
  },
  sleep: {
    label: '睡眠',
    bg: 'linear-gradient(160deg, #1e3a5f, #0f1f33)',
    border: 'rgba(148,163,184,.5)',
    glow: 'rgba(100,116,139,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        <text x="5" y="18" fontFamily="serif" fontWeight="900" fontSize="14" fill="#cbd5e1">Z</text>
        <text x="12" y="13" fontFamily="serif" fontWeight="900" fontSize="10" fill="#94a3b8">Z</text>
        <text x="17" y="9" fontFamily="serif" fontWeight="900" fontSize="7" fill="#64748b">Z</text>
        <path d="M8 22C8 22 10 24 14 22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  dark: {
    label: '闇',
    bg: 'linear-gradient(160deg, #0f0a1e, #06040f)',
    border: 'rgba(139,92,246,.5)',
    glow: 'rgba(109,40,217,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 月 */}
        <path d="M20 14C20 19 16.4 23 12 23C10 23 8.2 22.3 6.8 21C9 21 14 18 14 14C14 10 9 7 6.8 7C8.2 5.7 10 5 12 5C16.4 5 20 9 20 14Z"
          fill="url(#moon-g)" stroke="rgba(139,92,246,.4)" strokeWidth=".5"/>
        <defs>
          <radialGradient id="moon-g" cx="70%" cy="30%">
            <stop stopColor="#c4b5fd"/>
            <stop offset="1" stopColor="#4c1d95"/>
          </radialGradient>
        </defs>
        {/* 星 */}
        <circle cx="22" cy="8" r="1.5" fill="#e9d5ff"/>
        <circle cx="6" cy="16" r="1" fill="#e9d5ff" opacity=".6"/>
        <circle cx="24" cy="18" r="1" fill="#e9d5ff" opacity=".5"/>
      </svg>
    ),
  },
  silence: {
    label: '沈黙',
    bg: 'linear-gradient(160deg, #374151, #1f2937)',
    border: 'rgba(156,163,175,.4)',
    glow: 'rgba(107,114,128,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 吹き出し × */}
        <rect x="4" y="6" width="20" height="14" rx="4" fill="#4b5563" stroke="#9ca3af" strokeWidth="1"/>
        <path d="M4 20L2 24L8 20" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" strokeLinejoin="round"/>
        {/* × マーク */}
        <path d="M10 10L18 18M18 10L10 18" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  stone: {
    label: '石化',
    bg: 'linear-gradient(160deg, #44403c, #1c1917)',
    border: 'rgba(168,162,158,.5)',
    glow: 'rgba(120,113,108,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 石像シルエット */}
        <circle cx="14" cy="9" r="5" fill="#78716c" stroke="#a8a29e" strokeWidth="1"/>
        <path d="M9 14C9 14 7 22 10 24H18C21 22 19 14 19 14" fill="#78716c" stroke="#a8a29e" strokeWidth="1" strokeLinejoin="round"/>
        {/* 亀裂 */}
        <path d="M12 6L11 9L13 11" stroke="#57534e" strokeWidth="1" strokeLinecap="round"/>
        <path d="M11 16L13 20L12 22" stroke="#57534e" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  confusion: {
    label: '混乱',
    bg: 'linear-gradient(160deg, #701a75, #3b0764)',
    border: 'rgba(232,121,249,.5)',
    glow: 'rgba(192,38,211,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#e879f9" strokeWidth="1.5" fill="rgba(192,38,211,.15)"/>
        <text x="9" y="20" fontFamily="serif" fontWeight="900" fontSize="16" fill="#e879f9">?</text>
        {/* 星アイコン（混乱エフェクト） */}
        <path d="M22 5L23 7L25 7L23.5 8.5L24 11L22 9.5L20 11L20.5 8.5L19 7L21 7Z"
          fill="#f0abfc" opacity=".8"/>
      </svg>
    ),
  },
  charm: {
    label: '魅了',
    bg: 'linear-gradient(160deg, #831843, #4c0519)',
    border: 'rgba(251,113,133,.6)',
    glow: 'rgba(244,63,94,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        <path d="M14 22C14 22 4 16 4 10C4 7 6 5 9 5C11 5 13 6.5 14 8C15 6.5 17 5 19 5C22 5 24 7 24 10C24 16 14 22 14 22Z"
          fill="url(#heart-g)" stroke="rgba(251,113,133,.5)" strokeWidth=".8"/>
        <path d="M14 10L14 8" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="heart-g" x1="4" y1="5" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fda4af"/>
            <stop offset="1" stopColor="#be123c"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  def_up: {
    label: '防御UP',
    bg: 'linear-gradient(160deg, #1e3a5f, #0d2240)',
    border: 'rgba(96,165,250,.6)',
    glow: 'rgba(59,130,246,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 盾 */}
        <path d="M14 3L23 7V14C23 18.5 19 22 14 24C9 22 5 18.5 5 14V7Z"
          fill="rgba(59,130,246,.25)" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* 上矢印 */}
        <path d="M14 20V12M10 16L14 12L18 16" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  atk_up: {
    label: '攻撃UP',
    bg: 'linear-gradient(160deg, #7c1d1d, #450a0a)',
    border: 'rgba(248,113,113,.6)',
    glow: 'rgba(220,38,38,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 剣 */}
        <path d="M16 3L25 12L13 24L8 26L10 21Z" fill="rgba(239,68,68,.25)" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 3L18 5" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round"/>
        {/* 上矢印 */}
        <path d="M5 20V13M2 16L5 13L8 16" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  rec_up: {
    label: '回復UP',
    bg: 'linear-gradient(160deg, #14532d, #052e16)',
    border: 'rgba(74,222,128,.6)',
    glow: 'rgba(22,163,74,.4)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 十字 */}
        <rect x="11" y="4" width="6" height="20" rx="2" fill="rgba(34,197,94,.3)" stroke="#4ade80" strokeWidth="1.2"/>
        <rect x="4" y="11" width="20" height="6" rx="2" fill="rgba(34,197,94,.3)" stroke="#4ade80" strokeWidth="1.2"/>
        {/* 上矢印 */}
        <path d="M23 7V3M21 5L23 3L25 5" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  critical: {
    label: 'クリティカル',
    bg: 'linear-gradient(160deg, #78350f, #3c1404)',
    border: 'rgba(251,191,36,.6)',
    glow: 'rgba(217,119,6,.5)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* ！マーク（スター型） */}
        <path d="M14 2L16 8.5H23L17.5 12.5L19.5 19L14 15L8.5 19L10.5 12.5L5 8.5H12Z"
          fill="url(#crit-g)" stroke="rgba(251,191,36,.5)" strokeWidth=".8"/>
        {/* 「！」 */}
        <rect x="12.5" y="6" width="3" height="7" rx="1" fill="rgba(0,0,0,.5)"/>
        <circle cx="14" cy="15" r="1.5" fill="rgba(0,0,0,.5)"/>
        <defs>
          <linearGradient id="crit-g" x1="5" y1="2" x2="23" y2="19" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a"/>
            <stop offset=".5" stopColor="#f59e0b"/>
            <stop offset="1" stopColor="#b45309"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  death_resist: {
    label: '耐死耐性',
    bg: 'linear-gradient(160deg, #1a1a2e, #0d0d1e)',
    border: 'rgba(167,139,250,.5)',
    glow: 'rgba(109,40,217,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 盾 */}
        <path d="M14 3L23 7V14C23 18.5 19 22 14 24C9 22 5 18.5 5 14V7Z"
          fill="rgba(88,28,135,.25)" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* 骸骨ミニ */}
        <circle cx="14" cy="12" r="3.5" fill="#7c3aed" stroke="#a78bfa" strokeWidth=".8"/>
        <circle cx="12.5" cy="12" r="1" fill="#0f0a1e"/>
        <circle cx="15.5" cy="12" r="1" fill="#0f0a1e"/>
        <path d="M12 15H16M12.5 15V16.5H14V15M14 15V16.5H15.5V15" stroke="#a78bfa" strokeWidth=".8"/>
      </svg>
    ),
  },
  reflect: {
    label: '反射',
    bg: 'linear-gradient(160deg, #0f2a20, #061510)',
    border: 'rgba(52,211,153,.5)',
    glow: 'rgba(16,185,129,.3)',
    svg: (s) => (
      <svg width={s*0.58} height={s*0.58} viewBox="0 0 28 28" fill="none">
        {/* 反射矢印 */}
        <path d="M5 18L14 8L23 18" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M10 18L14 22L18 18" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* 光線 */}
        <path d="M14 8V4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
        <circle cx="14" cy="3" r="1.5" fill="#6ee7b7"/>
      </svg>
    ),
  },
};

export const StatusIcon = ({ type, size = 48 }: StatusIconProps) => {
  const meta = STATUS_META[type];
  return (
    <div
      className="gb-status-icon"
      style={{
        width: size,
        height: size,
        background: meta.bg,
        border: `1.5px solid ${meta.border}`,
        boxShadow: `0 0 12px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,.1)`,
        borderRadius: size * 0.21,
      }}
    >
      {meta.svg(size)}
      <span className="gb-status-label">{meta.label}</span>
    </div>
  );
};

/* ================================================================
   通貨アイコン 64×64 (3種)
   ================================================================ */

type CurrencyType = 'gold' | 'diamond' | 'mana';

interface CurrencyIconProps {
  type: CurrencyType;
  size?: number;
  showLabel?: boolean;
}

const GoldSvg = ({ s }: { s: number }) => (
  <svg width={s*0.6} height={s*0.6} viewBox="0 0 38 38" fill="none">
    <circle cx="19" cy="19" r="15" fill="url(#g-coin)" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
    <circle cx="19" cy="19" r="11" stroke="rgba(255,200,0,.4)" strokeWidth="1" fill="none"/>
    <text x="19" y="25" textAnchor="middle" fontFamily="serif" fontWeight="900" fontSize="16" fill="rgba(120,80,0,.7)">G</text>
    <defs>
      <radialGradient id="g-coin" cx="35%" cy="30%">
        <stop stopColor="#fff5a0"/>
        <stop offset=".5" stopColor="#f5c518"/>
        <stop offset="1" stopColor="#8b6010"/>
      </radialGradient>
    </defs>
  </svg>
);

const DiamondSvg = ({ s }: { s: number }) => (
  <svg width={s*0.58} height={s*0.58} viewBox="0 0 38 38" fill="none">
    {/* ダイヤモンド形 */}
    <path d="M19 5L33 16L19 33L5 16Z" fill="url(#g-dia)" stroke="rgba(200,240,255,.4)" strokeWidth=".8"/>
    {/* 上面 */}
    <path d="M19 5L12 16L19 14L26 16Z" fill="rgba(255,255,255,.4)"/>
    {/* 光沢 */}
    <path d="M14 10L19 5L17 12Z" fill="rgba(255,255,255,.5)"/>
    <path d="M24 10L19 5L21 12Z" fill="rgba(200,240,255,.3)"/>
    <defs>
      <linearGradient id="g-dia" x1="5" y1="5" x2="33" y2="33" gradientUnits="userSpaceOnUse">
        <stop stopColor="#bfdbfe"/>
        <stop offset=".4" stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#1e3a8a"/>
      </linearGradient>
    </defs>
  </svg>
);

const ManaSvg = ({ s }: { s: number }) => (
  <svg width={s*0.58} height={s*0.58} viewBox="0 0 38 38" fill="none">
    {/* クリスタル形 */}
    <path d="M19 4L28 12L30 22L19 34L8 22L10 12Z" fill="url(#g-mana)" stroke="rgba(220,180,255,.4)" strokeWidth=".8"/>
    <path d="M19 4L13 12L19 15L25 12Z" fill="rgba(255,255,255,.3)"/>
    <path d="M14 8L19 4L17 13Z" fill="rgba(255,255,255,.4)"/>
    {/* 内側の光 */}
    <circle cx="19" cy="19" r="5" fill="rgba(220,180,255,.2)"/>
    <circle cx="19" cy="19" r="2" fill="rgba(255,255,255,.3)"/>
    <defs>
      <linearGradient id="g-mana" x1="8" y1="4" x2="30" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f3e8ff"/>
        <stop offset=".4" stopColor="#a855f7"/>
        <stop offset="1" stopColor="#3b0764"/>
      </linearGradient>
    </defs>
  </svg>
);

const CURRENCY_LABELS: Record<CurrencyType, string> = {
  gold: 'ゴールド',
  diamond: 'ダイヤ',
  mana: 'マナクリスタル',
};

export const CurrencyIcon = ({ type, size = 64, showLabel = false }: CurrencyIconProps) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div
      className={`gb-currency-icon gb-currency-icon-${type}`}
      style={{ width: size, height: size }}
    >
      {type === 'gold'    && <GoldSvg s={size} />}
      {type === 'diamond' && <DiamondSvg s={size} />}
      {type === 'mana'    && <ManaSvg s={size} />}
    </div>
    {showLabel && (
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: type === 'gold' ? '#f0c040' : type === 'diamond' ? '#60a5fa' : '#c084fc',
      }}>
        {CURRENCY_LABELS[type]}
      </span>
    )}
  </div>
);
