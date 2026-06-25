// ============================================================
// アルカナブレイド — アセット型定義
// ============================================================

import type { ElementType } from '../../types';

// ──────────────────────────────────────────
// カテゴリ・メディア種別
// ──────────────────────────────────────────

export type AssetCategory =
  | 'background'
  | 'character'
  | 'enemy'
  | 'icon'
  | 'ui'
  | 'effect'
  | 'item'
  | 'equipment'
  | 'portrait'
  | 'cutin'
  | 'sound'
  | 'bgm'
  | 'voice'
  | 'animation'
  | 'video';

export type AssetMediaType =
  | 'image/webp'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/svg+xml'
  | 'audio/mp3'
  | 'audio/ogg'
  | 'audio/wav'
  | 'video/mp4'
  | 'video/webm'
  | 'application/json'   // Lottie / Spine データ
  | 'model/gltf+json';   // Live2D / 3D

// ──────────────────────────────────────────
// ロード優先度
// ──────────────────────────────────────────

/**
 * critical  : アプリ起動直後にプリロード（タイトル画面・ロゴ等）
 * high      : 最初のシーン遷移前にプリロード
 * normal    : 画面に入ったタイミングでロード
 * lazy      : スクロール/遷移で画面内に入ったタイミングでロード
 */
export type AssetPriority = 'critical' | 'high' | 'normal' | 'lazy';

// ──────────────────────────────────────────
// アセットエントリ本体
// ──────────────────────────────────────────

export interface AssetEntry {
  /** ユニークID（AssetId 定数と一致） */
  readonly id: string;
  /** public/ 配下からの絶対パス: "/assets/images/..." */
  readonly path: string;
  readonly category: AssetCategory;
  readonly mediaType: AssetMediaType;
  readonly priority: AssetPriority;
  /** true = 優先度に応じて自動プリロード */
  readonly preload: boolean;
  /** 透過PNGまたはWebP */
  readonly transparent?: boolean;
  /** 推奨サイズ（px） */
  readonly size?: { width: number; height: number };
  /** 属性フィルタ用タグ（火/水/雷...） */
  readonly elementType?: ElementType;
  /** 検索・フィルタ用自由タグ */
  readonly tags?: readonly string[];
  /** ステータス管理 */
  readonly status?: AssetStatus;
}

export type AssetStatus =
  | 'placeholder' // まだ生成されていない（絵文字/色で代替）
  | 'generated'   // AI生成済み・未採用
  | 'adopted'     // 採用済み・本番使用中
  | 'deprecated'; // 廃止予定

// ──────────────────────────────────────────
// カテゴリ別の特化型
// ──────────────────────────────────────────

export interface BackgroundImage extends AssetEntry {
  readonly category: 'background';
  /** バトル背景かどうか（戦闘中はキャラをオーバーレイするため深度情報が必要） */
  readonly isBattleStage?: boolean;
  /** UI重ね時のコントラスト調整推奨色 */
  readonly uiOverlayHint?: 'dark' | 'light';
}

export interface CharacterImage extends AssetEntry {
  readonly category: 'character';
  readonly characterId: string;
  readonly pose?: 'standing' | 'battle' | 'victory' | 'down';
}

export interface EnemyImage extends AssetEntry {
  readonly category: 'enemy';
  readonly enemyId: string;
  readonly tier?: 'normal' | 'elite' | 'boss' | 'raid';
}

export interface UIAsset extends AssetEntry {
  readonly category: 'ui';
  readonly uiRole?: 'button' | 'frame' | 'panel' | 'badge' | 'navigation';
  readonly rarityLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface EffectAsset extends AssetEntry {
  readonly category: 'effect';
  readonly loopable?: boolean;
  /** 再生時間（ms）。アニメーション画像のフレーム合成用 */
  readonly durationMs?: number;
}

export interface IconAsset extends AssetEntry {
  readonly category: 'icon';
  readonly iconRole?: 'attribute' | 'menu' | 'item' | 'rarity' | 'currency';
}

export interface ItemAsset extends AssetEntry {
  readonly category: 'item';
  readonly itemRole?: 'consumable' | 'material' | 'currency' | 'ticket';
}

export interface EquipmentAsset extends AssetEntry {
  readonly category: 'equipment';
  readonly slot?: 'weapon' | 'armor' | 'helmet' | 'gloves' | 'boots' | 'accessory';
}

export interface PortraitImage extends AssetEntry {
  readonly category: 'portrait';
  readonly characterId: string;
  readonly expression?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'battle';
}

export interface CutinImage extends AssetEntry {
  readonly category: 'cutin';
  readonly characterId: string;
  readonly cutinType?: 'skill' | 'ultimate' | 'special';
}

// ──────────────────────────────────────────
// 将来対応: アニメーション・音声型
// ──────────────────────────────────────────

export interface SoundAsset extends AssetEntry {
  readonly category: 'sound' | 'bgm' | 'voice';
  readonly durationSec?: number;
  readonly loopable?: boolean;
  readonly volumeDefault?: number; // 0.0〜1.0
}

export interface AnimationAsset extends AssetEntry {
  readonly category: 'animation';
  readonly animationType: 'live2d' | 'spine' | 'lottie' | 'gif';
  readonly fps?: number;
  readonly loopable?: boolean;
}

export interface VideoAsset extends AssetEntry {
  readonly category: 'video';
  readonly videoType?: 'background' | 'cutscene' | 'tutorial';
  readonly loopable?: boolean;
  readonly hasAudio?: boolean;
}

// ──────────────────────────────────────────
// ローダー・キャッシュ型
// ──────────────────────────────────────────

export type LoadedAsset = {
  id: string;
  url: string;
  element?: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
  loadedAt: number;
};

export type AssetLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface AssetCacheEntry {
  loadedAsset: LoadedAsset;
  state: AssetLoadState;
  error?: string;
}

// ──────────────────────────────────────────
// マニフェスト集約型
// ──────────────────────────────────────────

export type AnyAssetEntry =
  | BackgroundImage
  | CharacterImage
  | EnemyImage
  | UIAsset
  | EffectAsset
  | IconAsset
  | ItemAsset
  | EquipmentAsset
  | PortraitImage
  | CutinImage
  | SoundAsset
  | AnimationAsset
  | VideoAsset;

export type AssetManifestMap = Readonly<Record<string, AnyAssetEntry>>;
