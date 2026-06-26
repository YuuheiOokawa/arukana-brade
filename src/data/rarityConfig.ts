// ===== ★レアリティ定義 =====
// ガチャ排出: ★1〜★3のみ / ★4以上は育成・進化・覚醒で到達
export type StarRarity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'CROWN';

export const RARITY_LEVEL_CAPS: Record<string, number> = {
  '1': 20, '2': 40, '3': 60, '4': 80,
  '5': 100, '6': 120, '7': 150, 'CROWN': 200,
};

export const RARITY_ORDER_MAP: Record<string, number> = {
  '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, 'CROWN': 8,
};

export const NEXT_RARITY: Partial<Record<string, StarRarity>> = {
  '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 'CROWN',
};

export const STAR_DISPLAY: Record<string, string> = {
  '1': '★1', '2': '★2', '3': '★3', '4': '★4',
  '5': '★5', '6': '★6', '7': '★7', 'CROWN': '★👑',
};

export const STAR_RARITY_COLORS: Record<string, string> = {
  '1': '#7bc8ff',
  '2': '#b773ff',
  '3': '#ffe48d',
  '4': '#ff9d47',
  '5': '#ff6b9d',
  '6': '#00f5ff',
  '7': '#ff4466',
  'CROWN': '#fff8e0',
};

export const STAR_RARITY_GLOW: Record<string, string> = {
  '1': 'rgba(123,200,255,0.6)',
  '2': 'rgba(183,115,255,0.6)',
  '3': 'rgba(255,228,141,0.6)',
  '4': 'rgba(255,157,71,0.7)',
  '5': 'rgba(255,107,157,0.7)',
  '6': 'rgba(0,245,255,0.7)',
  '7': 'rgba(255,68,102,0.7)',
  'CROWN': 'rgba(255,248,224,0.9)',
};

// UnitMaster の RarityType → StarRarity (ガチャ初期排出レアリティ)
export const RARITY_TYPE_TO_STAR: Record<string, StarRarity> = {
  N: 1, R: 1, SR: 2, SSR: 3,
};

// 覚醒設定
export const AWAKENING_CONFIG = {
  maxAwakeningCount: 4,
  statBonusPerAwakening: 0.05, // 1回あたり +5%
  crystalItemId: 'item_awakening_crystal',
} as const;

export const getLevelCap = (rarity: StarRarity): number =>
  RARITY_LEVEL_CAPS[String(rarity)] ?? 60;

export const getStarDisplay = (rarity: StarRarity): string =>
  STAR_DISPLAY[String(rarity)] ?? '★?';

export const getStarColor = (rarity: StarRarity): string =>
  STAR_RARITY_COLORS[String(rarity)] ?? '#fff';

export const getStarGlow = (rarity: StarRarity): string =>
  STAR_RARITY_GLOW[String(rarity)] ?? 'rgba(255,255,255,0.5)';

export const getStarRarityOrder = (rarity: StarRarity): number =>
  RARITY_ORDER_MAP[String(rarity)] ?? 0;

export const nextRarity = (rarity: StarRarity): StarRarity | null => {
  if (rarity === 'CROWN') return null;
  if (rarity === 7) return 'CROWN';
  return (rarity + 1) as StarRarity;
};
