// ============================================================
// useBackground — 背景画像フック
// ============================================================
import { useMemo } from 'react';
import { useAsset } from './useAsset';
import { AssetManager } from '../../lib/assets/AssetManager';
import type { BgAssetId } from '../../lib/assets/assetIds';

export interface UseBackgroundResult {
  /** img src または background-image url() に渡す値 */
  url: string;
  /** CSS backgroundImage 値: "url('/assets/...')" */
  cssValue: string;
  /** UIオーバーレイの推奨カラー */
  uiOverlayHint: 'dark' | 'light' | undefined;
  isLoaded: boolean;
  isError: boolean;
}

/**
 * @example
 * const { cssValue } = useBackground(BgAssetId.HOME_FLOATING_CITY);
 * return <div style={{ backgroundImage: cssValue }} />;
 */
export function useBackground(id: BgAssetId): UseBackgroundResult {
  const { url, isLoaded, isError } = useAsset(id, true);

  const entry = useMemo(() => {
    const e = AssetManager.getById(id);
    return e?.category === 'background' ? e : null;
  }, [id]);

  const cssValue = useMemo(() => (url ? `url('${url}')` : ''), [url]);

  return {
    url,
    cssValue,
    uiOverlayHint: (entry as { uiOverlayHint?: 'dark' | 'light' } | null)?.uiOverlayHint,
    isLoaded,
    isError,
  };
}
