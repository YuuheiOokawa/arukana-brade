import type { ReactNode, CSSProperties } from 'react';
import './GameUI.css';

type CardRarity = 1 | 2 | 3 | 4 | 5 | 'W';

interface CardFrameProps {
  rarity: CardRarity;
  children?: ReactNode;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

/* 角装飾 SVG (★1 ティール) */
const CornerStar1 = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M1 1 L10 1 L1 10 Z" fill="#00cfb4" opacity=".8"/>
    <path d="M1 1 L5 1 L1 5 Z" fill="#00ffea"/>
    <path d="M10 1 L10 3 L3 1 Z" fill="rgba(0,207,180,.4)"/>
    <path d="M1 10 L1 3 L3 10 Z" fill="rgba(0,207,180,.4)"/>
  </svg>
);

/* 角装飾 SVG (★5 ゴールド) */
const CornerStar5 = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M2 2 L14 2 L2 14 Z" fill="url(#cg5)" opacity=".9"/>
    <path d="M2 2 L7 2 L2 7 Z" fill="#fff8b0"/>
    <path d="M14 2 L14 5 L5 2 Z" fill="rgba(255,200,0,.5)"/>
    <path d="M2 14 L2 5 L5 14 Z" fill="rgba(255,200,0,.5)"/>
    {/* 宝石 */}
    <circle cx="3" cy="3" r="2" fill="#ffe566" stroke="#d4a017" strokeWidth=".5"/>
    <circle cx="14" cy="2" r="1.5" fill="#ffe566"/>
    <circle cx="2" cy="14" r="1.5" fill="#ffe566"/>
    <defs>
      <linearGradient id="cg5" x1="2" y1="2" x2="14" y2="14">
        <stop stopColor="#FFE566"/>
        <stop offset="1" stopColor="#D4A017"/>
      </linearGradient>
    </defs>
  </svg>
);

/* 角装飾 SVG (★W クラウン虹) */
const CornerCrown = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M2 2 L16 2 L2 16 Z" fill="url(#cgw)" opacity=".9"/>
    <path d="M2 2 L8 2 L2 8 Z" fill="rgba(255,255,255,.9)"/>
    <path d="M16 2 L16 5 L5 2 Z" fill="rgba(255,200,0,.6)"/>
    <path d="M2 16 L2 5 L5 16 Z" fill="rgba(200,100,255,.6)"/>
    <circle cx="3" cy="3" r="2.5" fill="url(#cjw)" stroke="white" strokeWidth=".5"/>
    <circle cx="16" cy="2" r="2" fill="url(#cjw2)"/>
    <circle cx="2" cy="16" r="2" fill="url(#cjw3)"/>
    <defs>
      <linearGradient id="cgw" x1="2" y1="2" x2="16" y2="16">
        <stop stopColor="#FF4488"/>
        <stop offset=".33" stopColor="#FFDD00"/>
        <stop offset=".66" stopColor="#00FFAA"/>
        <stop offset="1" stopColor="#8844FF"/>
      </linearGradient>
      <linearGradient id="cjw" x1="0" y1="0" x2="5" y2="5">
        <stop stopColor="#FF6688"/>
        <stop offset="1" stopColor="#FF0044"/>
      </linearGradient>
      <linearGradient id="cjw2" x1="14" y1="0" x2="18" y2="4">
        <stop stopColor="#FFEE55"/>
        <stop offset="1" stopColor="#FF8800"/>
      </linearGradient>
      <linearGradient id="cjw3" x1="0" y1="14" x2="4" y2="18">
        <stop stopColor="#44FFCC"/>
        <stop offset="1" stopColor="#0088FF"/>
      </linearGradient>
    </defs>
  </svg>
);

/* クラウン装飾（★W 上部） */
const CrownDecoration = () => (
  <svg width="52" height="32" viewBox="0 0 52 32" fill="none" className="gb-card-crown-top">
    {/* 背景グロー */}
    <ellipse cx="26" cy="28" rx="20" ry="6" fill="rgba(255,160,0,.2)" filter="blur(3px)"/>
    {/* クラウン本体 */}
    <path d="M8 28 L6 16 L14 22 L26 6 L38 22 L46 16 L44 28 Z"
      fill="url(#crown-fill)" stroke="url(#crown-stroke)" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* 宝石 */}
    <ellipse cx="26" cy="7" rx="4" ry="4" fill="url(#gem-red)" stroke="rgba(255,255,255,.6)" strokeWidth=".8"/>
    <ellipse cx="10" cy="22" rx="3" ry="3" fill="url(#gem-blue)" stroke="rgba(255,255,255,.5)" strokeWidth=".7"/>
    <ellipse cx="42" cy="22" rx="3" ry="3" fill="url(#gem-green)" stroke="rgba(255,255,255,.5)" strokeWidth=".7"/>
    {/* クラウン下部装飾 */}
    <rect x="6" y="26" width="40" height="5" rx="2" fill="url(#crown-base)" stroke="rgba(255,220,80,.5)" strokeWidth=".8"/>
    {/* ベースの宝石 */}
    <circle cx="16" cy="28.5" r="1.8" fill="#FF6688"/>
    <circle cx="26" cy="28.5" r="1.8" fill="#FFDD00"/>
    <circle cx="36" cy="28.5" r="1.8" fill="#44CCFF"/>
    <defs>
      <linearGradient id="crown-fill" x1="6" y1="6" x2="46" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE566"/>
        <stop offset=".5" stopColor="#D4A017"/>
        <stop offset="1" stopColor="#FFE566"/>
      </linearGradient>
      <linearGradient id="crown-stroke" x1="6" y1="0" x2="46" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF"/>
        <stop offset=".5" stopColor="#FFD700"/>
        <stop offset="1" stopColor="#FFFFFF"/>
      </linearGradient>
      <linearGradient id="crown-base" x1="6" y1="26" x2="46" y2="31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B6010"/>
        <stop offset=".5" stopColor="#D4A017"/>
        <stop offset="1" stopColor="#8B6010"/>
      </linearGradient>
      <radialGradient id="gem-red" cx="40%" cy="35%">
        <stop stopColor="#FF99BB"/>
        <stop offset="1" stopColor="#CC0044"/>
      </radialGradient>
      <radialGradient id="gem-blue" cx="40%" cy="35%">
        <stop stopColor="#99CCFF"/>
        <stop offset="1" stopColor="#0044CC"/>
      </radialGradient>
      <radialGradient id="gem-green" cx="40%" cy="35%">
        <stop stopColor="#99FFCC"/>
        <stop offset="1" stopColor="#008844"/>
      </radialGradient>
    </defs>
  </svg>
);

