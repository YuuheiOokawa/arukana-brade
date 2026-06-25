// ============================================================
// アルカナブレイド — アセットID定数
// ============================================================
// Enum ではなく const object を使用。理由：
//   - Tree-shaking が効く
//   - 文字列リテラル型として使えるため IDE補完が正確
//   - 将来的な動的追加が容易

// ──────────────────────────────────────────
// 背景
// ──────────────────────────────────────────

export const BgAssetId = {
  // タイトル
  TITLE_ARCANA_GATE:    'BG_TITLE_ARCANA_GATE',
  // ホーム
  HOME_FLOATING_CITY:   'BG_HOME_FLOATING_CITY',
  // クエスト
  QUEST_WORLD_MAP:      'BG_QUEST_WORLD_MAP',
  // バトル
  BATTLE_MYSTIC_FOREST: 'BG_BATTLE_MYSTIC_FOREST',
  BATTLE_ANCIENT_RUINS: 'BG_BATTLE_ANCIENT_RUINS',
  BATTLE_CRYSTAL_CAVE:  'BG_BATTLE_CRYSTAL_CAVE',
  BATTLE_SKY_FORTRESS:  'BG_BATTLE_SKY_FORTRESS',
  BATTLE_ABYSS:         'BG_BATTLE_ABYSS',
  // シナリオ
  SCENARIO_CAMPFIRE:    'BG_SCENARIO_CAMPFIRE',
  SCENARIO_THRONE_ROOM: 'BG_SCENARIO_THRONE_ROOM',
  SCENARIO_VILLAGE:     'BG_SCENARIO_VILLAGE',
  // ガチャ
  SUMMON_TEMPLE:        'BG_SUMMON_TEMPLE',
  // プロフィール
  PROFILE_THRONE_ROOM:  'BG_PROFILE_THRONE_ROOM',
} as const;
export type BgAssetId = (typeof BgAssetId)[keyof typeof BgAssetId];

// ──────────────────────────────────────────
// 主人公（ヒーロー）
// ──────────────────────────────────────────

export const HeroAssetId = {
  HUMAN_MALE_001:     'HERO_HUMAN_MALE_001',
  HUMAN_FEMALE_001:   'HERO_HUMAN_FEMALE_001',
  DEMON_MALE_001:     'HERO_DEMON_MALE_001',
  DEMON_FEMALE_001:   'HERO_DEMON_FEMALE_001',
  GODDESS_FEMALE_001: 'HERO_GODDESS_FEMALE_001',
} as const;
export type HeroAssetId = (typeof HeroAssetId)[keyof typeof HeroAssetId];

// ──────────────────────────────────────────
// ユニット（ガチャキャラ）
// ──────────────────────────────────────────

export const UnitAssetId = {
  FIRE_SWORDSMAN_001:  'UNIT_FIRE_SWORDSMAN_001',
  WATER_MAGE_001:      'UNIT_WATER_MAGE_001',
  THUNDER_LANCER_001:  'UNIT_THUNDER_LANCER_001',
  WIND_ARCHER_001:     'UNIT_WIND_ARCHER_001',
  LIGHT_PRIEST_001:    'UNIT_LIGHT_PRIEST_001',
  DARK_BLADE_001:      'UNIT_DARK_BLADE_001',
  EARTH_KNIGHT_001:    'UNIT_EARTH_KNIGHT_001',
  FIRE_MAGE_001:       'UNIT_FIRE_MAGE_001',
  WATER_HEALER_001:    'UNIT_WATER_HEALER_001',
  THUNDER_ROGUE_001:   'UNIT_THUNDER_ROGUE_001',
  WIND_DANCER_001:     'UNIT_WIND_DANCER_001',
  LIGHT_PALADIN_001:   'UNIT_LIGHT_PALADIN_001',
  DARK_WITCH_001:      'UNIT_DARK_WITCH_001',
} as const;
export type UnitAssetId = (typeof UnitAssetId)[keyof typeof UnitAssetId];

