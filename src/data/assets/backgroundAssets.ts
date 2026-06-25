import type { BackgroundImage } from '../../lib/assets/assetTypes';
import { BgAssetId } from '../../lib/assets/assetIds';

export const backgroundAssets: Readonly<Record<BgAssetId, BackgroundImage>> = {

  // ──────────── タイトル ────────────

  [BgAssetId.TITLE_ARCANA_GATE]: {
    id: BgAssetId.TITLE_ARCANA_GATE,
    path: '/assets/images/backgrounds/title/bg_title_arcana_gate.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'critical',
    preload: true,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['title', 'arcana', 'magic_circle', 'crystal', 'night'],
    status: 'placeholder',
  },

  // ──────────── ホーム ────────────

  [BgAssetId.HOME_FLOATING_CITY]: {
    id: BgAssetId.HOME_FLOATING_CITY,
    path: '/assets/images/backgrounds/home/bg_home_floating_city.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'critical',
    preload: true,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['home', 'city', 'floating', 'morning'],
    status: 'placeholder',
  },

  // ──────────── クエスト ────────────

  [BgAssetId.QUEST_WORLD_MAP]: {
    id: BgAssetId.QUEST_WORLD_MAP,
    path: '/assets/images/backgrounds/quest/bg_quest_world_map.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'high',
    preload: true,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'light',
    tags: ['quest', 'map', 'world', 'adventure'],
    status: 'placeholder',
  },

  // ──────────── バトル ────────────

  [BgAssetId.BATTLE_MYSTIC_FOREST]: {
    id: BgAssetId.BATTLE_MYSTIC_FOREST,
    path: '/assets/images/backgrounds/battle/bg_battle_mystic_forest.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'high',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: true,
    uiOverlayHint: 'dark',
    tags: ['battle', 'forest', 'chapter1', 'mystic'],
    status: 'placeholder',
  },

  [BgAssetId.BATTLE_ANCIENT_RUINS]: {
    id: BgAssetId.BATTLE_ANCIENT_RUINS,
    path: '/assets/images/backgrounds/battle/bg_battle_ancient_ruins.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: true,
    uiOverlayHint: 'dark',
    tags: ['battle', 'ruins', 'chapter2', 'ancient'],
    status: 'placeholder',
  },

  [BgAssetId.BATTLE_CRYSTAL_CAVE]: {
    id: BgAssetId.BATTLE_CRYSTAL_CAVE,
    path: '/assets/images/backgrounds/battle/bg_battle_crystal_cave.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: true,
    uiOverlayHint: 'dark',
    tags: ['battle', 'cave', 'crystal', 'chapter3'],
    status: 'placeholder',
  },

  [BgAssetId.BATTLE_SKY_FORTRESS]: {
    id: BgAssetId.BATTLE_SKY_FORTRESS,
    path: '/assets/images/backgrounds/battle/bg_battle_sky_fortress.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: true,
    uiOverlayHint: 'dark',
    tags: ['battle', 'sky', 'fortress', 'chapter4'],
    status: 'placeholder',
  },

  [BgAssetId.BATTLE_ABYSS]: {
    id: BgAssetId.BATTLE_ABYSS,
    path: '/assets/images/backgrounds/battle/bg_battle_abyss.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'lazy',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: true,
    uiOverlayHint: 'dark',
    tags: ['battle', 'abyss', 'dark', 'final'],
    status: 'placeholder',
  },

  // ──────────── シナリオ ────────────

  [BgAssetId.SCENARIO_CAMPFIRE]: {
    id: BgAssetId.SCENARIO_CAMPFIRE,
    path: '/assets/images/backgrounds/scenario/bg_scenario_campfire.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['scenario', 'campfire', 'night', 'story'],
    status: 'placeholder',
  },

  [BgAssetId.SCENARIO_THRONE_ROOM]: {
    id: BgAssetId.SCENARIO_THRONE_ROOM,
    path: '/assets/images/backgrounds/scenario/bg_scenario_throne_room.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['scenario', 'throne', 'royal', 'story'],
    status: 'placeholder',
  },

  [BgAssetId.SCENARIO_VILLAGE]: {
    id: BgAssetId.SCENARIO_VILLAGE,
    path: '/assets/images/backgrounds/scenario/bg_scenario_village.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'light',
    tags: ['scenario', 'village', 'peaceful', 'story'],
    status: 'placeholder',
  },

  // ──────────── ガチャ ────────────

  [BgAssetId.SUMMON_TEMPLE]: {
    id: BgAssetId.SUMMON_TEMPLE,
    path: '/assets/images/backgrounds/summon/bg_summon_temple.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'critical',
    preload: true,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['summon', 'gacha', 'temple', 'magic_circle'],
    status: 'placeholder',
  },

  // ──────────── プロフィール ────────────

  [BgAssetId.PROFILE_THRONE_ROOM]: {
    id: BgAssetId.PROFILE_THRONE_ROOM,
    path: '/assets/images/backgrounds/profile/bg_profile_throne_room.webp',
    category: 'background',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    size: { width: 1920, height: 1080 },
    isBattleStage: false,
    uiOverlayHint: 'dark',
    tags: ['profile', 'throne', 'royal'],
    status: 'placeholder',
  },

} satisfies Record<string, BackgroundImage>;
