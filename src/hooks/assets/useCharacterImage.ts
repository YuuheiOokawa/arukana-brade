// ============================================================
// useCharacterImage — キャラクター立ち絵フック
// ============================================================
import { useAsset } from './useAsset';
import type { HeroAssetId, UnitAssetId } from '../../lib/assets/assetIds';

export type CharacterAssetId = HeroAssetId | UnitAssetId;

export interface UseCharacterImageResult {
  url: string;
  isLoaded: boolean;
  isError: boolean;
  /** <img> 用 alt テキスト（ID ベース） */
  alt: string;
}

/**
 * @example
 * const { url, isLoaded } = useCharacterImage(HeroAssetId.HUMAN_MALE_001);
 * return <img src={url} className={isLoaded ? 'opacity-100' : 'opacity-0'} />;
 */
export function useCharacterImage(
  id: CharacterAssetId,
  /** false にすると表示直前まで読み込みを遅延 */
  eager = true,
): UseCharacterImageResult {
  const { url, isLoaded, isError } = useAsset(id, eager);

  return {
    url,
    isLoaded,
    isError,
    alt: id,
  };
}
