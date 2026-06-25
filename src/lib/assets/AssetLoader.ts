// ============================================================
// アルカナブレイド — AssetLoader
// ============================================================
// 役割: 画像・音声・動画アセットのロード・キャッシュ・プリロードを管理するシングルトン。
// 設計方針:
//   - localStorage キャッシュは使わない（バイナリをメモリのみで保持）
//   - CDN 移行時は VITE_ASSETS_BASE_URL を変えるだけで対応
//   - エラーは fallback URL にフォールバックし、ゲームを止めない

import {
  type AnyAssetEntry,
  type AssetCacheEntry,
  type AssetLoadState,
  type LoadedAsset,
} from './assetTypes';
import {
  getCriticalPreloadTargets,
  getPreloadTargets,
  getAssetById,
} from '../../data/assets/assetManifest';

// ──────────────────────────────────────────
// CDN ベース URL（将来の移行用）
// ──────────────────────────────────────────

const ASSET_BASE: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSETS_BASE_URL) ?? '';

// 画像が存在しない場合のフォールバック（1×1 透明 PNG）
const FALLBACK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// ──────────────────────────────────────────
// AssetLoader クラス
// ──────────────────────────────────────────

class AssetLoaderImpl {
  private readonly cache = new Map<string, AssetCacheEntry>();
  private readonly loadingPromises = new Map<string, Promise<LoadedAsset>>();
  private criticalPreloaded = false;

  // ────────── URL 解決 ──────────

  resolveUrl(entry: AnyAssetEntry): string {
    return `${ASSET_BASE}${entry.path}`;
  }

  resolveUrlById(id: string): string {
    const entry = getAssetById(id);
    if (!entry) return FALLBACK_IMAGE;
    return this.resolveUrl(entry);
  }

  // ────────── キャッシュ操作 ──────────

  getCached(id: string): AssetCacheEntry | undefined {
    return this.cache.get(id);
  }

  getState(id: string): AssetLoadState {
    return this.cache.get(id)?.state ?? 'idle';
  }

  isLoaded(id: string): boolean {
    return this.cache.get(id)?.state === 'loaded';
  }

  /** URL を直接取得（ロード済みならキャッシュ済み URL、未ロードならマニフェスト上の URL） */
  getUrl(id: string): string {
    const cached = this.cache.get(id);
    if (cached?.state === 'loaded') return cached.loadedAsset.url;
    return this.resolveUrlById(id);
  }

  // ────────── 単一ロード ──────────

  async load(id: string): Promise<LoadedAsset> {
    // ロード済みならキャッシュを返す
    const cached = this.cache.get(id);
    if (cached?.state === 'loaded') return cached.loadedAsset;
    if (cached?.state === 'error') {
      return { id, url: FALLBACK_IMAGE, loadedAt: Date.now() };
    }

    // ロード中なら同じ Promise を返す（重複ロード防止）
    const inFlight = this.loadingPromises.get(id);
    if (inFlight) return inFlight;

    const entry = getAssetById(id);
    if (!entry) {
      console.warn(`[AssetLoader] Unknown asset id: ${id}`);
      return { id, url: FALLBACK_IMAGE, loadedAt: Date.now() };
    }

    const url = this.resolveUrl(entry);
    this.cache.set(id, { loadedAsset: { id, url, loadedAt: 0 }, state: 'loading' });

    const promise = this.loadImage(id, url).finally(() => {
      this.loadingPromises.delete(id);
    });
    this.loadingPromises.set(id, promise);
    return promise;
  }

  private loadImage(id: string, url: string): Promise<LoadedAsset> {
    return new Promise<LoadedAsset>(resolve => {
      const img = new Image();
      img.onload = () => {
        const loaded: LoadedAsset = { id, url, element: img, loadedAt: Date.now() };
        this.cache.set(id, { loadedAsset: loaded, state: 'loaded' });
        resolve(loaded);
      };
      img.onerror = () => {
        console.warn(`[AssetLoader] Failed to load: ${url}`);
        const fallback: LoadedAsset = { id, url: FALLBACK_IMAGE, loadedAt: Date.now() };
        this.cache.set(id, { loadedAsset: fallback, state: 'error', error: `load failed: ${url}` });
        resolve(fallback); // エラーでも resolve してゲームを止めない
      };
      img.src = url;
    });
  }

  // ────────── バッチプリロード ──────────

  /** 任意のアセットID群をプリロード */
  async preload(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.load(id)));
  }

  /** critical 優先度アセットを一括プリロード（アプリ起動時に呼ぶ） */
  async preloadCritical(): Promise<void> {
    if (this.criticalPreloaded) return;
    const targets = getCriticalPreloadTargets();
    await this.preload(targets.map(t => t.id));
    this.criticalPreloaded = true;
    if (import.meta.env.DEV) {
      console.log(`[AssetLoader] Critical preload done: ${targets.length} assets`);
    }
  }

  /** high + critical 優先度アセットをプリロード（ホーム画面到達後に呼ぶ） */
  async preloadHigh(): Promise<void> {
    const targets = getPreloadTargets();
    await this.preload(targets.map(t => t.id));
  }

  /** シーン別プリロード（例: バトル開始前） */
  async preloadScene(ids: string[]): Promise<{ loaded: number; failed: number }> {
    const results = await Promise.allSettled(ids.map(id => this.load(id)));
    const failed = results.filter(r => r.status === 'rejected').length;
    return { loaded: results.length - failed, failed };
  }

  // ────────── 存在チェック ──────────

  existsInManifest(id: string): boolean {
    return getAssetById(id) !== undefined;
  }

  /** HTTP HEAD リクエストで実際に存在するか確認（開発ツール用） */
  async existsOnServer(id: string): Promise<boolean> {
    const url = this.resolveUrlById(id);
    if (url === FALLBACK_IMAGE) return false;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ────────── キャッシュ管理 ──────────

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheStats(): { loaded: number; loading: number; error: number; idle: number } {
    let loaded = 0, loading = 0, error = 0, idle = 0;
    for (const entry of this.cache.values()) {
      if (entry.state === 'loaded') loaded++;
      else if (entry.state === 'loading') loading++;
      else if (entry.state === 'error') error++;
      else idle++;
    }
    return { loaded, loading, error, idle };
  }

  /** 特定アセットをキャッシュから削除（メモリ解放） */
  evict(id: string): void {
    this.cache.delete(id);
  }

  /** キャッシュ全クリア（シーン遷移でメモリを解放する場合） */
  evictAll(): void {
    this.cache.clear();
    this.criticalPreloaded = false;
  }

  /** 指定カテゴリ以外をキャッシュから削除 */
  evictExcept(keepIds: string[]): void {
    const keepSet = new Set(keepIds);
    for (const [id] of this.cache) {
      if (!keepSet.has(id)) this.cache.delete(id);
    }
  }
}

// ──────────────────────────────────────────
// シングルトンエクスポート
// ──────────────────────────────────────────

export const AssetLoader = new AssetLoaderImpl();
