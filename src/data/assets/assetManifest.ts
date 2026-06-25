// ============================================================
// アルカナブレイド — 中央アセットマニフェスト
// ============================================================
// 新規アセットを追加する手順:
//   1. public/assets/ 配下に画像を配置
//   2. 対応する assetIds.ts に ID を追加
//   3. 対応する *Assets.ts にエントリを追加
//   4. このファイルへの自動反映は satisfies により型チェックされる
// ============================================================

import { backgroundAssets }  from './backgroundAssets';
import { characterAssets }   from './characterAssets';
import { enemyAssets }       from './enemyAssets';
import { iconAssets }        from './iconAssets';
import { uiAssets }          from './uiAssets';
import { effectAssets }      from './effectAssets';
import { itemAssets }        from './itemAssets';
import { equipmentAssets }   from './equipmentAssets';

import type { AssetManifestMap, AnyAssetEntry, AssetCategory, AssetPriority, AssetStatus } from '../../lib/assets/assetTypes';

// ──────────────────────────────────────────
// 全マニフェスト統合
// ──────────────────────────────────────────

export const assetManifest: AssetManifestMap = {
  ...backgroundAssets,
  ...characterAssets,
  ...enemyAssets,
  ...iconAssets,
  ...uiAssets,
  ...effectAssets,
  ...itemAssets,
  ...equipmentAssets,
} as const;

// ──────────────────────────────────────────
// ユーティリティ: フィルタ・検索
// ──────────────────────────────────────────

/** カテゴリで絞り込む */
export function getAssetsByCategory(category: AssetCategory): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(a => a.category === category);
}

/** 優先度でフィルタ */
export function getAssetsByPriority(priority: AssetPriority): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(a => a.priority === priority);
}

/** プリロード対象を取得（priority: critical | high のうち preload: true） */
export function getPreloadTargets(): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(a => a.preload);
}

/** critical プリロード対象（起動時） */
export function getCriticalPreloadTargets(): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(
    a => a.preload && a.priority === 'critical',
  );
}

/** タグ検索 */
export function getAssetsByTag(tag: string): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(a => a.tags?.includes(tag));
}

/** ステータスでフィルタ（未生成の一覧などに使用） */
export function getAssetsByStatus(status: AssetStatus): AnyAssetEntry[] {
  return Object.values(assetManifest).filter(a => a.status === status);
}

/** ID で取得（型安全） */
export function getAssetById(id: string): AnyAssetEntry | undefined {
  return assetManifest[id];
}

// ──────────────────────────────────────────
// マニフェスト統計（開発ツール用）
// ──────────────────────────────────────────

export function getManifestStats() {
  const all = Object.values(assetManifest);
  const byCategory = all.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});
  const byStatus = all.reduce<Record<string, number>>((acc, a) => {
    const s = a.status ?? 'unknown';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: all.length,
    byCategory,
    byStatus,
    preloadCount: all.filter(a => a.preload).length,
    criticalCount: all.filter(a => a.priority === 'critical').length,
  };
}

// カテゴリ別エクスポート（直接アクセス用）
export {
  backgroundAssets,
  characterAssets,
  enemyAssets,
  iconAssets,
  uiAssets,
  effectAssets,
  itemAssets,
  equipmentAssets,
};
