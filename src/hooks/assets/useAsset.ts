// ============================================================
// useAsset — 任意アセット ID の URL を返す汎用フック
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { AssetLoader } from '../../lib/assets/AssetLoader';
import type { AssetLoadState } from '../../lib/assets/assetTypes';

export interface UseAssetResult {
  /** 画像 URL（未ロードでもマニフェスト上のパスを返す） */
  url: string;
  /** ロード状態 */
  state: AssetLoadState;
  /** エラーが発生したか */
  isError: boolean;
  /** ロード完了か */
  isLoaded: boolean;
  /** 手動リトライ */
  retry: () => void;
}

/**
 * @example
 * const { url, isLoaded } = useAsset('BG_HOME_FLOATING_CITY');
 * return <img src={url} style={{ opacity: isLoaded ? 1 : 0 }} />;
 */
export function useAsset(id: string, eager = true): UseAssetResult {
  const [state, setState] = useState<AssetLoadState>(() =>
    AssetLoader.getState(id),
  );
  const [retryCount, setRetryCount] = useState(0);

  const url = AssetLoader.getUrl(id);

  useEffect(() => {
    if (!id) return;
    if (!eager) return;

    // すでにロード済みなら終了
    if (AssetLoader.isLoaded(id)) {
      setState('loaded');
      return;
    }

    setState('loading');
    let cancelled = false;
    AssetLoader.load(id).then(() => {
      if (!cancelled) setState(AssetLoader.getState(id));
    });

    return () => { cancelled = true; };
  }, [id, eager, retryCount]);

  const retry = useCallback(() => {
    AssetLoader.evict(id);
    setRetryCount(c => c + 1);
  }, [id]);

  return {
    url,
    state,
    isError: state === 'error',
    isLoaded: state === 'loaded',
    retry,
  };
}
