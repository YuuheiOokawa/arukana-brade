// ============================================================
// useEffectImage — エフェクト画像フック
// ============================================================
import { useCallback } from 'react';
import { useAsset } from './useAsset';
import { AssetManager } from '../../lib/assets/AssetManager';
import type { EffectAssetId } from '../../lib/assets/assetIds';

export interface UseEffectImageResult {
  url: string;
  isLoaded: boolean;
  /** エフェクト本来の再生時間（ms）。アニメーション制御に使用 */
  durationMs: number | undefined;
  /** ループ再生が推奨されるか */
  loopable: boolean;
}

/**
 * @example
 * const { url, durationMs } = useEffectImage(EffectAssetId.SUMMON_MAGIC_CIRCLE);
 */
export function useEffectImage(
  id: EffectAssetId,
  eager = true,
): UseEffectImageResult {
  const { url, isLoaded } = useAsset(id, eager);

  const entry = AssetManager.getById(id);
  const durationMs = (entry as { durationMs?: number } | undefined)?.durationMs;
  const loopable   = (entry as { loopable?: boolean } | undefined)?.loopable ?? false;

  return { url, isLoaded, durationMs, loopable };
}

/**
 * ガチャ演出に必要なエフェクトを一括プリロードして URL を返す
 */
export function useSummonEffects() {
  const ids: EffectAssetId[] = [
    'EFFECT_SUMMON_MAGIC_CIRCLE',
    'EFFECT_SUMMON_LIGHT_BURST',
    'EFFECT_SUMMON_CRYSTAL_SHATTER',
    'EFFECT_SUMMON_CARD_REVEAL',
    'EFFECT_SUMMON_SSR_AURA',
    'EFFECT_SUMMON_ORB_ARCANA',
  ];

  const results = ids.map(id => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const r = useEffectImage(id as EffectAssetId, true);
    return [id, r] as const;
  });

  return Object.fromEntries(results) as Record<EffectAssetId, UseEffectImageResult>;
}
