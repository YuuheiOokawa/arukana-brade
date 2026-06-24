export const formatNumber = (n: number): string => n.toLocaleString('ja-JP');

export const formatPercent = (rate: number): string => `${(rate * 100).toFixed(1)}%`;

export const getRarityLabel = (rarity: string): string => rarity;

export const getExpForLevel = (level: number): number => Math.floor(100 * Math.pow(level, 1.3));

export const calcTotalPower = (stats: { hp: number; atk: number; def: number; rec: number }): number =>
  Math.floor(stats.hp * 0.5 + stats.atk * 2 + stats.def * 1.5 + stats.rec * 1);
