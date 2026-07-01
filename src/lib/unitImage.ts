/**
 * unitImage.ts
 * キャラ画像パス解決ユーティリティ
 *
 * - DB管理の UnitImage テーブルから画像パスを取得（キャッシュ済み）
 * - 未登録の場合はデフォルト画像にフォールバック
 */

// 1枚のスプライトシートに8列で格納されているユニット
// /キャラ画像/{unitId}.webp (1672×941 px, 8列 = 209px/列)
export const SPRITESHEET_UNITS = new Set([
  'unit_051', 'unit_052', 'unit_053', 'unit_054', 'unit_055',
  'unit_056', 'unit_057', 'unit_058', 'unit_059', 'unit_060',
]);

export const SPRITESHEET_TOTAL_CELLS = 8;

/** スプライトシートユニットのパスを返す。非対象なら null */
export function getUnitSpritesheet(unitId: string): string | null {
  if (!SPRITESHEET_UNITS.has(unitId)) return null;
  return `/キャラ画像/${unitId}.webp`;
}

/**
 * レアリティ→スプライトシートの列インデックス (0〜7)
 * ★1→0, ★2→1, ..., ★7→6, CROWN(8)→7
 */
export function getSpritesheetCellIndex(rarity: number | string): number {
  const r = starRarityToImageRarity(rarity);
  return Math.min(Math.max(r - 1, 0), SPRITESHEET_TOTAL_CELLS - 1);
}

// ★Crown は rarity = 8 として扱う
export const RARITY_TO_IMAGE_SUFFIX: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: 'crown',
};

const BASE_PATH = '/assets/images/characters/units';

// フロント側でのレアリティ値(StarRarity)からUnitImage.rarityへの変換
// StarRarity は 1|2|3|4|5|6|7|'CROWN'
export function starRarityToImageRarity(star: number | string): number {
  if (star === 'CROWN' || star === 8) return 8;
  return Number(star);
}

// ユニットIDとレアリティから静的パスを生成（DB問い合わせ不要）
export function getUnitImagePath(unitId: string, rarity: number | string): string | null {
  const r = starRarityToImageRarity(rarity);
  const suffix = RARITY_TO_IMAGE_SUFFIX[r];
  if (!suffix) return null;

  // unit_001 または hero_xxx 形式から base ID を抽出
  const match = unitId.match(/^(unit_\d{3}|hero_[a-z]+)(?:[_-].*)?$/);
  if (!match) return null;
  const baseId = match[1];

  return `${BASE_PATH}/${baseId}/${baseId}_${suffix}.webp`;
}

// 画像が存在しない場合のフォールバック
export const UNIT_IMAGE_FALLBACK = '/assets/images/characters/units/default_unit.webp';

// DB から取得したキャッシュ（/api/master/images で事前ロード）
let _imageCache: Map<string, string> | null = null;

export function populateImageCache(images: Array<{ unitId: string; rarity: number; imagePath: string }>) {
  _imageCache = new Map(images.map(i => [`${i.unitId}_${i.rarity}`, i.imagePath]));
}

// キャッシュ優先で画像パスを返す。キャッシュなければ静的パスを生成。
export function resolveUnitImage(unitId: string, rarity: number | string): string {
  const r = starRarityToImageRarity(rarity);
  const cacheKey = `${unitId}_${r}`;

  if (_imageCache) {
    const cached = _imageCache.get(cacheKey);
    if (cached) return cached;
  }

  // キャッシュなし or DB未登録 → 静的パスにフォールバック
  return getUnitImagePath(unitId, r) ?? UNIT_IMAGE_FALLBACK;
}
