import { BG_STYLES, BG_ACCENT } from '../data/scenarios';

// ワールドごとの背景テーマ（第1〜10世界はストーリーの舞台と一致させる）
const WORLD_BG_KEY: Record<string, string> = {
  world_1: 'forest',
  world_2: 'lava',
  world_3: 'ocean',
  world_4: 'storm',
  world_5: 'castle',
  world_6: 'holy',
  world_7: 'void',
  world_8: 'cosmos',
  world_9: 'arena',
  world_10: 'darkness',
};

// 第11世界以降（ポストストーリー高難度帯）はテーマを周期的に割り当てて雰囲気に変化を持たせる
const CYCLE_KEYS = Object.keys(BG_STYLES);

export const getWorldBackgroundKey = (worldId?: string | null): string => {
  if (!worldId) return 'forest';
  if (WORLD_BG_KEY[worldId]) return WORLD_BG_KEY[worldId];
  const num = parseInt(worldId.replace('world_', ''), 10);
  if (Number.isNaN(num) || CYCLE_KEYS.length === 0) return 'forest';
  return CYCLE_KEYS[(num - 1) % CYCLE_KEYS.length];
};

// "stage_4_1_1" → "world_4" / イベント・レイド等の非対応IDは null
export const getWorldIdFromStageId = (stageId?: string | null): string | null => {
  if (!stageId) return null;
  const m = stageId.match(/^stage_(\d+)_/);
  return m ? `world_${m[1]}` : null;
};

export const getWorldBgStyle = (worldId?: string | null): string =>
  BG_STYLES[getWorldBackgroundKey(worldId)] ?? BG_STYLES.forest;

export const getWorldAccent = (worldId?: string | null): string =>
  BG_ACCENT[getWorldBackgroundKey(worldId)] ?? '#8b5cf6';
