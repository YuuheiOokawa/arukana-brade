// ============================================================
// useIcon — アイコン画像フック（属性・メニュー・通貨）
// ============================================================
import { useMemo } from 'react';
import { useAsset } from './useAsset';
import { AssetManager } from '../../lib/assets/AssetManager';
import { ELEMENT_TO_ATTR_ICON } from '../../lib/assets/assetIds';
import type { AttrIconId, MenuIconId, CurrencyIconId } from '../../lib/assets/assetIds';
import type { ElementType } from '../../types';

export type IconAssetId = AttrIconId | MenuIconId | CurrencyIconId;

export interface UseIconResult {
  url: string;
  isLoaded: boolean;
}

/**
 * @example
 * const { url } = useIcon(AttrIconId.FIRE);
 * const { url } = useIcon(MenuIconId.QUEST);
 */
export function useIcon(id: IconAssetId, eager = true): UseIconResult {
  const { url, isLoaded } = useAsset(id, eager);
  return { url, isLoaded };
}

/**
 * ElementType から属性アイコン URL を取得するヘルパーフック
 * @example
 * const { url } = useAttrIcon('fire');
 */
export function useAttrIcon(element: ElementType): UseIconResult {
  const id = useMemo(() => AssetManager.getAttrIconId(element), [element]);
  const { url, isLoaded } = useAsset(id, true);
  return { url, isLoaded };
}

/**
 * 全属性アイコンを一括取得（バトル画面の属性相性表示など）
 */
export function useAllAttrIcons(): Record<ElementType, string> {
  const elements: ElementType[] = ['fire', 'water', 'thunder', 'wind', 'light', 'dark', 'earth'];

  // 各属性の URL をプリロード
  const urls: Partial<Record<ElementType, string>> = {};
  for (const el of elements) {
    const id = ELEMENT_TO_ATTR_ICON[el];
    urls[el] = AssetManager.getById(id)?.path ?? '';
  }

  return urls as Record<ElementType, string>;
}
