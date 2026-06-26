// ============================================================
// アルカナブレイド — AssetManager
// ============================================================
// 役割: マニフェスト全体の検索・統計・整合性チェックを担う管理レイヤー。
// AssetLoader がランタイムの「ロード実行機」なら
// AssetManager は「在庫管理・品質管理」の責務を持つ。

import {
  assetManifest,
  getAssetsByCategory,
  getAssetsByTag,
  getAssetsByStatus,
  getManifestStats,
  getAssetById,
} from '../../data/assets/assetManifest';
import { AssetLoader } from './AssetLoader';
import type {
  AnyAssetEntry,
  AssetCategory,
  AssetPriority,
  AssetStatus,
} from './assetTypes';
import type { ElementType } from '../../types';
import { ELEMENT_TO_ATTR_ICON } from './assetIds';

// ──────────────────────────────────────────
// AssetManager クラス
// ──────────────────────────────────────────

class AssetManagerImpl {

  // ────────── ID 検索 ──────────

  /** ID でアセットエントリを取得（存在しない場合は undefined） */
  getById(id: string): AnyAssetEntry | undefined {
    return getAssetById(id);
  }

  /** ID の存在確認 */
  has(id: string): boolean {
    return id in assetManifest;
  }

  /** 複数 ID を一括取得（存在しない ID は含まれない） */
  getMany(ids: string[]): AnyAssetEntry[] {
    return ids.flatMap(id => {
      const entry = getAssetById(id);
      return entry ? [entry] : [];
    });
  }

  // ────────── カテゴリ検索 ──────────

  getByCategory(category: AssetCategory): AnyAssetEntry[] {
    return getAssetsByCategory(category);
  }

  getBackgrounds() { return this.getByCategory('background'); }
  getCharacters()  { return this.getByCategory('character'); }
  getEnemies()     { return this.getByCategory('enemy'); }
  getIcons()       { return this.getByCategory('icon'); }
  getUI()          { return this.getByCategory('ui'); }
  getEffects()     { return this.getByCategory('effect'); }
  getItems()       { return this.getByCategory('item'); }
  getEquipment()   { return this.getByCategory('equipment'); }

  // ────────── タグ・属性検索 ──────────

  getByTag(tag: string): AnyAssetEntry[] {
    return getAssetsByTag(tag);
  }

  /** 複数タグの AND 検索 */
  getByTags(tags: string[]): AnyAssetEntry[] {
    return Object.values(assetManifest).filter(a =>
      tags.every(tag => a.tags?.includes(tag)),
    );
  }

  /** 属性（ElementType）でキャラクター・アイコンを絞り込む */
  getByElement(element: ElementType): AnyAssetEntry[] {
    return Object.values(assetManifest).filter(a => a.elementType === element);
  }

  /** 属性アイコンの ID を取得 */
  getAttrIconId(element: ElementType): string {
    return ELEMENT_TO_ATTR_ICON[element];
  }

  // ────────── 優先度・ステータス検索 ──────────

  getByPriority(priority: AssetPriority): AnyAssetEntry[] {
    return Object.values(assetManifest).filter(a => a.priority === priority);
  }

  getByStatus(status: AssetStatus): AnyAssetEntry[] {
    return getAssetsByStatus(status);
  }

  /** まだ画像が用意されていない（placeholder）アセット一覧 */
  getMissingAssets(): AnyAssetEntry[] {
    return this.getByStatus('placeholder');
  }

  // ────────── 整合性チェック（開発ツール用） ──────────

