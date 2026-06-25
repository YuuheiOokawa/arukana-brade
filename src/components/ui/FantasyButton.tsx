import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'gold' | 'blue' | 'purple' | 'ghost' | 'danger';

interface FantasyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  subText?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<Variant, { bg: string; border: string; shadow: string; color: string }> = {
  gold: {
    bg: 'linear-gradient(180deg, rgba(255,238,181,.38), rgba(191,120,16,.88) 55%, rgba(65,31,5,.95))',
    border: 'rgba(248,217,130,.72)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,.52), 0 8px 28px rgba(0,0,0,.52), 0 0 24px rgba(255,195,68,.22)',
    color: '#fff',
  },
  blue: {
    bg: 'linear-gradient(180deg, rgba(93,208,255,.30), rgba(11,45,103,.86) 56%, rgba(5,15,42,.92))',
    border: 'rgba(123,200,255,.65)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,.48), 0 8px 28px rgba(0,0,0,.50), 0 0 22px rgba(83,201,255,.22)',
    color: '#fff',
  },
  purple: {
    bg: 'linear-gradient(180deg, rgba(183,115,255,.30), rgba(79,46,155,.86) 56%, rgba(20,8,45,.92))',
    border: 'rgba(183,115,255,.65)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 8px 28px rgba(0,0,0,.50), 0 0 22px rgba(183,115,255,.2)',
    color: '#fff',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.18)',
    shadow: 'none',
    color: '#9ca3af',
  },
  danger: {
    bg: 'linear-gradient(180deg, rgba(239,68,68,.30), rgba(153,27,27,.88) 55%, rgba(60,10,10,.95))',
    border: 'rgba(239,68,68,.55)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 8px 28px rgba(0,0,0,.5)',
    color: '#fff',
  },
};

const SIZES = {
  sm: { padding: '8px 16px', fontSize: '12px', minHeight: '36px', borderRadius: '14px' },
  md: { padding: '13px 22px', fontSize: '15px', minHeight: '48px', borderRadius: '18px' },
  lg: { padding: '16px 28px', fontSize: '18px', minHeight: '56px', borderRadius: '20px' },
};

export const FantasyButton = ({
  variant = 'purple',
  size = 'md',
  icon,
  subText,
  fullWidth = false,
  children,
  style,
  ...props
}: FantasyButtonProps) => {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <button
      {...props}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : undefined,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: s.borderRadius,
        boxShadow: v.shadow,
        color: v.color,
        cursor: 'pointer',
        padding: s.padding,
        minHeight: s.minHeight,
        fontSize: s.fontSize,
        fontWeight: 900,
        fontFamily: 'inherit',
        letterSpacing: '0.04em',
        textShadow: '0 2px 6px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        transition: 'transform 0.14s ease, filter 0.14s ease, box-shadow 0.14s ease',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
      onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
      onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
    >
      {/* シマーエフェクト */}
      <span style={{
        position: 'absolute', inset: '-30%',
        background: 'linear-gradient(120deg, transparent 12%, rgba(255,255,255,.55) 45%, rgba(180,244,255,.22) 52%, transparent 72%)',
        transform: 'translateX(-120%)',
        pointerEvents: 'none',
        transition: '.55s',
      }} className="fantasy-shimmer" />
      {/* 内枠 */}
      <span style={{
        position: 'absolute', inset: 4,
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: Number(s.borderRadius.replace('px','')) - 4 + 'px',
        pointerEvents: 'none',
      }} />
      {/* コンテンツ */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span>{children}</span>
      </span>
      {subText && (
        <span style={{ position: 'relative', zIndex: 1, fontSize: '11px', fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
          {subText}
        </span>
      )}
    </button>
  );
};
