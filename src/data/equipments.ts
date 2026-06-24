import type { EquipmentMaster } from '../types';

export const EQUIPMENT_MASTER: EquipmentMaster[] = [
  // ===== 武器 =====
  {
    id: 'equip_sword_iron',
    name: '鉄の剣',
    description: '丈夫な鉄で作られた剣。初心者向けの武器。',
    slot: 'weapon', rarity: 'N',
    baseStats: { atk: 50 }, maxStats: { atk: 150 },
    maxLevel: 20, emoji: '🗡️',
  },
  {
    id: 'equip_sword_silver',
    name: '銀の剣',
    description: '銀の刃は魔物を効果的に切り裂く。',
    slot: 'weapon', rarity: 'R',
    baseStats: { atk: 120, def: 20 }, maxStats: { atk: 360, def: 60 },
    maxLevel: 40, emoji: '⚔️',
  },
  {
    id: 'equip_flame_blade',
    name: '炎刃ブレイズ',
    description: '炎の魔力を宿した伝説の剣。炎属性ユニット専用。',
    slot: 'weapon', rarity: 'SR',
    baseStats: { atk: 280, rec: 30 }, maxStats: { atk: 840, rec: 90 },
    maxLevel: 60, emoji: '🔥', requiredElement: 'fire',
  },
  {
    id: 'equip_arcana_blade',
    name: 'アルカナブレイド',
    description: '世界を切り開く伝説の剣。あらゆる属性に対応。',
    slot: 'weapon', rarity: 'SSR',
    baseStats: { atk: 500, def: 80, rec: 50 }, maxStats: { atk: 1500, def: 240, rec: 150 },
    maxLevel: 80, emoji: '✨',
  },
  {
    id: 'equip_dark_lance',
    name: '闇の魔槍',
    description: '闇の力を秘めた恐ろしい魔槍。闇属性専用。',
    slot: 'weapon', rarity: 'SR',
    baseStats: { atk: 310 }, maxStats: { atk: 930 },
    maxLevel: 60, emoji: '🌑', requiredElement: 'dark',
  },
  {
    id: 'equip_water_staff',
    name: '水の魔杖',
    description: '水の精霊が宿った魔法の杖。回復力が上昇。',
    slot: 'weapon', rarity: 'SR',
    baseStats: { atk: 200, rec: 150 }, maxStats: { atk: 600, rec: 450 },
    maxLevel: 60, emoji: '💧', requiredElement: 'water',
  },
  {
    id: 'equip_thunder_bow',
    name: '雷光の弓',
    description: '風の力で放つ稲妻の矢。風属性専用。',
    slot: 'weapon', rarity: 'SR',
    baseStats: { atk: 290, hp: 300 }, maxStats: { atk: 870, hp: 900 },
    maxLevel: 60, emoji: '⚡', requiredElement: 'wind',
  },

  // ===== 防具 =====
  {
    id: 'equip_leather_armor',
    name: '革の鎧',
    description: '軽くて動きやすい革の防具。',
    slot: 'armor', rarity: 'N',
    baseStats: { def: 60, hp: 200 }, maxStats: { def: 180, hp: 600 },
    maxLevel: 20, emoji: '🛡️',
  },
  {
    id: 'equip_chain_mail',
    name: 'チェインメイル',
    description: '細かい鉄の輪を編んだ鎧。バランスが良い。',
    slot: 'armor', rarity: 'R',
    baseStats: { def: 150, hp: 400 }, maxStats: { def: 450, hp: 1200 },
    maxLevel: 40, emoji: '🔰',
  },
  {
    id: 'equip_plate_armor',
    name: '聖騎士の甲冑',
    description: '神聖な力が宿るプレートアーマー。高い防御力を誇る。',
    slot: 'armor', rarity: 'SR',
    baseStats: { def: 350, hp: 800 }, maxStats: { def: 1050, hp: 2400 },
    maxLevel: 60, emoji: '⚜️',
  },
  {
    id: 'equip_dragon_armor',
    name: 'ドラゴンスケイル鎧',
    description: '古龍の鱗で作られた最強の鎧。全ステータスが上昇。',
    slot: 'armor', rarity: 'SSR',
    baseStats: { def: 600, hp: 1500, atk: 100 }, maxStats: { def: 1800, hp: 4500, atk: 300 },
    maxLevel: 80, emoji: '🐉',
  },
  {
    id: 'equip_mage_robe',
    name: '魔法使いのローブ',
    description: '魔力を高める特殊な布地で作られたローブ。回復力が大幅上昇。',
    slot: 'armor', rarity: 'SR',
    baseStats: { def: 180, rec: 200, hp: 600 }, maxStats: { def: 540, rec: 600, hp: 1800 },
    maxLevel: 60, emoji: '🧥',
  },

  // ===== アクセサリー =====
  {
    id: 'equip_ring_iron',
    name: '鉄の指輪',
    description: '素朴な鉄の指輪。わずかに力が増す。',
    slot: 'accessory', rarity: 'N',
    baseStats: { atk: 30, hp: 100 }, maxStats: { atk: 90, hp: 300 },
    maxLevel: 20, emoji: '💍',
  },
  {
    id: 'equip_amulet_guardian',
    name: '守護のお守り',
    description: '古い神社に奉納されていたお守り。防御力が上昇。',
    slot: 'accessory', rarity: 'R',
    baseStats: { def: 100, hp: 500 }, maxStats: { def: 300, hp: 1500 },
    maxLevel: 40, emoji: '🪬',
  },
  {
    id: 'equip_crown_arcana',
    name: 'アルカナの冠',
    description: '古代の王が身につけた伝説の冠。全ステータスが上昇。',
    slot: 'accessory', rarity: 'SSR',
    baseStats: { atk: 200, def: 200, rec: 200, hp: 1000 }, maxStats: { atk: 600, def: 600, rec: 600, hp: 3000 },
    maxLevel: 80, emoji: '👑',
  },
  {
    id: 'equip_pendant_life',
    name: '生命のペンダント',
    description: '生命力を高める神秘の宝石が埋め込まれたペンダント。',
    slot: 'accessory', rarity: 'SR',
    baseStats: { hp: 1200, rec: 100 }, maxStats: { hp: 3600, rec: 300 },
    maxLevel: 60, emoji: '💚',
  },
  {
    id: 'equip_ring_power',
    name: '力の指輪',
    description: '闘士が愛用した攻撃力強化の指輪。',
    slot: 'accessory', rarity: 'SR',
    baseStats: { atk: 250, rec: 50 }, maxStats: { atk: 750, rec: 150 },
    maxLevel: 60, emoji: '🔴',
  },
];

export const getEquipmentMaster = (id: string): EquipmentMaster | undefined =>
  EQUIPMENT_MASTER.find(e => e.id === id);

export const calcEquipmentStats = (master: EquipmentMaster, level: number): { atk: number; def: number; hp: number; rec: number } => {
  const ratio = (level - 1) / (master.maxLevel - 1);
  const lerp = (base: number = 0, max: number = 0) => Math.floor(base + (max - base) * ratio);
  return {
    hp:  lerp(master.baseStats.hp,  master.maxStats.hp),
    atk: lerp(master.baseStats.atk, master.maxStats.atk),
    def: lerp(master.baseStats.def, master.maxStats.def),
    rec: lerp(master.baseStats.rec, master.maxStats.rec),
  };
};