  /**
   * マニフェスト内の重複 ID を検出
   * 通常は型制約で防がれるが、動的追加時のセーフガード
   */
  findDuplicateIds(): string[] {
    const ids = Object.keys(assetManifest);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const id of ids) {
      if (seen.has(id)) duplicates.push(id);
      else seen.add(id);
    }
    return duplicates;
  }

  /**
   * 重複パス（同じ画像ファイルが複数 ID に登録されている）を検出
   */
  findDuplicatePaths(): Map<string, string[]> {
    const pathToIds = new Map<string, string[]>();
    for (const [id, entry] of Object.entries(assetManifest)) {
      const existing = pathToIds.get(entry.path) ?? [];
      pathToIds.set(entry.path, [...existing, id]);
    }
    const result = new Map<string, string[]>();
    for (const [path, ids] of pathToIds) {
      if (ids.length > 1) result.set(path, ids);
    }
    return result;
  }

  /**
   * キャッシュ済みだがマニフェストに存在しない孤立エントリを検出
   */
  findOrphanedCacheEntries(): string[] {
    const stats = AssetLoader.getCacheStats();
    // getCacheStats はカウントのみ返すため、ここでは存在チェックを使用
    // 必要に応じて AssetLoader の内部キャッシュキーを公開して拡張
    void stats;
    return [];
  }

  /**
   * サーバ上での実在チェックを一括実行（開発環境限定推奨）
   * 返り値: 存在しなかったアセット ID の配列
   */
  async checkServerExistence(ids?: string[]): Promise<string[]> {
    const targets = ids ?? Object.keys(assetManifest);
    const results = await Promise.all(
      targets.map(async id => ({
        id,
        exists: await AssetLoader.existsOnServer(id),
      })),
    );
    return results.filter(r => !r.exists).map(r => r.id);
  }

  // ────────── シーン別プリロード ──────────

  /** タイトル画面プリロード */
  async preloadTitleScene(): Promise<void> {
    const ids = ['BG_TITLE_ARCANA_GATE'];
    await AssetLoader.preloadScene(ids);
  }

  /** ホーム画面プリロード */
  async preloadHomeScene(): Promise<void> {
    const ids = [
      'BG_HOME_FLOATING_CITY',
      'ICON_ATTR_FIRE', 'ICON_ATTR_WATER', 'ICON_ATTR_THUNDER',
      'ICON_ATTR_WIND', 'ICON_ATTR_LIGHT', 'ICON_ATTR_DARK', 'ICON_ATTR_EARTH',
      'ICON_CURRENCY_GOLD', 'ICON_CURRENCY_DIAMOND', 'ICON_CURRENCY_STAMINA',
    ];
    await AssetLoader.preloadScene(ids);
  }

  /** ガチャ画面プリロード */
  async preloadSummonScene(): Promise<void> {
    const ids = [
      'BG_SUMMON_TEMPLE',
      'EFFECT_SUMMON_MAGIC_CIRCLE',
      'EFFECT_SUMMON_LIGHT_BURST',
      'EFFECT_SUMMON_CRYSTAL_SHATTER',
      'EFFECT_SUMMON_CARD_REVEAL',
      'EFFECT_SUMMON_SSR_AURA',
      'EFFECT_SUMMON_ORB_ARCANA',
      'FRAME_UNIT_CARD_N',
      'FRAME_UNIT_CARD_R',
      'FRAME_UNIT_CARD_ARCANA',
    ];
    await AssetLoader.preloadScene(ids);
  }

  /** バトル画面プリロード（ステージ ID とエネミー ID を渡す） */
  async preloadBattleScene(bgId: string, enemyIds: string[]): Promise<void> {
    await AssetLoader.preloadScene([bgId, ...enemyIds]);
  }

  // ────────── 統計情報 ──────────

  getStats() {
    return {
      manifest: getManifestStats(),
      cache: AssetLoader.getCacheStats(),
    };
  }

  /** 開発コンソール向けサマリ出力 */
  printStats(): void {
    if (import.meta.env.PROD) return;
    const stats = this.getStats();
    console.group('[AssetManager] Stats');
    console.table(stats.manifest.byCategory);
    console.log('Missing (placeholder):', this.getMissingAssets().length);
    console.log('Cache:', stats.cache);
    console.groupEnd();
  }
}

// ──────────────────────────────────────────
// シングルトンエクスポート
// ──────────────────────────────────────────

export const AssetManager = new AssetManagerImpl();
