/**
 * masterDataCache - DBから取得したマスタデータをモジュールレベルでキャッシュする。
 * Zustandストアを使わずシンプルな変数で持つことで循環依存を避ける。
 */
import type { UnitMaster, EnemyMaster, ItemMaster, EquipmentMaster, QuestWorld } from '../types';

let _units: UnitMaster[] | null = null;
let _enemies: EnemyMaster[] | null = null;
let _items: ItemMaster[] | null = null;
let _equipment: EquipmentMaster[] | null = null;
let _quests: QuestWorld[] | null = null;

interface MasterEntry<T> {
  data: T[];
  version: number;
}

interface MasterResponse {
  units?:     MasterEntry<UnitMaster>;
  enemies?:   MasterEntry<EnemyMaster>;
  items?:     MasterEntry<ItemMaster>;
  equipment?: MasterEntry<EquipmentMaster>;
  quests?:    MasterEntry<QuestWorld>;
}

export const populateMasterCache = (res: MasterResponse) => {
  if (res.units?.data)     _units     = res.units.data;
  if (res.enemies?.data)   _enemies   = res.enemies.data;
  if (res.items?.data)     _items     = res.items.data;
  if (res.equipment?.data) _equipment = res.equipment.data;
  if (res.quests?.data)    _quests    = res.quests.data;
};

export const getMasterUnits     = (): UnitMaster[]      | null => _units;
export const getMasterEnemies   = (): EnemyMaster[]     | null => _enemies;
export const getMasterItems     = (): ItemMaster[]       | null => _items;
export const getMasterEquipment = (): EquipmentMaster[] | null => _equipment;
export const getMasterQuests    = (): QuestWorld[]      | null => _quests;

/** アプリ起動後にDBからマスタデータを取得してキャッシュに投入する */
export const fetchAndPopulateMasterData = async (): Promise<void> => {
  try {
    const res = await fetch('/api/master', { credentials: 'include' });
    if (!res.ok) return;
    const data = (await res.json()) as MasterResponse;
    populateMasterCache(data);
  } catch {
    // オフラインや失敗時はTypeScriptデータにフォールバック（何もしない）
  }
};
