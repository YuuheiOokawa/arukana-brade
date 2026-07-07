import type { EventQuest, RaidBossMaster } from '../types';

const NOW = Date.now();
const DAY = 86400000;

export const EVENT_QUESTS: EventQuest[] = [
  {
    id: 'event_dark_invasion',
    name: '闇の軍勢来襲',
    description: '突如現れた闇の軍勢。強力な敵が待ち受ける期間限定イベント！',
    startTimestamp: NOW - DAY,
    endTimestamp: NOW + 13 * DAY,
    emoji: '🌑',
    bannerColor: 'linear-gradient(135deg, #1a0030, #4c0080)',
    stages: [
      {
        id: 'event_dark_1',
        name: '闇の入口',
        staminaCost: 5,
        recommendedPower: 3000,
        rewardGold: 1500,
        rewardExp: 300,
        rewardItems: [
          { itemId: 'item_dark_shard', quantity: 2, chance: 0.8 },
          { itemId: 'item_dark_gem', quantity: 1, chance: 0.3 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 20 }, { enemyId: 'enemy_dark_mage', level: 18 }] },
        ],
      },
      {
        id: 'event_dark_2',
        name: '闇の回廊',
        staminaCost: 8,
        recommendedPower: 6000,
        rewardGold: 3000,
        rewardExp: 600,
        rewardItems: [
          { itemId: 'item_dark_shard', quantity: 3, chance: 1.0 },
          { itemId: 'item_dark_gem', quantity: 2, chance: 0.5 },
          { itemId: 'item_magic_crystal', quantity: 1, chance: 0.3 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 30 }, { enemyId: 'enemy_dark_mage', level: 28 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 35 }], isBoss: true },
        ],
      },
      {
        id: 'event_dark_3',
        name: '闇の玉座',
        staminaCost: 12,
        recommendedPower: 12000,
        rewardGold: 6000,
        rewardExp: 1200,
        rewardItems: [
          { itemId: 'item_dark_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.4 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.2 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 45 }, { enemyId: 'enemy_dark_mage', level: 45 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 50 }] },
          { enemies: [{ enemyId: 'enemy_dark_dragon', level: 55 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_fire_trial',
    name: '炎獄の試練',
    description: '灼熱の試練場へようこそ。炎属性に特攻の敵が待つ。',
    startTimestamp: NOW - 2 * DAY,
    endTimestamp: NOW + 5 * DAY,
    emoji: '🔥',
    bannerColor: 'linear-gradient(135deg, #3d0000, #cc2200)',
    stages: [
      {
        id: 'event_fire_1',
        name: '炎の洗礼',
        staminaCost: 6,
        recommendedPower: 4000,
        rewardGold: 2000,
        rewardExp: 400,
        rewardItems: [
          { itemId: 'item_fire_gem', quantity: 2, chance: 1.0 },
          { itemId: 'item_dragon_scale', quantity: 1, chance: 0.25 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_fire_elemental', level: 25 }, { enemyId: 'enemy_lava_golem', level: 25 }] },
        ],
      },
      {
        id: 'event_fire_2',
        name: '炎獄の深淵',
        staminaCost: 10,
        recommendedPower: 9000,
        rewardGold: 5000,
        rewardExp: 1000,
        rewardItems: [
          { itemId: 'item_fire_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_dragon_scale', quantity: 2, chance: 0.5 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.15 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_fire_elemental', level: 40 }, { enemyId: 'enemy_lava_golem', level: 38 }] },
          { enemies: [{ enemyId: 'enemy_fire_dragon', level: 50 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_light_temple',
    name: '聖光の神殿',
    description: '古代の神殿に封じられた聖なる力を解放せよ！光の試練が待ち受ける。',
    startTimestamp: NOW - 3 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '✨',
    bannerColor: 'linear-gradient(135deg, #2a2000, #aa8800)',
    stages: [
      {
        id: 'event_light_1',
        name: '神殿の前庭',
        staminaCost: 5,
        recommendedPower: 3500,
        rewardGold: 1800,
        rewardExp: 350,
        rewardItems: [
          { itemId: 'item_light_gem', quantity: 2, chance: 1.0 },
          { itemId: 'item_holy_stone', quantity: 1, chance: 0.4 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 22 }, { enemyId: 'enemy_dark_mage', level: 20 }] },
        ],
      },
      {
        id: 'event_light_2',
        name: '神殿の回廊',
        staminaCost: 8,
        recommendedPower: 7000,
        rewardGold: 3500,
        rewardExp: 700,
        rewardItems: [
          { itemId: 'item_light_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_holy_stone', quantity: 2, chance: 0.5 },
          { itemId: 'item_angel_feather', quantity: 1, chance: 0.3 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 35 }, { enemyId: 'enemy_dark_mage', level: 33 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 40 }], isBoss: true },
        ],
      },
      {
        id: 'event_light_3',
        name: '神殿の最深部',
        staminaCost: 12,
        recommendedPower: 14000,
        rewardGold: 7000,
        rewardExp: 1400,
        rewardItems: [
          { itemId: 'item_light_gem', quantity: 4, chance: 1.0 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.45 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.2 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_knight', level: 50 }, { enemyId: 'enemy_dark_mage', level: 50 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 55 }] },
          { enemies: [{ enemyId: 'enemy_dark_dragon', level: 60 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_thunder_dungeon',
    name: '雷鳴のダンジョン',
    description: '稲妻が走る地下深くの迷宮。雷属性の強敵が待ち構える！',
    startTimestamp: NOW - 1 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '⚡',
    bannerColor: 'linear-gradient(135deg, #1a1a00, #7a7a00)',
    stages: [
      {
        id: 'event_thunder_1',
        name: '雷鳴の入口',
        staminaCost: 6,
        recommendedPower: 4500,
        rewardGold: 2200,
        rewardExp: 450,
        rewardItems: [
          { itemId: 'item_thunder_gem', quantity: 2, chance: 1.0 },
          { itemId: 'item_thunder_shard', quantity: 2, chance: 0.6 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 28 }, { enemyId: 'enemy_dark_mage', level: 25 }] },
        ],
      },
      {
        id: 'event_thunder_2',
        name: '稲妻の回路',
        staminaCost: 9,
        recommendedPower: 9500,
        rewardGold: 4500,
        rewardExp: 900,
        rewardItems: [
          { itemId: 'item_thunder_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_thunder_core', quantity: 1, chance: 0.4 },
          { itemId: 'item_magic_crystal', quantity: 2, chance: 0.35 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 42 }, { enemyId: 'enemy_dark_knight', level: 40 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 48 }], isBoss: true },
        ],
      },
      {
        id: 'event_thunder_3',
        name: '雷神の間',
        staminaCost: 14,
        recommendedPower: 16000,
        rewardGold: 8000,
        rewardExp: 1600,
        rewardItems: [
          { itemId: 'item_thunder_gem', quantity: 4, chance: 1.0 },
          { itemId: 'item_thunder_core', quantity: 2, chance: 0.5 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.3 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.15 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 58 }, { enemyId: 'enemy_dark_knight', level: 58 }] },
          { enemies: [{ enemyId: 'enemy_fire_dragon', level: 65 }] },
          { enemies: [{ enemyId: 'enemy_dark_dragon', level: 70 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_earth_cave',
    name: '大地の洞窟探索',
    description: '古代の財宝が眠るという地下洞窟。土属性の強敵が立ちはだかる！',
    startTimestamp: NOW - 4 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '🪨',
    bannerColor: 'linear-gradient(135deg, #1a0a00, #5a3300)',
    stages: [
      {
        id: 'event_earth_1',
        name: '洞窟の入口',
        staminaCost: 5,
        recommendedPower: 3000,
        rewardGold: 1600,
        rewardExp: 320,
        rewardItems: [
          { itemId: 'item_earth_gem', quantity: 2, chance: 0.9 },
          { itemId: 'item_stone_core', quantity: 1, chance: 0.4 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 18 }, { enemyId: 'enemy_lava_golem', level: 16 }] },
        ],
      },
      {
        id: 'event_earth_2',
        name: '洞窟の奥地',
        staminaCost: 9,
        recommendedPower: 8000,
        rewardGold: 4000,
        rewardExp: 800,
        rewardItems: [
          { itemId: 'item_earth_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_stone_core', quantity: 2, chance: 0.5 },
          { itemId: 'item_mana_stone', quantity: 1, chance: 0.25 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 38 }, { enemyId: 'enemy_dark_knight', level: 35 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 42 }], isBoss: true },
        ],
      },
      {
        id: 'event_earth_3',
        name: '古代の石室',
        staminaCost: 12,
        recommendedPower: 13000,
        rewardGold: 6500,
        rewardExp: 1300,
        rewardItems: [
          { itemId: 'item_earth_gem', quantity: 4, chance: 1.0 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.4 },
          { itemId: 'item_dragon_scale', quantity: 1, chance: 0.3 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.15 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_lava_golem', level: 52 }, { enemyId: 'enemy_lava_golem', level: 50 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 58 }] },
          { enemies: [{ enemyId: 'enemy_dark_dragon', level: 62 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_wind_peak',
    name: '疾風の霊峰',
    description: '天を裂く風が吹き荒れる霊峰。風の精霊たちの試練を乗り越えろ！',
    startTimestamp: NOW - 1 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '🌪️',
    bannerColor: 'linear-gradient(135deg, #00301a, #00885a)',
    stages: [
      {
        id: 'event_wind_1',
        name: '風の登山道',
        staminaCost: 5,
        recommendedPower: 3500,
        rewardGold: 1800,
        rewardExp: 360,
        rewardItems: [
          { itemId: 'item_wind_gem', quantity: 2, chance: 1.0 },
          { itemId: 'item_harpy_feather', quantity: 1, chance: 0.4 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_wind_sprite', level: 22 }, { enemyId: 'enemy_harpy', level: 20 }] },
        ],
      },
      {
        id: 'event_wind_2',
        name: '乱気流の断崖',
        staminaCost: 9,
        recommendedPower: 8500,
        rewardGold: 4200,
        rewardExp: 850,
        rewardItems: [
          { itemId: 'item_wind_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_wind_crystal', quantity: 1, chance: 0.4 },
          { itemId: 'item_magic_crystal', quantity: 2, chance: 0.3 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_harpy', level: 38 }, { enemyId: 'enemy_wind_sprite', level: 36 }] },
          { enemies: [{ enemyId: 'enemy_storm_eagle', level: 44 }], isBoss: true },
        ],
      },
      {
        id: 'event_wind_3',
        name: '霊峰の頂',
        staminaCost: 13,
        recommendedPower: 15000,
        rewardGold: 7500,
        rewardExp: 1500,
        rewardItems: [
          { itemId: 'item_wind_gem', quantity: 4, chance: 1.0 },
          { itemId: 'item_wind_crystal', quantity: 2, chance: 0.5 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.35 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.18 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_storm_eagle', level: 55 }, { enemyId: 'enemy_harpy', level: 53 }] },
          { enemies: [{ enemyId: 'enemy_wind_sprite', level: 58 }, { enemyId: 'enemy_storm_eagle', level: 56 }] },
          { enemies: [{ enemyId: 'enemy_wind_dragon', level: 64 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_sea_treasure',
    name: '蒼海の秘宝',
    description: '海底に沈んだ財宝船を探索せよ。深海の魔物たちが宝を守っている！',
    startTimestamp: NOW - 2 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '🐚',
    bannerColor: 'linear-gradient(135deg, #001a3a, #0066aa)',
    stages: [
      {
        id: 'event_sea_1',
        name: '沈没船の甲板',
        staminaCost: 5,
        recommendedPower: 3200,
        rewardGold: 1700,
        rewardExp: 340,
        rewardItems: [
          { itemId: 'item_water_gem', quantity: 2, chance: 1.0 },
          { itemId: 'item_water_pearl', quantity: 1, chance: 0.35 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_water_slime', level: 20 }, { enemyId: 'enemy_water_slime', level: 20 }] },
        ],
      },
      {
        id: 'event_sea_2',
        name: '水没した宝物庫',
        staminaCost: 9,
        recommendedPower: 8000,
        rewardGold: 4000,
        rewardExp: 800,
        rewardItems: [
          { itemId: 'item_water_gem', quantity: 3, chance: 1.0 },
          { itemId: 'item_sea_jewel', quantity: 1, chance: 0.4 },
          { itemId: 'item_ice_shard', quantity: 2, chance: 0.35 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_water_wizard', level: 37 }, { enemyId: 'enemy_water_slime', level: 35 }] },
          { enemies: [{ enemyId: 'enemy_sea_serpent', level: 43 }], isBoss: true },
        ],
      },
      {
        id: 'event_sea_3',
        name: '深海の玉座',
        staminaCost: 13,
        recommendedPower: 14500,
        rewardGold: 7200,
        rewardExp: 1450,
        rewardItems: [
          { itemId: 'item_water_gem', quantity: 4, chance: 1.0 },
          { itemId: 'item_sea_jewel', quantity: 2, chance: 0.5 },
          { itemId: 'item_arcana_shard', quantity: 1, chance: 0.35 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.18 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_sea_serpent', level: 54 }, { enemyId: 'enemy_water_wizard', level: 52 }] },
          { enemies: [{ enemyId: 'enemy_water_slime', level: 56 }, { enemyId: 'enemy_sea_serpent', level: 55 }] },
          { enemies: [{ enemyId: 'enemy_sea_dragon', level: 62 }], isBoss: true },
        ],
      },
    ],
  },
  {
    id: 'event_sage_library',
    name: '賢者の書庫',
    description: '禁断の知識が眠る古代図書館。「スキルの書」を求めて挑戦者が集う高難度イベント！',
    startTimestamp: NOW - 1 * DAY,
    endTimestamp: NOW + 14 * DAY,
    emoji: '📜',
    bannerColor: 'linear-gradient(135deg, #1a0a30, #6633aa)',
    stages: [
      {
        id: 'event_library_1',
        name: '書庫の入口',
        staminaCost: 8,
        recommendedPower: 10000,
        rewardGold: 4000,
        rewardExp: 900,
        rewardItems: [
          { itemId: 'item_exp_tome', quantity: 1, chance: 0.5 },
          { itemId: 'item_ancient_rune', quantity: 1, chance: 0.35 },
          { itemId: 'item_magic_crystal', quantity: 2, chance: 0.4 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_witch', level: 42 }, { enemyId: 'enemy_dark_mage', level: 40 }] },
          { enemies: [{ enemyId: 'enemy_witch', level: 45 }], isBoss: true },
        ],
      },
      {
        id: 'event_library_2',
        name: '禁書の回廊',
        staminaCost: 12,
        recommendedPower: 20000,
        rewardGold: 8000,
        rewardExp: 1800,
        rewardItems: [
          { itemId: 'item_exp_tome', quantity: 2, chance: 0.6 },
          { itemId: 'item_skill_book', quantity: 1, chance: 0.1 },
          { itemId: 'item_ancient_rune', quantity: 2, chance: 0.4 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_dark_mage', level: 58 }, { enemyId: 'enemy_witch', level: 58 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 65 }], isBoss: true },
        ],
      },
      {
        id: 'event_library_3',
        name: '大賢者の間',
        staminaCost: 16,
        recommendedPower: 35000,
        rewardGold: 14000,
        rewardExp: 3200,
        rewardItems: [
          { itemId: 'item_skill_book', quantity: 1, chance: 0.25 },
          { itemId: 'item_star_of_wisdom', quantity: 1, chance: 0.3 },
          { itemId: 'item_arcana_shard', quantity: 2, chance: 0.45 },
          { itemId: 'item_summon_ticket', quantity: 1, chance: 0.2 },
        ],
        waves: [
          { enemies: [{ enemyId: 'enemy_witch', level: 72 }, { enemyId: 'enemy_dark_mage', level: 70 }] },
          { enemies: [{ enemyId: 'enemy_lich', level: 78 }, { enemyId: 'enemy_witch', level: 75 }] },
          { enemies: [{ enemyId: 'enemy_boss_lich', level: 85 }], isBoss: true },
        ],
      },
    ],
  },
];

// 武具の試練場は常設イベント（実質無期限）
const PERMANENT = NOW + 3650 * DAY;

export const EQUIPMENT_TRIAL_EVENT: EventQuest = {
  id: 'event_equipment_forge',
  name: '武具の試練場',
  description: '伝説の鍛冶神が守る武具庫。強敵を倒して武器・防具・アクセサリーを手に入れろ！【常設】',
  startTimestamp: NOW - DAY,
  endTimestamp: PERMANENT,
  emoji: '⚒️',
  bannerColor: 'linear-gradient(135deg, #2a1a05, #8a5510)',
  stages: [
    {
      id: 'event_forge_1',
      name: '見習いの武具庫',
      staminaCost: 6,
      recommendedPower: 3000,
      rewardGold: 1500,
      rewardExp: 300,
      rewardItems: [
        { itemId: 'item_stone_core', quantity: 1, chance: 0.3 },
      ],
      rewardEquipments: [
        { equipmentId: 'equip_sword_iron', chance: 0.35 },
        { equipmentId: 'equip_leather_armor', chance: 0.35 },
        { equipmentId: 'equip_ring_iron', chance: 0.3 },
        { equipmentId: 'equip_iron_shield', chance: 0.25 },
        { equipmentId: 'equip_magic_rod', chance: 0.25 },
      ],
      waves: [
        { enemies: [{ enemyId: 'enemy_golem', level: 18 }, { enemyId: 'enemy_knight', level: 18 }] },
        { enemies: [{ enemyId: 'enemy_golem', level: 22 }], isBoss: true },
      ],
    },
    {
      id: 'event_forge_2',
      name: '職人の工房',
      staminaCost: 10,
      recommendedPower: 9000,
      rewardGold: 4000,
      rewardExp: 800,
      rewardItems: [
        { itemId: 'item_magic_crystal', quantity: 1, chance: 0.3 },
      ],
      rewardEquipments: [
        { equipmentId: 'equip_sword_silver', chance: 0.25 },
        { equipmentId: 'equip_chain_mail', chance: 0.25 },
        { equipmentId: 'equip_amulet_guardian', chance: 0.2 },
        { equipmentId: 'equip_wind_dagger', chance: 0.2 },
        { equipmentId: 'equip_mithril_sword', chance: 0.18 },
        { equipmentId: 'equip_ring_recovery', chance: 0.18 },
      ],
      waves: [
        { enemies: [{ enemyId: 'enemy_knight', level: 40 }, { enemyId: 'enemy_golem', level: 40 }] },
        { enemies: [{ enemyId: 'enemy_rock_troll', level: 46 }], isBoss: true },
      ],
    },
    {
      id: 'event_forge_3',
      name: '匠の霊廟',
      staminaCost: 14,
      recommendedPower: 25000,
      rewardGold: 9000,
      rewardExp: 2000,
      rewardItems: [
        { itemId: 'item_elemental_core', quantity: 1, chance: 0.25 },
      ],
      rewardEquipments: [
        { equipmentId: 'equip_flame_blade', chance: 0.1 },
        { equipmentId: 'equip_water_staff', chance: 0.1 },
        { equipmentId: 'equip_thunder_bow', chance: 0.1 },
        { equipmentId: 'equip_ice_spear', chance: 0.1 },
        { equipmentId: 'equip_earth_hammer', chance: 0.1 },
        { equipmentId: 'equip_dark_lance', chance: 0.1 },
        { equipmentId: 'equip_plate_armor', chance: 0.1 },
        { equipmentId: 'equip_mage_robe', chance: 0.1 },
        { equipmentId: 'equip_pendant_life', chance: 0.08 },
        { equipmentId: 'equip_ring_power', chance: 0.08 },
      ],
      waves: [
        { enemies: [{ enemyId: 'enemy_knight', level: 60 }, { enemyId: 'enemy_rock_troll', level: 58 }] },
        { enemies: [{ enemyId: 'enemy_golem', level: 62 }, { enemyId: 'enemy_knight', level: 62 }] },
        { enemies: [{ enemyId: 'enemy_earth_giant', level: 68 }], isBoss: true },
      ],
    },
    {
      id: 'event_forge_4',
      name: '伝説の大武具庫',
      staminaCost: 20,
      recommendedPower: 60000,
      rewardGold: 18000,
      rewardExp: 4500,
      rewardItems: [
        { itemId: 'item_elemental_core', quantity: 2, chance: 0.3 },
        { itemId: 'item_arcana_shard', quantity: 1, chance: 0.3 },
      ],
      rewardEquipments: [
        { equipmentId: 'equip_arcana_blade', chance: 0.04 },
        { equipmentId: 'equip_dragon_armor', chance: 0.04 },
        { equipmentId: 'equip_crown_arcana', chance: 0.04 },
        { equipmentId: 'equip_light_sword', chance: 0.04 },
        { equipmentId: 'equip_dark_scythe', chance: 0.04 },
        { equipmentId: 'equip_earth_shield', chance: 0.04 },
        { equipmentId: 'equip_brooch_dragon', chance: 0.04 },
        { equipmentId: 'equip_celestial_robe', chance: 0.04 },
        { equipmentId: 'equip_shadow_cloak', chance: 0.12 },
        { equipmentId: 'equip_frost_mail', chance: 0.12 },
        { equipmentId: 'equip_wind_robe', chance: 0.12 },
        { equipmentId: 'equip_talisman_thunder', chance: 0.12 },
      ],
      waves: [
        { enemies: [{ enemyId: 'enemy_earth_giant', level: 78 }, { enemyId: 'enemy_knight', level: 76 }] },
        { enemies: [{ enemyId: 'enemy_rock_troll', level: 80 }, { enemyId: 'enemy_earth_giant', level: 80 }] },
        { enemies: [{ enemyId: 'enemy_dragon_fire', level: 88 }], isBoss: true },
      ],
    },
  ],
};

EVENT_QUESTS.push(EQUIPMENT_TRIAL_EVENT);

export const RAID_BOSSES: RaidBossMaster[] = [
  {
    id: 'raid_dark_lord',
    name: '覇闇竜バルドルアス',
    element: 'dark',
    totalHp: 10000000,
    emoji: '🐲',
    bannerColor: 'linear-gradient(135deg, #0a001a, #4c0080)',
    entryStaminaCost: 3,
    endTimestamp: NOW + 7 * DAY,
    rewards: [
      { minDamage: 0,       items: ['item_dark_shard'] },
      { minDamage: 50000,   items: ['item_dark_gem', 'item_dark_shard'] },
      { minDamage: 200000,  items: ['item_arcana_shard', 'item_dark_gem'] },
      { minDamage: 1000000, items: ['item_summon_ticket', 'item_arcana_shard'] },
    ],
    waves: [
      {
        enemies: [
          { enemyId: 'enemy_dark_dragon', level: 80 },
        ],
        isBoss: true,
      },
    ],
  },
  {
    id: 'raid_fire_titan',
    name: '炎神獣イグニドラ',
    element: 'fire',
    totalHp: 7500000,
    emoji: '🔥',
    bannerColor: 'linear-gradient(135deg, #1a0000, #8b0000)',
    entryStaminaCost: 3,
    endTimestamp: NOW + 10 * DAY,
    rewards: [
      { minDamage: 0,      items: ['item_fire_gem'] },
      { minDamage: 30000,  items: ['item_fire_gem', 'item_dragon_scale'] },
      { minDamage: 150000, items: ['item_arcana_shard', 'item_fire_gem'] },
      { minDamage: 800000, items: ['item_summon_ticket', 'item_arcana_shard'] },
    ],
    waves: [
      {
        enemies: [
          { enemyId: 'enemy_fire_dragon', level: 70 },
        ],
        isBoss: true,
      },
    ],
  },
  {
    id: 'raid_thunder_wyrm',
    name: '雷竜皇バルトルム',
    element: 'thunder',
    totalHp: 8500000,
    emoji: '🌩️',
    bannerColor: 'linear-gradient(135deg, #0a0a00, #555500)',
    entryStaminaCost: 3,
    endTimestamp: NOW + 12 * DAY,
    rewards: [
      { minDamage: 0,       items: ['item_thunder_gem'] },
      { minDamage: 40000,   items: ['item_thunder_gem', 'item_thunder_core'] },
      { minDamage: 180000,  items: ['item_arcana_shard', 'item_thunder_gem'] },
      { minDamage: 900000,  items: ['item_summon_ticket', 'item_arcana_shard'] },
    ],
    waves: [
      {
        enemies: [
          { enemyId: 'enemy_dark_dragon', level: 75 },
        ],
        isBoss: true,
      },
    ],
  },
  {
    id: 'raid_water_leviathan',
    name: '深海魔獣レヴィアタン',
    element: 'water',
    totalHp: 9000000,
    emoji: '🐋',
    bannerColor: 'linear-gradient(135deg, #001a3a, #004488)',
    entryStaminaCost: 4,
    endTimestamp: NOW + 9 * DAY,
    rewards: [
      { minDamage: 0,        items: ['item_water_gem'] },
      { minDamage: 50000,    items: ['item_water_gem', 'item_water_pearl'] },
      { minDamage: 220000,   items: ['item_arcana_shard', 'item_water_gem'] },
      { minDamage: 1100000,  items: ['item_arcana_orb', 'item_summon_ticket'] },
    ],
    waves: [
      {
        enemies: [
          { enemyId: 'enemy_dark_dragon', level: 85 },
        ],
        isBoss: true,
      },
    ],
  },
];

export const getActiveEvents = (): EventQuest[] => {
  const now = Date.now();
  return EVENT_QUESTS.filter(e => e.startTimestamp <= now && now <= e.endTimestamp);
};

export const getActiveRaids = (): RaidBossMaster[] => {
  const now = Date.now();
  return RAID_BOSSES.filter(r => now <= r.endTimestamp);
};

export const getEventStage = (stageId: string) => {
  for (const event of EVENT_QUESTS) {
    const found = event.stages.find(s => s.id === stageId);
    if (found) return found;
  }
  return undefined;
};

// レイドボスをバトルシステムが読める QuestStage に変換
export const getRaidStage = (stageId: string) => {
  // stageId 形式: raid_<bossId>_stage
  const bossId = stageId.replace(/^raid_/, '').replace(/_stage$/, '');
  const boss = RAID_BOSSES.find(b => b.id === bossId);
  if (!boss) return undefined;
  return {
    id: stageId,
    name: boss.name,
    staminaCost: boss.entryStaminaCost,
    recommendedPower: 50000,
    waves: boss.waves,
    rewardGold: 3000,
    rewardExp: 1000,
    rewardItems: boss.rewards[0]?.items.map(itemId => ({ itemId, quantity: 1, chance: 1.0 })) ?? [],
    isCleared: false,
    raidBossId: boss.id,
  };
};
