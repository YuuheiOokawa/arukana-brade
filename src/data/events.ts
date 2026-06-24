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
];

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
];

export const getActiveEvents = (): EventQuest[] => {
  const now = Date.now();
  return EVENT_QUESTS.filter(e => e.startTimestamp <= now && now <= e.endTimestamp);
};

export const getActiveRaids = (): RaidBossMaster[] => {
  const now = Date.now();
  return RAID_BOSSES.filter(r => now <= r.endTimestamp);
};