// ──────────────────────────────────────────
// 敵
// ──────────────────────────────────────────

export const EnemyAssetId = {
  // 通常敵
  SHADOW_SLIME_001:     'ENEMY_SHADOW_SLIME_001',
  SHADOW_GOBLIN_001:    'ENEMY_SHADOW_GOBLIN_001',
  FOREST_WOLF_001:      'ENEMY_FOREST_WOLF_001',
  FIRE_BAT_001:         'ENEMY_FIRE_BAT_001',
  POISON_SPIDER_001:    'ENEMY_POISON_SPIDER_001',
  // エリート
  ANCIENT_SOLDIER_001:  'ENEMY_ANCIENT_SOLDIER_001',
  SHADOW_KNIGHT_001:    'ENEMY_SHADOW_KNIGHT_001',
  STONE_GOLEM_001:      'ENEMY_STONE_GOLEM_001',
  // ボス
  BOSS_BLACK_CRYSTAL_DRAGON: 'BOSS_BLACK_CRYSTAL_DRAGON_001',
  BOSS_ANCIENT_GOLEM_KING:   'BOSS_ANCIENT_GOLEM_KING_001',
  BOSS_SHADOW_WITCH:         'BOSS_SHADOW_WITCH_001',
  BOSS_SEA_SERPENT:          'BOSS_SEA_SERPENT_001',
  BOSS_DEMON_LORD:           'BOSS_DEMON_LORD_001',
  BOSS_CURSED_TREE:          'BOSS_CURSED_TREE_001',
  // レイドボス
  RAID_ETERNAL_PHOENIX:      'RAID_ETERNAL_PHOENIX_001',
  RAID_ABYSS_LEVIATHAN:      'RAID_ABYSS_LEVIATHAN_001',
  RAID_THUNDER_COLOSSUS:     'RAID_THUNDER_COLOSSUS_001',
} as const;
export type EnemyAssetId = (typeof EnemyAssetId)[keyof typeof EnemyAssetId];

// ──────────────────────────────────────────
// 属性アイコン
// ──────────────────────────────────────────

export const AttrIconId = {
  FIRE:    'ICON_ATTR_FIRE',
  WATER:   'ICON_ATTR_WATER',
  THUNDER: 'ICON_ATTR_THUNDER',
  WIND:    'ICON_ATTR_WIND',
  LIGHT:   'ICON_ATTR_LIGHT',
  DARK:    'ICON_ATTR_DARK',
  EARTH:   'ICON_ATTR_EARTH',
  NONE:    'ICON_ATTR_NONE',
} as const;
export type AttrIconId = (typeof AttrIconId)[keyof typeof AttrIconId];

// ──────────────────────────────────────────
// メニューアイコン
// ──────────────────────────────────────────

export const MenuIconId = {
  QUEST:    'ICON_MENU_QUEST',
  SUMMON:   'ICON_MENU_SUMMON',
  UNITS:    'ICON_MENU_UNITS',
  PARTY:    'ICON_MENU_PARTY',
  ENHANCE:  'ICON_MENU_ENHANCE',
  SHOP:     'ICON_MENU_SHOP',
  PROFILE:  'ICON_MENU_PROFILE',
  GUILD:    'ICON_MENU_GUILD',
  ARENA:    'ICON_MENU_ARENA',
  ITEM:     'ICON_MENU_ITEM',
  SETTINGS: 'ICON_MENU_SETTINGS',
} as const;
export type MenuIconId = (typeof MenuIconId)[keyof typeof MenuIconId];

// ──────────────────────────────────────────
// 通貨アイコン
// ──────────────────────────────────────────

export const CurrencyIconId = {
  GOLD:           'ICON_CURRENCY_GOLD',
  DIAMOND:        'ICON_CURRENCY_DIAMOND',
  SUMMON_TICKET:  'ICON_CURRENCY_SUMMON_TICKET',
  STAMINA:        'ICON_CURRENCY_STAMINA',
  ARENA_COIN:     'ICON_CURRENCY_ARENA_COIN',
  GUILD_COIN:     'ICON_CURRENCY_GUILD_COIN',
} as const;
export type CurrencyIconId = (typeof CurrencyIconId)[keyof typeof CurrencyIconId];

