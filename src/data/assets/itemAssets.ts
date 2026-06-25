import type { ItemAsset } from '../../lib/assets/assetTypes';
import { ItemAssetId } from '../../lib/assets/assetIds';

const CURRENCY    = '/assets/images/items/currency';
const CONSUMABLES = '/assets/images/items/consumables';
const MATERIALS   = '/assets/images/items/materials';

export const itemAssets: Readonly<Record<ItemAssetId, ItemAsset>> = {

  // ──────────── 通貨 ────────────

  [ItemAssetId.CURRENCY_GOLD_COIN]: {
    id: ItemAssetId.CURRENCY_GOLD_COIN,
    path: `${CURRENCY}/item_currency_gold_coin.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'critical',
    preload: true,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'currency',
    tags: ['currency', 'gold', 'coin'],
    status: 'placeholder',
  },

  [ItemAssetId.CURRENCY_DIAMOND]: {
    id: ItemAssetId.CURRENCY_DIAMOND,
    path: `${CURRENCY}/item_currency_diamond.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'critical',
    preload: true,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'currency',
    tags: ['currency', 'diamond', 'premium', 'blue'],
    status: 'placeholder',
  },

  [ItemAssetId.CURRENCY_SUMMON_TICKET]: {
    id: ItemAssetId.CURRENCY_SUMMON_TICKET,
    path: `${CURRENCY}/item_currency_summon_ticket.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'high',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'ticket',
    tags: ['currency', 'ticket', 'gacha', 'summon'],
    status: 'placeholder',
  },

  // ──────────── 消耗品 ────────────

  [ItemAssetId.CONSUMABLE_HP_POTION_S]: {
    id: ItemAssetId.CONSUMABLE_HP_POTION_S,
    path: `${CONSUMABLES}/item_consumable_hp_potion_s.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'high',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'consumable',
    tags: ['consumable', 'hp', 'potion', 'small', 'red'],
    status: 'placeholder',
  },

  [ItemAssetId.CONSUMABLE_HP_POTION_M]: {
    id: ItemAssetId.CONSUMABLE_HP_POTION_M,
    path: `${CONSUMABLES}/item_consumable_hp_potion_m.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'consumable',
    tags: ['consumable', 'hp', 'potion', 'medium', 'red'],
    status: 'placeholder',
  },

  [ItemAssetId.CONSUMABLE_STAMINA_ORB]: {
    id: ItemAssetId.CONSUMABLE_STAMINA_ORB,
    path: `${CONSUMABLES}/item_consumable_stamina_orb.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'high',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'consumable',
    tags: ['consumable', 'stamina', 'orb', 'green'],
    status: 'placeholder',
  },

  // ──────────── 強化素材 ────────────

  [ItemAssetId.MATERIAL_MAGIC_CRYSTAL_S]: {
    id: ItemAssetId.MATERIAL_MAGIC_CRYSTAL_S,
    path: `${MATERIALS}/item_material_magic_crystal_s.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'material',
    tags: ['material', 'crystal', 'magic', 'small', 'blue'],
    status: 'placeholder',
  },

  [ItemAssetId.MATERIAL_MAGIC_CRYSTAL_M]: {
    id: ItemAssetId.MATERIAL_MAGIC_CRYSTAL_M,
    path: `${MATERIALS}/item_material_magic_crystal_m.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'material',
    tags: ['material', 'crystal', 'magic', 'medium', 'blue'],
    status: 'placeholder',
  },

  [ItemAssetId.MATERIAL_DRAGON_SCALE]: {
    id: ItemAssetId.MATERIAL_DRAGON_SCALE,
    path: `${MATERIALS}/item_material_dragon_scale.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'material',
    tags: ['material', 'dragon', 'scale', 'rare'],
    status: 'placeholder',
  },

  [ItemAssetId.MATERIAL_AWAKENING_STONE]: {
    id: ItemAssetId.MATERIAL_AWAKENING_STONE,
    path: `${MATERIALS}/item_material_awakening_stone.webp`,
    category: 'item',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    itemRole: 'material',
    tags: ['material', 'awakening', 'stone', 'rainbow'],
    status: 'placeholder',
  },

} satisfies Record<string, ItemAsset>;
