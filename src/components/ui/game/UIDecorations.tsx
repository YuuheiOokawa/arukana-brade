import type { ReactNode, CSSProperties } from 'react';
import './GameUI.css';

/* ================================================================
   タイトルプレート
   ================================================================ */

interface TitlePlateProps {
  children: ReactNode;
  color?: 'gold' | 'purple' | 'red';
  style?: CSSProperties;
}

const plateGradient = {
  gold:   { line: 'rgba(240,192,64,.7)', gem: '#f0c040', gemGlow: 'rgba(240,192,64,.8)' },
  purple: { line: 'rgba(139,92,246,.7)', gem: '#a78bfa', gemGlow: 'rgba(139,92,246,.8)' },
  red:    { line: 'rgba(239,68,68,.7)',  gem: '#f87171', gemGlow: 'rgba(239,68,68,.8)' },
};

const DiamondGem = ({ color, glow }: { color: string; glow: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
    <path d="M6 1L11 5L6 11L1 5Z" fill={color}/>
    <path d="M6 1L3.5 5L6 4L8.5 5Z" fill="rgba(255,255,255,.4)"/>
  </svg>
);

export const TitlePlate = ({ children, color = 'gold', style }: TitlePlateProps) => {
  const p = plateGradient[color];
  return (
    <div className="gb-title-plate" style={style}>
      {/* 背景ライン */}
      <div
        className="gb-title-plate-bg"
        style={{
          borderImage: `linear-gradient(90deg, transparent, ${p.line} 30%, ${p.line} 70%, transparent) 1`,
        }}
      />
      {/* 左装飾 */}
      <div className="gb-title-plate-deco gb-title-plate-deco-l">
        <DiamondGem color={p.gem} glow={p.gemGlow} />
      </div>
      {/* 右装飾 */}
      <div className="gb-title-plate-deco gb-title-plate-deco-r">
        <DiamondGem color={p.gem} glow={p.gemGlow} />
      </div>
      {/* テキスト */}
      <span
        className="gb-title-plate-text"
        style={{
          background: `linear-gradient(to bottom, #fff8e0, ${p.gem})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </div>
  );
};

/* ================================================================
   仕切りライン
   ================================================================ */

interface DividerLineProps {
  color?: 'gold' | 'purple';
  label?: string;
  style?: CSSProperties;
}

export const DividerLine = ({ color = 'gold', label, style }: DividerLineProps) => {
  const lineClass = color === 'gold' ? 'gb-divider-line-gold' : 'gb-divider-line-purple';
  return (
    <div className="gb-divider" style={style}>
      <div className={`gb-divider-line ${lineClass}`} />
      {label ? (
        <span style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: color === 'gold' ? '#f0c040' : '#a78bfa',
          letterSpacing: '.2em',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {label}
        </span>
      ) : (
        <div className="gb-divider-gem" style={{
          background: color === 'gold' ? '#f0c040' : '#a78bfa',
          boxShadow: `0 0 8px ${color === 'gold' ? 'rgba(240,192,64,.6)' : 'rgba(167,139,250,.6)'}`,
        }} />
      )}
      <div className={`gb-divider-line ${lineClass}`} />
    </div>
  );
};

/* ================================================================
   ローディングバー
   ================================================================ */

interface LoadingBarProps {
  progress?: number;
  animated?: boolean;
  label?: string;
  width?: number | string;
  color?: 'purple' | 'gold' | 'green';
}

const LOADING_BAR_COLORS = {
  purple: {
    fill: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a855f7, #c084fc)',
    glow: 'rgba(168,85,247,.6)',
  },
  gold: {
    fill: 'linear-gradient(90deg, #78350f, #d97706, #f59e0b, #fde68a)',
    glow: 'rgba(240,192,64,.6)',
  },
  green: {
    fill: 'linear-gradient(90deg, #14532d, #15803d, #22c55e, #4ade80)',
    glow: 'rgba(34,197,94,.5)',
  },
};

export const LoadingBar = ({
  progress = 60,
  animated = true,
  label,
  width = '100%',
  color = 'purple',
}: LoadingBarProps) => {
  const c = LOADING_BAR_COLORS[color];
  return (
    <div style={{ width }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: '#9ca3af',
        }}>
          <span>{label}</span>
          <span style={{ color: '#c4b5fd' }}>{progress}%</span>
        </div>
      )}
      <div className="gb-loading-bar-wrap">
        <div
          className="gb-loading-bar-fill"
          style={{
            width: `${progress}%`,
            background: c.fill,
            backgroundSize: '200% auto',
            boxShadow: `0 0 12px ${c.glow}`,
            animation: animated
              ? 'gb-shimmer 1.5s linear infinite, gb-loading-pulse 1.2s ease-in-out infinite'
              : 'none',
            transition: 'width .5s ease',
          }}
        />
        {!label && (
          <span className="gb-loading-bar-text">{progress}%</span>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   フレーム装飾
   ================================================================ */

interface FrameDecorationProps {
  children: ReactNode;
  color?: 'gold' | 'purple' | 'teal';
  style?: CSSProperties;
}

const FRAME_COLORS = {
  gold:   { border: 'rgba(240,192,64,.7)', corner: '#f0c040', glow: 'rgba(240,192,64,.3)' },
  purple: { border: 'rgba(139,92,246,.7)', corner: '#a78bfa', glow: 'rgba(139,92,246,.2)' },
  teal:   { border: 'rgba(20,184,166,.7)', corner: '#2dd4bf', glow: 'rgba(20,184,166,.2)' },
};

const FrameCornerSvg = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M1 1 L10 1 L1 10 Z" fill={color} opacity=".7"/>
    <path d="M1 1 L5 1 L1 5 Z" fill="white" opacity=".8"/>
    <rect x="0" y="0" width="2" height="11" fill={color}/>
    <rect x="0" y="0" width="11" height="2" fill={color}/>
  </svg>
);

export const FrameDecoration = ({ children, color = 'gold', style }: FrameDecorationProps) => {
  const c = FRAME_COLORS[color];
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        border: `2px solid ${c.border}`,
        background: 'rgba(10,5,25,.9)',
        boxShadow: `0 0 20px ${c.glow}, inset 0 0 20px rgba(0,0,0,.5)`,
        padding: 16,
        ...style,
      }}
    >
      {/* 4角の装飾 */}
      {[
        { top: -2,    left: -2,  rot: '0deg' },
        { top: -2,    right: -2, rot: '90deg' },
        { bottom: -2, left: -2,  rot: '270deg' },
        { bottom: -2, right: -2, rot: '180deg' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            transform: `rotate(${pos.rot})`,
            zIndex: 2,
          }}
        >
          <FrameCornerSvg color={c.corner} />
        </div>
      ))}

      {/* 上下ラインのハイライト */}
      <div style={{
        position: 'absolute',
        top: 0, left: 16, right: 16,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${c.border}, transparent)`,
        borderRadius: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0, left: 16, right: 16,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${c.border}, transparent)`,
        borderRadius: 1,
      }} />

      {children}
    </div>
  );
};

/* ================================================================
   ユーティリティ: バッジ・タグ
   ================================================================ */

interface GameBadgeProps {
  children: ReactNode;
  color?: 'gold' | 'purple' | 'red' | 'green' | 'teal';
}

const BADGE_COLORS = {
  gold:   { bg: 'rgba(240,192,64,.2)', border: 'rgba(240,192,64,.5)', text: '#fde68a' },
  purple: { bg: 'rgba(139,92,246,.2)', border: 'rgba(139,92,246,.5)', text: '#c4b5fd' },
  red:    { bg: 'rgba(239,68,68,.2)',  border: 'rgba(239,68,68,.5)',  text: '#fca5a5' },
  green:  { bg: 'rgba(34,197,94,.2)',  border: 'rgba(34,197,94,.5)',  text: '#86efac' },
  teal:   { bg: 'rgba(20,184,166,.2)', border: 'rgba(20,184,166,.5)', text: '#5eead4' },
};

export const GameBadge = ({ children, color = 'gold' }: GameBadgeProps) => {
  const c = BADGE_COLORS[color];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "'Noto Sans JP', sans-serif",
      letterSpacing: '.1em',
    }}>
      {children}
    </span>
  );
};
