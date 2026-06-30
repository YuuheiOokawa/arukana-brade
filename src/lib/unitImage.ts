/**
 * unitImage.ts
 * キャラ画像パス解決ユーティリティ
 *
 * - DB管理の UnitImage テーブルから画像パスを取得（キャッシュ済み）
 * - 未登録の場合はデフォルト画像にフォールバック
 */

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

  // unit_001 または unit_001_xxx 形式から unit_001 部分を抽出
  const match = unitId.match(/^(unit_\d{3})(?:[_-].*)?$/);
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