// ──────────────────────────────────────────
// UIパーツ（ボタン）
// ──────────────────────────────────────────

export const BtnAssetId = {
  GOLD_PRIMARY:     'BTN_GOLD_PRIMARY',
  BLUE_CRYSTAL:     'BTN_BLUE_CRYSTAL',
  SUMMON_GACHA:     'BTN_SUMMON_GACHA',
  QUEST_ACTION:     'BTN_QUEST_ACTION',
  DANGER_RED:       'BTN_DANGER_RED',
  DISABLED_GRAY:    'BTN_DISABLED_GRAY',
  CLOSE:            'BTN_CLOSE',
  BACK:             'BTN_BACK',
} as const;
export type BtnAssetId = (typeof BtnAssetId)[keyof typeof BtnAssetId];

// ──────────────────────────────────────────
// UIパーツ（フレーム）
// ──────────────────────────────────────────

export const FrameAssetId = {
  UNIT_CARD_N:       'FRAME_UNIT_CARD_N',
  UNIT_CARD_R:       'FRAME_UNIT_CARD_R',
  UNIT_CARD_ARCANA:  'FRAME_UNIT_CARD_ARCANA',
  GACHA_RESULT:      'FRAME_GACHA_RESULT',
  PROFILE_AVATAR:    'FRAME_PROFILE_AVATAR',
  INFO_PANEL:        'FRAME_INFO_PANEL',
  REWARD_PANEL:      'FRAME_REWARD_PANEL',
} as const;
export type FrameAssetId = (typeof FrameAssetId)[keyof typeof FrameAssetId];

// ──────────────────────────────────────────
// エフェクト
// ──────────────────────────────────────────

export const EffectAssetId = {
  // ガチャ演出
  SUMMON_MAGIC_CIRCLE:  'EFFECT_SUMMON_MAGIC_CIRCLE',
  SUMMON_LIGHT_BURST:   'EFFECT_SUMMON_LIGHT_BURST',
  SUMMON_CRYSTAL_SHATTER:'EFFECT_SUMMON_CRYSTAL_SHATTER',
  SUMMON_CARD_REVEAL:   'EFFECT_SUMMON_CARD_REVEAL',
  SUMMON_SSR_AURA:      'EFFECT_SUMMON_SSR_AURA',
  SUMMON_RAINBOW:       'EFFECT_SUMMON_RAINBOW',
  // バトル
  LEVELUP_GLOW:         'EFFECT_LEVELUP_GLOW',
  AWAKENING_BURST:      'EFFECT_AWAKENING_BURST',
  EVOLUTION_PILLAR:     'EFFECT_EVOLUTION_PILLAR',
  // スキル
  SKILL_FIRE:           'EFFECT_SKILL_FIRE',
  SKILL_WATER:          'EFFECT_SKILL_WATER',
  SKILL_THUNDER:        'EFFECT_SKILL_THUNDER',
  SKILL_WIND:           'EFFECT_SKILL_WIND',
  SKILL_LIGHT:          'EFFECT_SKILL_LIGHT',
  SKILL_DARK:           'EFFECT_SKILL_DARK',
  // 召喚オーブ
  SUMMON_ORB_ARCANA:    'EFFECT_SUMMON_ORB_ARCANA',
  SUMMON_ORB_TUTORIAL:  'EFFECT_SUMMON_ORB_TUTORIAL',
} as const;
export type EffectAssetId = (typeof EffectAssetId)[keyof typeof EffectAssetId];

// ──────────────────────────────────────────
// アイテム
// ──────────────────────────────────────────

