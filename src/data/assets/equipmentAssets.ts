import type { EquipmentAsset } from '../../lib/assets/assetTypes';
import { EquipAssetId } from '../../lib/assets/assetIds';

const WEAPONS = '/assets/images/equipment/weapons';
const ARMOR   = '/assets/images/equipment/armor';

export const equipmentAssets: Readonly<Record<EquipAssetId, EquipmentAsset>> = {

  [EquipAssetId.WEAPON_ARCANA_SWORD_001]: {
    id: EquipAssetId.WEAPON_ARCANA_SWORD_001,
    path: `${WEAPONS}/equip_weapon_arcana_sword_001.webp`,
    category: 'equipment',
    mediaType: 'image/webp',
    priority: 'high',
    preload: false,
    transparent: true,
    size: { width: 512, height: 512 },
    slot: 'weapon',
    elementType: 'light',
    tags: ['weapon', 'sword', 'arcana', 'blue_purple'],
    status: 'placeholder',
  },

  [EquipAssetId.WEAPON_DARK_BLADE_001]: {
    id: EquipAssetId.WEAPON_DARK_BLADE_001,
    path: `${WEAPONS}/equip_weapon_dark_blade_001.webp`,
    category: 'equipment',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 512, height: 512 },
    slot: 'weapon',
    elementType: 'dark',
    tags: ['weapon', 'sword', 'dark', 'curved'],
    status: 'placeholder',
  },

  [EquipAssetId.WEAPON_FIRE_STAFF_001]: {
    id: EquipAssetId.WEAPON_FIRE_STAFF_001,
    path: `${WEAPONS}/equip_weapon_fire_staff_001.webp`,
    category: 'equipment',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 512, height: 512 },
    slot: 'weapon',
    elementType: 'fire',
    tags: ['weapon', 'staff', 'fire', 'magic'],
    status: 'placeholder',
  },

  [EquipAssetId.WEAPON_THUNDER_LANCE_001]: {
    id: EquipAssetId.WEAPON_THUNDER_LANCE_001,
    path: `${WEAPONS}/equip_weapon_thunder_lance_001.webp`,
    category: 'equipment',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 512, height: 512 },
    slot: 'weapon',
    elementType: 'thunder',
    tags: ['weapon', 'lance', 'thunder', 'electric'],
    status: 'placeholder',
  },

  [EquipAssetId.ARMOR_ARCANA_PLATE_001]: {
    id: EquipAssetId.ARMOR_ARCANA_PLATE_001,
    path: `${ARMOR}/equip_armor_arcana_plate_001.webp`,
    category: 'equipment',
    mediaType: 'image/webp',
    priority: 'normal',
    preload: false,
    transparent: true,
    size: { width: 256, height: 256 },
    slot: 'armor',
    tags: ['armor', 'plate', 'arcana', 'blue'],
    status: 'placeholder',
  },

} satisfies Record<string, EquipmentAsset>;
