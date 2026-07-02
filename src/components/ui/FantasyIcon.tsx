interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconHome = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <rect x="9" y="13" width="6" height="8" rx="1" stroke={color} strokeWidth="1.6"/>
    <circle cx="12" cy="9" r="1.5" fill={color} opacity="0.6"/>
  </svg>
);

export const IconSword = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14.5 3L21 9.5 9 21.5l-3-3 12-15z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M3 21l3-3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M6 15l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M17 5l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconShield = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3L4 6v6c0 4 3.4 7.7 8 9 4.6-1.3 8-5 8-9V6L12 3z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconCrystal = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="12,2 19,7 19,17 12,22 5,17 5,7" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <polygon points="12,2 19,7 12,12 5,7" stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.5"/>
    <line x1="12" y1="12" x2="12" y2="22" stroke={color} strokeWidth="1.2" opacity="0.4"/>
  </svg>
);

export const IconScroll = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 4h13a2 2 0 012 2v12a2 2 0 01-2 2H6a3 3 0 01-3-3V7a3 3 0 013-3z" stroke={color} strokeWidth="1.6"/>
    <path d="M6 4a3 3 0 000 6h1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="10" y1="9" x2="17" y2="9" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="10" y1="13" x2="17" y2="13" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="10" y1="17" x2="14" y2="17" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconGear = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconBag = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="9" width="18" height="12" rx="2" stroke={color} strokeWidth="1.6"/>
    <path d="M8 9V7a4 4 0 018 0v2" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="2" stroke={color} strokeWidth="1.4" opacity="0.7"/>
  </svg>
);

export const IconArrowUp = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19V5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 12l7-7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21h8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const IconDragon = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 14c0-4 2-6 5-7" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M15 7c3 1 5 3 5 7" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <ellipse cx="12" cy="15" rx="5" ry="4" stroke={color} strokeWidth="1.6"/>
    <path d="M8 10c1-1 2-1.5 4-1.5S15 9 16 10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="9.5" cy="13" r="1" fill={color} opacity="0.8"/>
    <circle cx="14.5" cy="13" r="1" fill={color} opacity="0.8"/>
    <path d="M6 7l-2-3M18 7l2-3" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconTrophy = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 21h8M12 17v4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M5 4H4a2 2 0 000 4c.5 2 2 4 3 5h10c1-1 2.5-3 3-5a2 2 0 000-4h-1" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M5 4h14v6a7 7 0 01-14 0V4z" stroke={color} strokeWidth="1.6"/>
  </svg>
);

export const IconCastle = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="10" width="18" height="11" rx="1" stroke={color} strokeWidth="1.6"/>
    <path d="M3 10V7h3V4h2v3h4V4h2v3h3v3" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <rect x="9" y="15" width="6" height="6" rx="1" stroke={color} strokeWidth="1.4"/>
    <circle cx="12" cy="13" r="1" fill={color} opacity="0.6"/>
  </svg>
);

export const IconTeam = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.6"/>
    <circle cx="17" cy="9" r="2.5" stroke={color} strokeWidth="1.4" opacity="0.75"/>
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M19 20c0-2.2-1.5-4-3.5-4.8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
  </svg>
);

export const IconMenu = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconMap = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="18" stroke={color} strokeWidth="1.4" opacity="0.6"/>
    <line x1="16" y1="6" x2="16" y2="22" stroke={color} strokeWidth="1.4" opacity="0.6"/>
  </svg>
);

export const IconStar = ({ size = 24, color = 'currentColor', filled = false, className }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} className={className}>
    <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export const IconCrown = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 20h20" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4 20V9l4 5 4-8 4 8 4-5v11" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="5" r="1.5" fill={color} opacity="0.8"/>
    <circle cx="4" cy="9" r="1.5" fill={color} opacity="0.8"/>
    <circle cx="20" cy="9" r="1.5" fill={color} opacity="0.8"/>
  </svg>
);

export const IconFriends = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="9" cy="7" r="3.2" fill={color} opacity="0.9"/>
    <path d="M2 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9"/>
    <circle cx="18" cy="8" r="2.2" fill={color} opacity="0.6"/>
    <path d="M18 14c2.5 0.3 4.5 2 4.5 4.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6"/>
    <line x1="17" y1="4" x2="17" y2="8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    <line x1="15" y1="6" x2="19" y2="6" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
  </svg>
);
