import type { ItemMaster } from '../types';

export const ITEM_MASTER: ItemMaster[] = [
  // ===== 敵ドロップ素材 =====
  { id: 'item_goblin_fang',      name: 'ゴブリンの牙',       description: '強化素材として使用できる',         category: 'material',        emoji: '🦷', sellPrice: 50 },
  { id: 'item_wolf_fang',        name: 'ダークウルフの爪',   description: '強化素材として使用できる',         category: 'material',        emoji: '🐾', sellPrice: 100 },
  { id: 'item_slime_gel',        name: 'マグマスライムのゲル', description: '強化素材として使用できる',       category: 'material',        emoji: '🫧', sellPrice: 60 },
  { id: 'item_stone_core',       name: 'ストーンコア',       description: '強化素材として使用できる',         category: 'material',        emoji: '💎', sellPrice: 200 },
  { id: 'item_magic_crystal',    name: '魔力の結晶',         description: '強化素材として使用できる',         category: 'material',        emoji: '🔮', sellPrice: 250 },
  { id: 'item_dark_shard',       name: '闇の欠片',           description: '強化素材として使用できる',         category: 'material',        emoji: '🌑', sellPrice: 180 },
  { id: 'item_dragon_scale',     name: 'ドラゴンスケイル',   description: '希少な強化素材',                   category: 'material',        emoji: '🐉', sellPrice: 500 },
  { id: 'item_angel_feather',    name: '天使の羽根',         description: '希少な強化素材',                   category: 'material',        emoji: '🪶', sellPrice: 450 },
  { id: 'item_bone',             name: 'ホネ',               description: '強化素材として使用できる',         category: 'material',        emoji: '🦴', sellPrice: 30 },
  { id: 'item_lich_crown',       name: 'リッチの冠',         description: '最高級の強化素材',                 category: 'material',        emoji: '👑', sellPrice: 2000 },
  { id: 'item_orc_tusk',         name: 'オークの牙',         description: '中級の強化素材',                   category: 'material',        emoji: '🐗', sellPrice: 120 },
  { id: 'item_demon_wing',       name: '悪魔の翼',           description: '強化に使える珍しい素材',           category: 'material',        emoji: '🦇', sellPrice: 300 },
  { id: 'item_spider_web',       name: '蜘蛛の巣',           description: '柔軟な素材として使用できる',       category: 'material',        emoji: '🕸️', sellPrice: 80 },
  { id: 'item_fire_crystal',     name: '炎の結晶',           description: '炎属性の強化素材',                 category: 'material',        emoji: '🔴', sellPrice: 200 },
  { id: 'item_water_pearl',      name: '水の真珠',           description: '水属性の希少素材',                 category: 'material',        emoji: '🔵', sellPrice: 220 },
  { id: 'item_thunder_shard',    name: '雷の欠片',           description: '雷属性の素材',                     category: 'material',        emoji: '⚡', sellPrice: 180 },
  { id: 'item_thunder_core',     name: '雷核',               description: '高純度の雷エネルギー結晶',         category: 'material',        emoji: '🌩️', sellPrice: 600 },
  { id: 'item_holy_stone',       name: '聖石',               description: '光属性の強化素材',                 category: 'material',        emoji: '✨', sellPrice: 350 },
  { id: 'item_poison_fang',      name: '毒牙',               description: '毒蛇の牙。強化素材',               category: 'material',        emoji: '🐍', sellPrice: 90 },
  { id: 'item_beast_hide',       name: '魔獣の皮',           description: '硬い素材として使用できる',         category: 'material',        emoji: '🐆', sellPrice: 140 },
  { id: 'item_mana_stone',       name: 'マナストーン',       description: '魔力を秘めた石',                   category: 'material',        emoji: '💠', sellPrice: 400 },
  { id: 'item_shadow_essence',   name: '闇の精髄',           description: '闇属性の高級素材',                 category: 'material',        emoji: '🌘', sellPrice: 800 },

  // ===== 覚醒素材 =====
  { id: 'item_fire_gem',         name: '炎の宝玉',           description: '炎属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🔴', sellPrice: 100 },
  { id: 'item_water_gem',        name: '水の宝玉',           description: '水属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🔵', sellPrice: 100 },
  { id: 'item_wind_gem',         name: '風の宝玉',           description: '風属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🟢', sellPrice: 100 },
  { id: 'item_earth_gem',        name: '土の宝玉',           description: '土属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🟤', sellPrice: 100 },
  { id: 'item_light_gem',        name: '光の宝玉',           description: '光属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🟡', sellPrice: 100 },
  { id: 'item_dark_gem',         name: '闇の宝玉',           description: '闇属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🟣', sellPrice: 100 },
  { id: 'item_thunder_gem',      name: '雷の宝玉',           description: '雷属性ユニットの覚醒に使用',       category: 'awaken_material', emoji: '🟡', sellPrice: 100 },
  { id: 'item_arcana_shard',     name: 'アルカナの欠片',     description: '上位覚醒に必要な希少素材',         category: 'awaken_material', emoji: '✨', sellPrice: 500 },
  { id: 'item_arcana_orb',       name: 'アルカナオーブ',     description: '最高位覚醒に必要な至高素材',       category: 'awaken_material', emoji: '🌟', sellPrice: 2000 },
  { id: 'item_elemental_core',   name: '元素核',             description: 'あらゆる属性の覚醒に使用できる万能素材', category: 'awaken_material', emoji: '🎯', sellPrice: 1500 },

  // ===== 経験値ポーション =====
  { id: 'item_exp_s',            name: '経験値の雫(小)',     description: '経験値500を獲得',                  category: 'exp_potion',      emoji: '💧', sellPrice: 50 },
  { id: 'item_exp_m',            name: '経験値の雫(中)',     description: '経験値2000を獲得',                 category: 'exp_potion',      emoji: '💦', sellPrice: 150 },
  { id: 'item_exp_l',            name: '経験値の雫(大)',     description: '経験値8000を獲得',                 category: 'exp_potion',      emoji: '🌊', sellPrice: 500 },
  { id: 'item_exp_xl',           name: '経験値の雫(特大)',   description: '経験値30000を獲得',                category: 'exp_potion',      emoji: '🌊', sellPrice: 1500 },
  { id: 'item_exp_medal',        name: '勇者の勲章',         description: '経験値10000を獲得',                category: 'exp_potion',      emoji: '🏅', sellPrice: 800 },
  { id: 'item_star_of_wisdom',   name: '叡智の星',           description: '経験値50000を獲得する至高のアイテム', category: 'exp_potion',  emoji: '⭐', sellPrice: 3000 },

  // ===== スタミナ =====
  { id: 'item_stamina_potion',   name: 'スタミナポーション', description: 'スタミナを30回復する',             category: 'stamina',         emoji: '🍵', sellPrice: 0 },
  { id: 'item_stamina_full',     name: 'スタミナ全回復薬',   description: 'スタミナを全回復する',             category: 'stamina',         emoji: '🧪', sellPrice: 0 },
  { id: 'item_stamina_plus',     name: 'スタミナプラス',     description: 'スタミナを50回復する',             category: 'stamina',         emoji: '⚡', sellPrice: 0 },

  // ===== 召喚チケット =====
  { id: 'item_summon_ticket',    name: '召喚チケット',       description: '召喚に使用できるチケット',         category: 'summon_ticket',   emoji: '🎫', sellPrice: 0 },
  { id: 'item_summon_ticket_sr', name: 'SR確定チケット',     description: 'SR以上確定の召喚チケット',         category: 'summon_ticket',   emoji: '🌠', sellPrice: 0 },
  { id: 'item_summon_ticket_ssr',name: 'SSR確定チケット',    description: 'SSR確定の最高級召喚チケット',      category: 'summon_ticket',   emoji: '🌟', sellPrice: 0 },
];

export const getItemMaster = (id: string): ItemMaster | undefined =>
  ITEM_MASTER.find(i => i.id === id);
