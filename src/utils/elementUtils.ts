import type { ElementType } from '../types';

export const elementGradient = (element: ElementType | string): string => {
  const map: Record<string, string> = {
    fire:    'linear-gradient(135deg, #7f1d1d, #ef4444)',
    water:   'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    wind:    'linear-gradient(135deg, #064e3b, #10b981)',
    earth:   'linear-gradient(135deg, #451a03, #92400e)',
    light:   'linear-gradient(135deg, #713f12, #ca8a04)',
    dark:    'linear-gradient(135deg, #2e1065, #7c3aed)',
    thunder: 'linear-gradient(135deg, #1c1917, #ca8a04)',
  };
  return map[element] ?? 'linear-gradient(135deg, #1a1a35, #141428)';
};

export const elementGlow = (element: ElementType | string): string => {
  const map: Record<string, string> = {
    fire:    '0 0 20px rgba(239,68,68,0.5)',
    water:   '0 0 20px rgba(59,130,246,0.5)',
    wind:    '0 0 20px rgba(16,185,129,0.5)',
    earth:   '0 0 20px rgba(146,64,14,0.5)',
    light:   '0 0 20px rgba(202,138,4,0.5)',
    dark:    '0 0 20px rgba(124,58,237,0.5)',
    thunder: '0 0 20px rgba(250,204,21,0.7)',
  };
  return map[element] ?? '0 0 20px rgba(139,92,246,0.3)';
};

export const elementTextColor = (element: ElementType | string): string => {
  const map: Record<string, string> = {
    fire:    '#f87171',
    water:   '#60a5fa',
    wind:    '#34d399',
    earth:   '#d97706',
    light:   '#fbbf24',
    dark:    '#a78bfa',
    thunder: '#facc15',
  };
  return map[element] ?? '#ffffff';
};