/* 星★アイコン */
const StarIcon = ({ color = '#f0c040' }: { color?: string }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill={color}>
    <path d="M5 1L6.2 3.8L9.1 4.1L7 6.1L7.6 9L5 7.5L2.4 9L3 6.1L0.9 4.1L3.8 3.8Z"/>
  </svg>
);

/* スパークル効果 */
const Sparkle = ({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) => (
  <svg
    className="gb-card-sparkle"
    style={{ left: x, top: y, animation: `gb-sparkle ${1.5 + delay * 0.5}s ease-in-out ${delay}s infinite` }}
    width={size} height={size} viewBox="0 0 16 16"
  >
    <path d="M8 0L9 6L15 8L9 10L8 16L7 10L1 8L7 6Z" fill={color}/>
  </svg>
);

const RARITY_STARS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

export const CardFrame = ({ rarity, children, width = 140, height = 196, style }: CardFrameProps) => {
  const isCrown = rarity === 'W';
  const numRarity = isCrown ? 5 : Number(rarity);
  const stars = isCrown ? 5 : (RARITY_STARS[numRarity] ?? 1);

  const frameClass = isCrown
    ? 'gb-card-crown'
    : numRarity >= 5
    ? 'gb-card-star5'
    : 'gb-card-star1';

  const CornerEl = isCrown ? CornerCrown : numRarity >= 5 ? CornerStar5 : CornerStar1;

  const starColor = isCrown
    ? '#FF8844'
    : numRarity >= 5
    ? '#ffd700'
    : '#00cfb4';

  return (
    <div
      className={`gb-card ${frameClass}`}
      style={{ width, height, ...style }}
    >
      {/* クラウン装飾（★W のみ） */}
      {isCrown && <CrownDecoration />}

      {/* グラデーション縁取り */}
      <div className="gb-card-border">
        <div className="gb-card-border-inner" />
      </div>

      {/* 角装飾 */}
      <div className="gb-card-corner gb-card-corner-tl"><CornerEl /></div>
      <div className="gb-card-corner gb-card-corner-tr"><CornerEl /></div>
      <div className="gb-card-corner gb-card-corner-bl"><CornerEl /></div>
      <div className="gb-card-corner gb-card-corner-br"><CornerEl /></div>

      {/* スパークルエフェクト (★5 / ★W) */}
      {numRarity >= 5 && (
        <>
          <Sparkle x={-6} y={-6}   size={10} color="#ffd700" delay={0} />
          <Sparkle x={width - 4} y={-6}  size={8}  color="#ff8800" delay={0.4} />
          <Sparkle x={-6} y={height - 4} size={8}  color="#ffd700" delay={0.8} />
          <Sparkle x={width - 4} y={height - 4} size={10} color="#ff8800" delay={1.2} />
          {isCrown && <>
            <Sparkle x={width / 2 - 5} y={-12} size={12} color="#ff44aa" delay={0.2} />
            <Sparkle x={12} y={height / 2 - 5} size={8}  color="#44ffcc" delay={0.6} />
            <Sparkle x={width - 16} y={height / 2 - 5} size={8} color="#8844ff" delay={1.0} />
          </>}
        </>
      )}

      {/* カード内側コンテンツ */}
      <div className="gb-card-inner" style={{ width, height }}>
        {children ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </div>
        ) : (
          /* デフォルト: 背景に星座 */
          <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* 星背景 */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                borderRadius: '50%',
                background: '#fff',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
              }} />
            ))}
            {/* 魔法陣 */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 140 196">
              <circle cx="70" cy="98" r="50" stroke={starColor} strokeWidth=".5" fill="none" opacity=".3"/>
              <circle cx="70" cy="98" r="35" stroke={starColor} strokeWidth=".5" fill="none" opacity=".2"/>
              <polygon points="70,50 100,130 40,80 100,80 40,130" fill="none" stroke={starColor} strokeWidth=".5" opacity=".25"/>
            </svg>
          </div>
        )}
      </div>

      {/* 星レーティング */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        zIndex: 5,
        filter: `drop-shadow(0 0 4px ${starColor})`,
      }}>
        {Array.from({ length: stars }).map((_, i) => (
          <StarIcon key={i} color={isCrown ? ['#FF4488','#FFDD00','#44FFCC','#8844FF','#FF8800'][i] : starColor} />
        ))}
        {isCrown && (
          <span style={{ fontSize: 8, color: '#ffd700', fontWeight: 900, marginLeft: 2 }}>W</span>
        )}
      </div>
    </div>
  );
};
