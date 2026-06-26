import type { ReactNode, MouseEvent } from 'react';
import './GameUI.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'gacha' | 'back' | 'gold';
type ButtonSize = 'md' | 'sm';

interface GameButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M12 3L6 9L12 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GachaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
      fill="url(#gacha-star)" stroke="rgba(255,200,0,0.6)" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="gacha-star" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700"/>
        <stop offset=".5" stopColor="#FF8C00"/>
        <stop offset="1" stopColor="#FFD700"/>
      </linearGradient>
    </defs>
  </svg>
);

const bodyClass: Record<ButtonVariant, string> = {
  primary:   'gb-btn-primary-body',
  secondary: 'gb-btn-secondary-body',
  danger:    'gb-btn-danger-body',
  gacha:     'gb-btn-gacha-body',
  back:      'gb-btn-back-body',
  gold:      'gb-btn-gold-body',
};

export const GameButton = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  className = '',
  fullWidth,
}: GameButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`gb-btn gb-btn-${variant} ${bodyClass[variant]} ${size === 'sm' ? 'gb-btn-sm' : ''} ${className}`}
      style={{
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* グラデーション縁取り */}
      <div className="gb-btn-highlight" />
      <div className="gb-btn-shadow" />

      <span className="gb-btn-inner">
        {variant === 'back' && <BackArrow />}
        {variant === 'gacha' ? (
          <>
            <GachaIcon />
            <span className="gb-btn-gacha-text">{children}</span>
          </>
        ) : (
          <span>{children}</span>
        )}
      </span>
    </button>
  );
};

export const GameButtonRow = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
);
