import type { QuestWorld } from '../types';

export const QUEST_WORLDS: QuestWorld[] = [
  // ========================================
  // ===== World 1: 始まりの大地 (10ステージ) =====
  // ========================================
  {
    id: 'world_1',
    name: '始まりの大地',
    areas: [
      {
        id: 'area_1_1',
        name: '忘れられた森',
        description: '魔物が蔓延る森。冒険者の試練の場。',
        emoji: '🌲',
        stages: [
          {
            id: 'stage_1_1_1',
            name: '1-1 森の入口',
            staminaCost: 6,
            recommendedPower: 2000,
            rewardGold: 200,
            rewardExp: 100,
            rewardItems: [{ itemId: 'item_goblin_fang', quantity: 1, chance: 0.5 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_goblin', level: 1 }, { enemyId: 'enemy_bat', level: 1 }] },
              { enemies: [{ enemyId: 'enemy_goblin', level: 2 }, { enemyId: 'enemy_goblin', level: 2 }] },
            ],
          },
          {
            id: 'stage_1_1_2',
            name: '1-2 深い木立',
            staminaCost: 6,
            recommendedPower: 3000,
            rewardGold: 300,
            rewardExp: 150,
            rewardItems: [{ itemId: 'item_goblin_fang', quantity: 2, chance: 0.5 }, { itemId: 'item_wolf_fang', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_goblin', level: 3 }, { enemyId: 'enemy_wolf', level: 2 }] },
              { enemies: [{ enemyId: 'enemy_wolf', level: 3 }, { enemyId: 'enemy_wolf', level: 3 }] },
            ],
          },
          {
            id: 'stage_1_1_3',
            name: '1-3 森の守護者',
            staminaCost: 8,
            recommendedPower: 5000,
            rewardGold: 500,
            rewardExp: 250,
            rewardItems: [{ itemId: 'item_stone_core', quantity: 1, chance: 0.4 }, { itemId: 'item_exp_s', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_goblin', level: 5 }, { enemyId: 'enemy_skeleton', level: 4 }] },
              { enemies: [{ enemyId: 'enemy_golem', level: 5 }], isBoss: true },
            ],
          },
          {
            id: 'stage_1_1_4',
            name: '1-4 霧の泉',
            staminaCost: 7,
            recommendedPower: 4000,
            rewardGold: 400,
            rewardExp: 200,
            rewardItems: [{ itemId: 'item_magic_crystal', quantity: 1, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_bat', level: 4 }, { enemyId: 'enemy_wind_sprite', level: 3 }] },
              { enemies: [{ enemyId: 'enemy_goblin', level: 5 }, { enemyId: 'enemy_wind_sprite', level: 4 }] },
            ],
          },
          {
            id: 'stage_1_1_5',
            name: '1-5 古びた祠',
            staminaCost: 8,
            recommendedPower: 5500,
            rewardGold: 550,
            rewardExp: 280,
            rewardItems: [{ itemId: 'item_wind_gem', quantity: 1, chance: 0.25 }, { itemId: 'item_exp_s', quantity: 1, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_skeleton', level: 5 }, { enemyId: 'enemy_skeleton', level: 5 }] },
              { enemies: [{ enemyId: 'enemy_harpy', level: 6 }], isBoss: true },
            ],
          },
        ],
      },
      {
        id: 'area_1_2',
        name: '枯れた平原',
        description: '魔力が枯渇した荒廃した平原。',
        emoji: '🏜️',
        stages: [
          {
            id: 'stage_1_2_1',
            name: '1-6 荒野の彷徨',
            staminaCost: 8,
            recommendedPower: 6000,
            rewardGold: 600,
            rewardExp: 300,
            rewardItems: [{ itemId: 'item_slime_gel', quantity: 1, chance: 0.5 }, { itemId: 'item_fire_gem', quantity: 1, chance: 0.2 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_slime', level: 6 }, { enemyId: 'enemy_slime', level: 6 }] },
              { enemies: [{ enemyId: 'enemy_wolf', level: 8 }, { enemyId: 'enemy_skeleton', level: 7 }] },
            ],
          },
          {
            id: 'stage_1_2_2',
            name: '1-7 魔女の棲家',
            staminaCost: 10,
            recommendedPower: 8000,
            rewardGold: 800,
            rewardExp: 400,
            rewardItems: [{ itemId: 'item_magic_crystal', quantity: 1, chance: 0.4 }, { itemId: 'item_water_gem', quantity: 1, chance: 0.2 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_bat', level: 8 }, { enemyId: 'enemy_skeleton', level: 9 }] },
              { enemies: [{ enemyId: 'enemy_witch', level: 10 }], isBoss: true },
            ],
          },
          {
            id: 'stage_1_2_3',
            name: '1-8 廃墟の迷宮',
            staminaCost: 10,
            recommendedPower: 9000,
            rewardGold: 900,
            rewardExp: 450,
            rewardItems: [{ itemId: 'item_dark_shard', quantity: 1, chance: 0.45 }, { itemId: 'item_bone', quantity: 2, chance: 0.6 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_skeleton', level: 9 }, { enemyId: 'enemy_skeleton', level: 9 }] },
              { enemies: [{ enemyId: 'enemy_knight', level: 10 }, { enemyId: 'enemy_bat', level: 8 }] },
            ],
          },
          {
            id: 'stage_1_2_4',
            name: '1-9 影の谷',
            staminaCost: 11,
            recommendedPower: 10000,
            rewardGold: 1000,
            rewardExp: 500,
            rewardItems: [{ itemId: 'item_wolf_fang', quantity: 2, chance: 0.5 }, { itemId: 'item_exp_s', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_wolf', level: 10 }, { enemyId: 'enemy_wolf', level: 10 }] },
              { enemies: [{ enemyId: 'enemy_skeleton', level: 11 }, { enemyId: 'enemy_knight', level: 10 }] },
            ],
          },
          {
            id: 'stage_1_2_5',
            name: '1-10 闇騎士の砦【BOSS】',
            staminaCost: 12,
            recommendedPower: 12000,
            rewardGold: 1500,
            rewardExp: 750,
            rewardItems: [{ itemId: 'item_dark_shard', quantity: 2, chance: 0.5 }, { itemId: 'item_exp_m', quantity: 1, chance: 0.3 }, { itemId: 'item_dark_gem', quantity: 1, chance: 0.2 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_skeleton', level: 11 }, { enemyId: 'enemy_knight', level: 10 }] },
              { enemies: [{ enemyId: 'enemy_knight', level: 13 }, { enemyId: 'enemy_wolf', level: 12 }] },
              { enemies: [{ enemyId: 'enemy_dark_knight', level: 15 }], isBoss: true },
            ],
          },
        ],
      },
    ],
  },

  // ========================================
  // ===== World 2: 炎獄の谷 (fire world, 10ステージ) =====
  // ========================================
  {
    id: 'world_2',
    name: '炎獄の谷',
    areas: [
      {
        id: 'area_2_1',
        name: '溶岩の洞窟',
        description: '炎の竜が棲む危険な洞窟。',
        emoji: '🌋',
        stages: [
          {
            id: 'stage_2_1_1',
            name: '2-1 炎の入口',
            staminaCost: 12,
            recommendedPower: 15000,
            rewardGold: 1500,
            rewardExp: 800,
            rewardItems: [{ itemId: 'item_slime_gel', quantity: 2, chance: 0.5 }, { itemId: 'item_fire_gem', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_slime', level: 15 }, { enemyId: 'enemy_slime', level: 15 }] },
              { enemies: [{ enemyId: 'enemy_fire_orc', level: 16 }, { enemyId: 'enemy_slime', level: 15 }] },
            ],
          },
          {
            id: 'stage_2_1_2',
            name: '2-2 炎精霊の巣',
            staminaCost: 12,
            recommendedPower: 16000,
            rewardGold: 1600,
            rewardExp: 850,
            rewardItems: [{ itemId: 'item_fire_crystal', quantity: 1, chance: 0.45 }, { itemId: 'item_fire_gem', quantity: 1, chance: 0.25 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_fire_elemental', level: 16 }, { enemyId: 'enemy_fire_elemental', level: 16 }] },
              { enemies: [{ enemyId: 'enemy_fire_orc', level: 18 }, { enemyId: 'enemy_fire_elemental', level: 17 }] },
            ],
          },
          {
            id: 'stage_2_1_3',
            name: '2-3 溶岩地帯',
            staminaCost: 13,
            recommendedPower: 18000,
            rewardGold: 1800,
            rewardExp: 950,
            rewardItems: [{ itemId: 'item_stone_core', quantity: 1, chance: 0.5 }, { itemId: 'item_fire_crystal', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_fire_orc', level: 18 }, { enemyId: 'enemy_fire_orc', level: 18 }] },
              { enemies: [{ enemyId: 'enemy_lava_golem', level: 20 }], isBoss: true },
            ],
          },
          {
            id: 'stage_2_1_4',
            name: '2-4 熔炎の峡谷',
            staminaCost: 13,
            recommendedPower: 20000,
            rewardGold: 2000,
            rewardExp: 1100,
            rewardItems: [{ itemId: 'item_fire_gem', quantity: 2, chance: 0.4 }, { itemId: 'item_exp_m', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_lava_golem', level: 20 }, { enemyId: 'enemy_fire_elemental', level: 20 }] },
              { enemies: [{ enemyId: 'enemy_fire_orc', level: 22 }, { enemyId: 'enemy_lava_golem', level: 21 }] },
            ],
          },
          {
            id: 'stage_2_1_5',
            name: '2-5 炎竜の巣【BOSS】',
            staminaCost: 15,
            recommendedPower: 28000,
            rewardGold: 3000,
            rewardExp: 1800,
            rewardItems: [{ itemId: 'item_dragon_scale', quantity: 1, chance: 0.5 }, { itemId: 'item_fire_gem', quantity: 3, chance: 0.4 }, { itemId: 'item_arcana_shard', quantity: 1, chance: 0.2 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_fire_elemental', level: 22 }, { enemyId: 'enemy_lava_golem', level: 22 }] },
              { enemies: [{ enemyId: 'enemy_dragon_fire', level: 25 }], isBoss: true },
            ],
          },
        ],
      },
      {
        id: 'area_2_2',
        name: '天空の神殿',
        description: '堕天使が支配する天空の遺跡。',
        emoji: '🏛️',
        stages: [
          {
            id: 'stage_2_2_1',
            name: '2-6 天空の回廊',
            staminaCost: 15,
            recommendedPower: 30000,
            rewardGold: 3000,
            rewardExp: 2000,
            rewardItems: [{ itemId: 'item_angel_feather', quantity: 1, chance: 0.4 }, { itemId: 'item_light_gem', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_angel', level: 25 }, { enemyId: 'enemy_bat', level: 20 }] },
              { enemies: [{ enemyId: 'enemy_guardian_angel', level: 26 }, { enemyId: 'enemy_angel', level: 25 }] },
            ],
          },
          {
            id: 'stage_2_2_2',
            name: '2-7 神聖騎士団',
            staminaCost: 16,
            recommendedPower: 33000,
            rewardGold: 3300,
            rewardExp: 2200,
            rewardItems: [{ itemId: 'item_holy_stone', quantity: 1, chance: 0.4 }, { itemId: 'item_light_gem', quantity: 2, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_guardian_angel', level: 27 }, { enemyId: 'enemy_guardian_angel', level: 27 }] },
              { enemies: [{ enemyId: 'enemy_divine_paladin', level: 28 }], isBoss: true },
            ],
          },
          {
            id: 'stage_2_2_3',
            name: '2-8 煉獄の回廊',
            staminaCost: 17,
            recommendedPower: 38000,
            rewardGold: 3800,
            rewardExp: 2500,
            rewardItems: [{ itemId: 'item_fire_gem', quantity: 2, chance: 0.4 }, { itemId: 'item_arcana_shard', quantity: 1, chance: 0.25 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_fire_dragon', level: 28 }] },
              { enemies: [{ enemyId: 'enemy_fire_elemental', level: 28 }, { enemyId: 'enemy_lava_golem', level: 28 }] },
            ],
          },
          {
            id: 'stage_2_2_4',
            name: '2-9 魔竜の間',
            staminaCost: 18,
            recommendedPower: 42000,
            rewardGold: 4200,
            rewardExp: 2800,
            rewardItems: [{ itemId: 'item_dragon_scale', quantity: 2, chance: 0.45 }, { itemId: 'item_fire_gem', quantity: 2, chance: 0.5 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dragon_fire', level: 30 }, { enemyId: 'enemy_fire_orc', level: 28 }] },
              { enemies: [{ enemyId: 'enemy_fire_dragon', level: 32 }], isBoss: true },
            ],
          },
          {
            id: 'stage_2_2_5',
            name: '2-10 冥王の玉座【BOSS】',
            staminaCost: 20,
            recommendedPower: 55000,
            rewardGold: 6000,
            rewardExp: 4500,
            rewardItems: [{ itemId: 'item_lich_crown', quantity: 1, chance: 0.3 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.4 }, { itemId: 'item_dark_gem', quantity: 3, chance: 0.5 }, { itemId: 'item_exp_l', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dragon_dark', level: 32 }, { enemyId: 'enemy_dark_knight', level: 30 }] },
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 38 }], isBoss: true },
            ],
          },
        ],
      },
    ],
  },

  // ========================================
  // ===== World 3: 蒼海の神殿 (water world, 10ステージ) =====
  // ========================================
  {
    id: 'world_3',
    name: '蒼海の神殿',
    areas: [
      {
        id: 'area_3_1',
        name: '海底の遺跡',
        description: '古代の神殿が沈む神秘の海底。',
        emoji: '🌊',
        stages: [
          {
            id: 'stage_3_1_1',
            name: '3-1 珊瑚の回廊',
            staminaCost: 15,
            recommendedPower: 35000,
            rewardGold: 3500,
            rewardExp: 2200,
            rewardItems: [{ itemId: 'item_water_pearl', quantity: 1, chance: 0.5 }, { itemId: 'item_water_gem', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_water_slime', level: 30 }, { enemyId: 'enemy_water_slime', level: 30 }] },
              { enemies: [{ enemyId: 'enemy_sea_serpent', level: 32 }, { enemyId: 'enemy_water_slime', level: 31 }] },
            ],
          },
          {
            id: 'stage_3_1_2',
            name: '3-2 深海の迷路',
            staminaCost: 15,
            recommendedPower: 37000,
            rewardGold: 3700,
            rewardExp: 2400,
            rewardItems: [{ itemId: 'item_water_pearl', quantity: 2, chance: 0.45 }, { itemId: 'item_magic_crystal', quantity: 1, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_sea_serpent', level: 32 }, { enemyId: 'enemy_sea_serpent', level: 32 }] },
              { enemies: [{ enemyId: 'enemy_water_wizard', level: 33 }, { enemyId: 'enemy_sea_serpent', level: 32 }] },
            ],
          },
          {
            id: 'stage_3_1_3',
            name: '3-3 氷結の間',
            staminaCost: 16,
            recommendedPower: 40000,
            rewardGold: 4000,
            rewardExp: 2600,
            rewardItems: [{ itemId: 'item_water_gem', quantity: 2, chance: 0.4 }, { itemId: 'item_exp_m', quantity: 1, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_water_wizard', level: 33 }, { enemyId: 'enemy_water_wizard', level: 33 }] },
              { enemies: [{ enemyId: 'enemy_witch', level: 35 }], isBoss: true },
            ],
          },
          {
            id: 'stage_3_1_4',
            name: '3-4 古代神殿の番人',
            staminaCost: 17,
            recommendedPower: 43000,
            rewardGold: 4300,
            rewardExp: 2800,
            rewardItems: [{ itemId: 'item_water_pearl', quantity: 2, chance: 0.5 }, { itemId: 'item_water_gem', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_sea_serpent', level: 34 }, { enemyId: 'enemy_water_wizard', level: 34 }] },
              { enemies: [{ enemyId: 'enemy_witch', level: 36 }, { enemyId: 'enemy_sea_serpent', level: 35 }] },
            ],
          },
          {
            id: 'stage_3_1_5',
            name: '3-5 海王の間【BOSS】',
            staminaCost: 18,
            recommendedPower: 50000,
            rewardGold: 5000,
            rewardExp: 3500,
            rewardItems: [{ itemId: 'item_dragon_scale', quantity: 1, chance: 0.45 }, { itemId: 'item_water_gem', quantity: 3, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 1, chance: 0.25 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_water_wizard', level: 36 }, { enemyId: 'enemy_sea_serpent', level: 36 }] },
              { enemies: [{ enemyId: 'enemy_sea_dragon', level: 40 }], isBoss: true },
            ],
          },
        ],
      },
      {
        id: 'area_3_2',
        name: '嵐の海峡',
        description: '嵐が絶えない魔海。海竜の縄張り。',
        emoji: '⛈️',
        stages: [
          {
            id: 'stage_3_2_1',
            name: '3-6 嵐の始まり',
            staminaCost: 17,
            recommendedPower: 46000,
            rewardGold: 4600,
            rewardExp: 3000,
            rewardItems: [{ itemId: 'item_demon_wing', quantity: 1, chance: 0.45 }, { itemId: 'item_wind_gem', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_harpy', level: 35 }, { enemyId: 'enemy_harpy', level: 35 }] },
              { enemies: [{ enemyId: 'enemy_storm_eagle', level: 37 }, { enemyId: 'enemy_harpy', level: 36 }] },
            ],
          },
          {
            id: 'stage_3_2_2',
            name: '3-7 雷鳴の峰',
            staminaCost: 17,
            recommendedPower: 48000,
            rewardGold: 4800,
            rewardExp: 3200,
            rewardItems: [{ itemId: 'item_thunder_shard', quantity: 1, chance: 0.45 }, { itemId: 'item_thunder_gem', quantity: 1, chance: 0.25 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_wolf', level: 36 }, { enemyId: 'enemy_thunder_wolf', level: 36 }] },
              { enemies: [{ enemyId: 'enemy_storm_eagle', level: 38 }, { enemyId: 'enemy_thunder_wolf', level: 37 }] },
            ],
          },
          {
            id: 'stage_3_2_3',
            name: '3-8 嵐の番人',
            staminaCost: 18,
            recommendedPower: 52000,
            rewardGold: 5200,
            rewardExp: 3500,
            rewardItems: [{ itemId: 'item_wind_gem', quantity: 2, chance: 0.4 }, { itemId: 'item_demon_wing', quantity: 2, chance: 0.45 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_storm_eagle', level: 38 }, { enemyId: 'enemy_storm_eagle', level: 38 }] },
              { enemies: [{ enemyId: 'enemy_wind_dragon', level: 40 }], isBoss: true },
            ],
          },
          {
            id: 'stage_3_2_4',
            name: '3-9 海底神殿の深部',
            staminaCost: 19,
            recommendedPower: 56000,
            rewardGold: 5600,
            rewardExp: 3800,
            rewardItems: [{ itemId: 'item_water_pearl', quantity: 3, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_sea_dragon', level: 40 }, { enemyId: 'enemy_water_wizard', level: 39 }] },
              { enemies: [{ enemyId: 'enemy_witch', level: 40 }, { enemyId: 'enemy_sea_serpent', level: 40 }] },
            ],
          },
          {
            id: 'stage_3_2_5',
            name: '3-10 大海蛇ネプス【BOSS】',
            staminaCost: 20,
            recommendedPower: 65000,
            rewardGold: 7000,
            rewardExp: 5000,
            rewardItems: [{ itemId: 'item_dragon_scale', quantity: 2, chance: 0.5 }, { itemId: 'item_water_gem', quantity: 3, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.35 }, { itemId: 'item_exp_l', quantity: 1, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_sea_dragon', level: 42 }, { enemyId: 'enemy_wind_dragon', level: 40 }] },
              { enemies: [{ enemyId: 'enemy_sea_dragon', level: 45 }], isBoss: true },
            ],
          },
        ],
      },
    ],
  },

  // ========================================
  // ===== World 4: 雷嵐の高原 (thunder world, 10ステージ) =====
  // ========================================
  {
    id: 'world_4',
    name: '雷嵐の高原',
    areas: [
      {
        id: 'area_4_1',
        name: '雷鳴の平野',
        description: '常に雷が落ち続ける呪われた高原。',
        emoji: '⚡',
        stages: [
          {
            id: 'stage_4_1_1',
            name: '4-1 雷の草原',
            staminaCost: 18,
            recommendedPower: 60000,
            rewardGold: 6000,
            rewardExp: 4000,
            rewardItems: [{ itemId: 'item_thunder_shard', quantity: 2, chance: 0.5 }, { itemId: 'item_thunder_gem', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_wolf', level: 45 }, { enemyId: 'enemy_thunder_wolf', level: 45 }] },
              { enemies: [{ enemyId: 'enemy_thunder_drake', level: 47 }, { enemyId: 'enemy_thunder_wolf', level: 46 }] },
            ],
          },
          {
            id: 'stage_4_1_2',
            name: '4-2 電磁の荒野',
            staminaCost: 18,
            recommendedPower: 63000,
            rewardGold: 6300,
            rewardExp: 4200,
            rewardItems: [{ itemId: 'item_thunder_shard', quantity: 2, chance: 0.5 }, { itemId: 'item_thunder_core', quantity: 1, chance: 0.25 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_drake', level: 47 }, { enemyId: 'enemy_thunder_drake', level: 47 }] },
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 48 }, { enemyId: 'enemy_thunder_wolf', level: 46 }] },
            ],
          },
          {
            id: 'stage_4_1_3',
            name: '4-3 雷精霊の巣',
            staminaCost: 19,
            recommendedPower: 67000,
            rewardGold: 6700,
            rewardExp: 4500,
            rewardItems: [{ itemId: 'item_thunder_gem', quantity: 2, chance: 0.45 }, { itemId: 'item_mana_stone', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 48 }, { enemyId: 'enemy_thunder_drake', level: 48 }] },
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 50 }], isBoss: true },
            ],
          },
          {
            id: 'stage_4_1_4',
            name: '4-4 嵐の神殿前廊',
            staminaCost: 19,
            recommendedPower: 70000,
            rewardGold: 7000,
            rewardExp: 4800,
            rewardItems: [{ itemId: 'item_thunder_core', quantity: 1, chance: 0.4 }, { itemId: 'item_thunder_gem', quantity: 2, chance: 0.45 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 50 }, { enemyId: 'enemy_thunder_drake', level: 50 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 52 }] },
            ],
          },
          {
            id: 'stage_4_1_5',
            name: '4-5 雷神の間【BOSS】',
            staminaCost: 20,
            recommendedPower: 80000,
            rewardGold: 8500,
            rewardExp: 6000,
            rewardItems: [{ itemId: 'item_thunder_core', quantity: 2, chance: 0.5 }, { itemId: 'item_thunder_gem', quantity: 3, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 52 }, { enemyId: 'enemy_thunder_drake', level: 52 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 55 }], isBoss: true },
            ],
          },
        ],
      },
      {
        id: 'area_4_2',
        name: '天雷の頂',
        description: '雷神が眠ると言われる山の頂上。',
        emoji: '🌩️',
        stages: [
          {
            id: 'stage_4_2_1',
            name: '4-6 天頂の獣道',
            staminaCost: 20,
            recommendedPower: 75000,
            rewardGold: 7500,
            rewardExp: 5200,
            rewardItems: [{ itemId: 'item_thunder_shard', quantity: 3, chance: 0.55 }, { itemId: 'item_beast_hide', quantity: 2, chance: 0.5 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_wolf', level: 52 }, { enemyId: 'enemy_thunder_wolf', level: 52 }, { enemyId: 'enemy_thunder_wolf', level: 52 }] },
              { enemies: [{ enemyId: 'enemy_thunder_drake', level: 54 }, { enemyId: 'enemy_thunder_drake', level: 54 }] },
            ],
          },
          {
            id: 'stage_4_2_2',
            name: '4-7 鋼鉄の迷宮',
            staminaCost: 20,
            recommendedPower: 78000,
            rewardGold: 7800,
            rewardExp: 5500,
            rewardItems: [{ itemId: 'item_thunder_core', quantity: 1, chance: 0.4 }, { itemId: 'item_mana_stone', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_golem', level: 53 }, { enemyId: 'enemy_thunder_golem', level: 53 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 55 }, { enemyId: 'enemy_thunder_golem', level: 54 }] },
            ],
          },
          {
            id: 'stage_4_2_3',
            name: '4-8 嵐雲の境界',
            staminaCost: 21,
            recommendedPower: 82000,
            rewardGold: 8200,
            rewardExp: 5800,
            rewardItems: [{ itemId: 'item_thunder_gem', quantity: 3, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 55 }, { enemyId: 'enemy_thunder_drake', level: 54 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 58 }], isBoss: true },
            ],
          },
          {
            id: 'stage_4_2_4',
            name: '4-9 天雷の聖域',
            staminaCost: 22,
            recommendedPower: 87000,
            rewardGold: 8700,
            rewardExp: 6200,
            rewardItems: [{ itemId: 'item_thunder_core', quantity: 2, chance: 0.5 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 58 }, { enemyId: 'enemy_thunder_golem', level: 56 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 60 }, { enemyId: 'enemy_thunder_dragon', level: 58 }] },
            ],
          },
          {
            id: 'stage_4_2_5',
            name: '4-10 雷覇王サンダロス【BOSS】',
            staminaCost: 25,
            recommendedPower: 100000,
            rewardGold: 12000,
            rewardExp: 8500,
            rewardItems: [{ itemId: 'item_thunder_core', quantity: 3, chance: 0.55 }, { itemId: 'item_thunder_gem', quantity: 5, chance: 0.6 }, { itemId: 'item_arcana_shard', quantity: 3, chance: 0.4 }, { itemId: 'item_exp_l', quantity: 2, chance: 0.5 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 60 }, { enemyId: 'enemy_thunder_golem', level: 58 }] },
              { enemies: [{ enemyId: 'enemy_thunder_dragon', level: 65 }], isBoss: true },
            ],
          },
        ],
      },
    ],
  },

  // ========================================
  // ===== World 5: 闇滅の魔城 (dark world, 10ステージ) =====
  // ========================================
  {
    id: 'world_5',
    name: '闇滅の魔城',
    areas: [
      {
        id: 'area_5_1',
        name: '絶望の城門',
        description: '魔王が君臨する漆黒の城。冒険者の最終試練。',
        emoji: '🏯',
        stages: [
          {
            id: 'stage_5_1_1',
            name: '5-1 城門の試練',
            staminaCost: 22,
            recommendedPower: 90000,
            rewardGold: 9000,
            rewardExp: 6500,
            rewardItems: [{ itemId: 'item_dark_shard', quantity: 3, chance: 0.55 }, { itemId: 'item_dark_gem', quantity: 1, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dark_knight', level: 60 }, { enemyId: 'enemy_dark_knight', level: 60 }] },
              { enemies: [{ enemyId: 'enemy_dark_mage', level: 62 }, { enemyId: 'enemy_dark_knight', level: 61 }] },
            ],
          },
          {
            id: 'stage_5_1_2',
            name: '5-2 骨の廊下',
            staminaCost: 22,
            recommendedPower: 93000,
            rewardGold: 9300,
            rewardExp: 6800,
            rewardItems: [{ itemId: 'item_bone', quantity: 3, chance: 0.6 }, { itemId: 'item_shadow_essence', quantity: 1, chance: 0.3 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_skeleton', level: 60 }, { enemyId: 'enemy_skeleton', level: 60 }, { enemyId: 'enemy_skeleton', level: 60 }] },
              { enemies: [{ enemyId: 'enemy_lich', level: 62 }, { enemyId: 'enemy_skeleton', level: 61 }] },
            ],
          },
          {
            id: 'stage_5_1_3',
            name: '5-3 冥府の守衛',
            staminaCost: 23,
            recommendedPower: 97000,
            rewardGold: 9700,
            rewardExp: 7000,
            rewardItems: [{ itemId: 'item_dark_gem', quantity: 2, chance: 0.45 }, { itemId: 'item_shadow_essence', quantity: 1, chance: 0.35 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dark_mage', level: 62 }, { enemyId: 'enemy_dark_mage', level: 62 }] },
              { enemies: [{ enemyId: 'enemy_lich', level: 64 }, { enemyId: 'enemy_dark_knight', level: 63 }] },
            ],
          },
          {
            id: 'stage_5_1_4',
            name: '5-4 闇竜の巣',
            staminaCost: 24,
            recommendedPower: 102000,
            rewardGold: 10200,
            rewardExp: 7500,
            rewardItems: [{ itemId: 'item_dragon_scale', quantity: 2, chance: 0.5 }, { itemId: 'item_dark_gem', quantity: 3, chance: 0.5 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dark_dragon', level: 63 }, { enemyId: 'enemy_dark_mage', level: 62 }] },
              { enemies: [{ enemyId: 'enemy_dragon_dark', level: 65 }], isBoss: true },
            ],
          },
          {
            id: 'stage_5_1_5',
            name: '5-5 破滅の広間【BOSS】',
            staminaCost: 25,
            recommendedPower: 115000,
            rewardGold: 12000,
            rewardExp: 9000,
            rewardItems: [{ itemId: 'item_shadow_essence', quantity: 2, chance: 0.5 }, { itemId: 'item_dark_gem', quantity: 4, chance: 0.55 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dragon_dark', level: 65 }, { enemyId: 'enemy_lich', level: 64 }] },
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 70 }], isBoss: true },
            ],
          },
        ],
      },
      {
        id: 'area_5_2',
        name: '魔王の間',
        description: '伝説の魔王が眠る最深部。アルカナの力が解放される場所。',
        emoji: '👑',
        stages: [
          {
            id: 'stage_5_2_1',
            name: '5-6 滅亡の回廊',
            staminaCost: 24,
            recommendedPower: 110000,
            rewardGold: 11000,
            rewardExp: 8000,
            rewardItems: [{ itemId: 'item_dark_gem', quantity: 3, chance: 0.55 }, { itemId: 'item_arcana_shard', quantity: 2, chance: 0.4 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dark_knight', level: 65 }, { enemyId: 'enemy_dark_mage', level: 65 }, { enemyId: 'enemy_dark_knight', level: 65 }] },
              { enemies: [{ enemyId: 'enemy_lich', level: 67 }, { enemyId: 'enemy_dark_dragon', level: 66 }] },
            ],
          },
          {
            id: 'stage_5_2_2',
            name: '5-7 虚無の庭',
            staminaCost: 25,
            recommendedPower: 118000,
            rewardGold: 11800,
            rewardExp: 8500,
            rewardItems: [{ itemId: 'item_shadow_essence', quantity: 2, chance: 0.5 }, { itemId: 'item_mana_stone', quantity: 2, chance: 0.45 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_dragon_dark', level: 67 }, { enemyId: 'enemy_dark_dragon', level: 67 }] },
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 70 }, { enemyId: 'enemy_lich', level: 68 }] },
            ],
          },
          {
            id: 'stage_5_2_3',
            name: '5-8 アビスの扉',
            staminaCost: 25,
            recommendedPower: 125000,
            rewardGold: 13000,
            rewardExp: 9500,
            rewardItems: [{ itemId: 'item_arcana_shard', quantity: 3, chance: 0.45 }, { itemId: 'item_dark_gem', quantity: 5, chance: 0.6 }, { itemId: 'item_lich_crown', quantity: 1, chance: 0.2 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 71 }, { enemyId: 'enemy_dragon_dark', level: 70 }] },
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 73 }], isBoss: true },
            ],
          },
          {
            id: 'stage_5_2_4',
            name: '5-9 終焉の前夜',
            staminaCost: 26,
            recommendedPower: 135000,
            rewardGold: 14000,
            rewardExp: 10500,
            rewardItems: [{ itemId: 'item_arcana_orb', quantity: 1, chance: 0.15 }, { itemId: 'item_arcana_shard', quantity: 4, chance: 0.5 }, { itemId: 'item_shadow_essence', quantity: 3, chance: 0.55 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 73 }, { enemyId: 'enemy_dragon_dark', level: 72 }] },
              { enemies: [{ enemyId: 'enemy_dark_dragon', level: 73 }, { enemyId: 'enemy_dark_dragon', level: 73 }] },
            ],
          },
          {
            id: 'stage_5_2_5',
            name: '5-10 魔王ヴォイドレックス【BOSS】',
            staminaCost: 30,
            recommendedPower: 160000,
            rewardGold: 20000,
            rewardExp: 15000,
            rewardItems: [{ itemId: 'item_arcana_orb', quantity: 1, chance: 0.3 }, { itemId: 'item_elemental_core', quantity: 1, chance: 0.25 }, { itemId: 'item_lich_crown', quantity: 1, chance: 0.4 }, { itemId: 'item_exp_xl', quantity: 1, chance: 0.6 }, { itemId: 'item_arcana_shard', quantity: 5, chance: 0.8 }],
            waves: [
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 75 }, { enemyId: 'enemy_dragon_dark', level: 75 }] },
              { enemies: [{ enemyId: 'enemy_dragon_dark', level: 78 }, { enemyId: 'enemy_boss_lich', level: 77 }] },
              { enemies: [{ enemyId: 'enemy_boss_lich', level: 80 }], isBoss: true },
            ],
          },
        ],
      },
    ],
  },
];

export const getAllStages = () =>
  QUEST_WORLDS.flatMap(w => w.areas.flatMap(a => a.stages));

export const getStage = (stageId: string) =>
  getAllStages().find(s => s.id === stageId);