export const ItemAssetId = {
  CURRENCY_GOLD_COIN:      'ITEM_CURRENCY_GOLD_COIN',
  CURRENCY_DIAMOND:        'ITEM_CURRENCY_DIAMOND',
  CURRENCY_SUMMON_TICKET:  'ITEM_CURRENCY_SUMMON_TICKET',
  CONSUMABLE_HP_POTION_S:  'ITEM_CONSUMABLE_HP_POTION_S',
  CONSUMABLE_HP_POTION_M:  'ITEM_CONSUMABLE_HP_POTION_M',
  CONSUMABLE_STAMINA_ORB:  'ITEM_CONSUMABLE_STAMINA_ORB',
  MATERIAL_MAGIC_CRYSTAL_S:'ITEM_MATERIAL_MAGIC_CRYSTAL_S',
  MATERIAL_MAGIC_CRYSTAL_M:'ITEM_MATERIAL_MAGIC_CRYSTAL_M',
  MATERIAL_DRAGON_SCALE:   'ITEM_MATERIAL_DRAGON_SCALE',
  MATERIAL_AWAKENING_STONE:'ITEM_MATERIAL_AWAKENING_STONE',
} as const;
export type ItemAssetId = (typeof ItemAssetId)[keyof typeof ItemAssetId];

// ──────────────────────────────────────────
// 装備品
// ──────────────────────────────────────────

export const EquipAssetId = {
  WEAPON_ARCANA_SWORD_001:  'EQUIP_WEAPON_ARCANA_SWORD_001',
  WEAPON_DARK_BLADE_001:    'EQUIP_WEAPON_DARK_BLADE_001',
  WEAPON_FIRE_STAFF_001:    'EQUIP_WEAPON_FIRE_STAFF_001',
  WEAPON_THUNDER_LANCE_001: 'EQUIP_WEAPON_THUNDER_LANCE_001',
  ARMOR_ARCANA_PLATE_001:   'EQUIP_ARMOR_ARCANA_PLATE_001',
} as const;
export type EquipAssetId = (typeof EquipAssetId)[keyof typeof EquipAssetId];

// ──────────────────────────────────────────
// ポートレート・カットイン
// ──────────────────────────────────────────

export const PortraitAssetId = {
  HERO_HUMAN_MALE_001:     'PORTRAIT_HERO_HUMAN_MALE_001',
  HERO_GODDESS_FEMALE_001: 'PORTRAIT_HERO_GODDESS_FEMALE_001',
  NPC_GUILD_MASTER:        'PORTRAIT_NPC_GUILD_MASTER',
  NPC_SHOP_KEEPER:         'PORTRAIT_NPC_SHOP_KEEPER',
} as const;
export type PortraitAssetId = (typeof PortraitAssetId)[keyof typeof PortraitAssetId];

export const CutinAssetId = {
  HERO_HUMAN_MALE_SKILL:    'CUTIN_HERO_HUMAN_MALE_SKILL',
  HERO_HUMAN_MALE_ULTIMATE: 'CUTIN_HERO_HUMAN_MALE_ULTIMATE',
} as const;
export type CutinAssetId = (typeof CutinAssetId)[keyof typeof CutinAssetId];

// ──────────────────────────────────────────
// 全ID統合型（型安全な全体横断用）
// ──────────────────────────────────────────

export type AssetId =
  | BgAssetId
  | HeroAssetId
  | UnitAssetId
  | EnemyAssetId
  | AttrIconId
  | MenuIconId
  | CurrencyIconId
  | BtnAssetId
  | FrameAssetId
  | EffectAssetId
  | ItemAssetId
  | EquipAssetId
  | PortraitAssetId
  | CutinAssetId;

// ──────────────────────────────────────────
// ElementType → AttrIconId マッピング
// ──────────────────────────────────────────

import type { ElementType } from '../../types';

export const ELEMENT_TO_ATTR_ICON: Record<ElementType, AttrIconId> = {
  fire:    AttrIconId.FIRE,
  water:   AttrIconId.WATER,
  thunder: AttrIconId.THUNDER,
  wind:    AttrIconId.WIND,
  light:   AttrIconId.LIGHT,
  dark:    AttrIconId.DARK,
  earth:   AttrIconId.EARTH,
};
