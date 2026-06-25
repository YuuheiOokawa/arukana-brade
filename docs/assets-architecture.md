# アルカナブレイド — アセット管理アーキテクチャ

最終更新: 2026-06-25

---

## 全体概要

```
┌──────────────────────────────────────────────────────────────┐
│                    React コンポーネント                        │
│  useBackground()  useCharacterImage()  useIcon()  useAsset() │
└────────────────────────────┬─────────────────────────────────┘
                             │ hooks
┌────────────────────────────▼─────────────────────────────────┐
│                     AssetManager                              │
│  検索 / 統計 / 整合性チェック / シーン別プリロード             │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     AssetLoader                               │
│  URL解決 / HTMLImageElement ロード / メモリキャッシュ          │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                  AssetManifest (静的型定義)                    │
│  assetManifest.ts → *Assets.ts → assetIds.ts → assetTypes.ts │
└────────────────────────────┬─────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  public/assets/                         src/assets/images/
  (動的配信 · CDN移行先)                  (Vite バンドル用)
```

---

## ファイル構成

```
src/
  lib/
    assets/
      assetTypes.ts      # 全型定義（AssetEntry, AssetCategory 等）
      assetIds.ts        # アセットID定数（BgAssetId, UnitAssetId 等）
      AssetLoader.ts     # シングルトン: ロード・キャッシュ・プリロード
      AssetManager.ts    # シングルトン: 検索・統計・整合性チェック
      index.ts           # barrel export

  data/
    assets/
      assetManifest.ts   # 全マニフェスト統合 + ユーティリティ関数
      backgroundAssets.ts
      characterAssets.ts
      enemyAssets.ts
      iconAssets.ts
      uiAssets.ts
      effectAssets.ts
      itemAssets.ts
      equipmentAssets.ts

  hooks/
    assets/
      useAsset.ts            # 汎用 (任意 ID)
      useBackground.ts       # 背景専用
      useCharacterImage.ts   # キャラクター立ち絵専用
      useIcon.ts             # アイコン専用（属性/メニュー/通貨）
      useEffectImage.ts      # エフェクト専用
      index.ts               # barrel export

public/
  assets/
    images/
      backgrounds/{title,home,quest,battle,scenario,summon,profile}/
      characters/{heroes,units,npc}/
      enemies/{normal,elite,bosses,raid}/
      ui/{buttons,frames,panels,badges,navigation}/
      icons/{attributes,menu,items,rarity}/
      effects/{summon,magic,battle,awakening,evolution}/
      items/{consumables,materials,currency}/
      equipment/{weapons,armor,accessories}/
      portraits/
      cutins/
    sounds/{bgm,se,voices}/
    animations/{live2d,spine,lottie}/
    videos/
```

---

## 責務の分担

| レイヤー | ファイル | 責務 |
|---------|---------|------|
| 型定義 | `assetTypes.ts` | AssetEntry・AssetCategory・LoadedAsset など全型 |
| ID管理 | `assetIds.ts` | 型安全な定数。文字列を直接書かない |
| マニフェスト | `*Assets.ts` | ID → パス・メタデータ のマッピング |
| 統合 | `assetManifest.ts` | 全マニフェスト合成・フィルタ関数 |
| ロード | `AssetLoader.ts` | HTTP取得・キャッシュ・プリロード |
| 管理 | `AssetManager.ts` | 検索・統計・整合性チェック・シーン別操作 |
| UI接続 | `hooks/assets/` | React での宣言的アセット取得 |

---

## URL 解決フロー

```
ID: "BG_HOME_FLOATING_CITY"
    ↓ assetManifest
path: "/assets/images/backgrounds/home/bg_home_floating_city.webp"
    ↓ VITE_ASSETS_BASE_URL (空 = localhost, CDN時は "https://cdn.example.com")
url: "https://cdn.example.com/assets/images/backgrounds/home/bg_home_floating_city.webp"
    ↓ HTMLImageElement.src
キャッシュ: Map<id, AssetCacheEntry>
```

---

## プリロード戦略

| タイミング | 対象 | 呼び出し元 |
|-----------|------|-----------|
| アプリ起動直後 | `priority: 'critical'` かつ `preload: true` | `AssetLoader.preloadCritical()` |
| ホーム到達後 | `priority: 'high'` かつ `preload: true` | `AssetLoader.preloadHigh()` |
| シーン遷移前 | 当該シーンに必要な ID 群 | `AssetManager.preloadBattleScene()` 等 |
| コンポーネントレンダリング時 | `useAsset(id, eager=true)` | 各 Hook |
| 遅延読み込み | `useAsset(id, eager=false)` | IntersectionObserver と組み合わせ |

---

## CDN 移行

`.env.local` に追記するだけで切り替わる:

```env
VITE_ASSETS_BASE_URL=https://cdn.arcana-blade.example.com
```

---

## Phaser 連携（将来対応）

```ts
// Phaser シーンの preload() から AssetManager を使う例
class BattleScene extends Phaser.Scene {
  preload() {
    const bg = AssetManager.getById('BG_BATTLE_MYSTIC_FOREST');
    if (bg) this.load.image(bg.id, bg.path);
  }
}
```

---

## Live2D / Spine / Lottie（将来対応）

`src/lib/assets/assetTypes.ts` の `AnimationAsset` 型が用意済み。
実装時は `animationType: 'live2d' | 'spine' | 'lottie'` を使い、
対応する `AnimationLoader` クラスを追加するだけで統合できる。
