# アルカナブレイド — アセットローディング戦略

最終更新: 2026-06-25

---

## ローディング優先度

### priority: 'critical'

アプリ起動直後にロードする最重要アセット。  
`AssetLoader.preloadCritical()` を **`main.tsx` または最初の `useEffect`** で呼ぶ。

対象例:
- タイトル背景
- ガチャ背景・魔法陣エフェクト
- 属性アイコン全7種（バトル全面で使用）
- 通貨アイコン（ホーム常時表示）
- ガチャカードフレーム SSR

```tsx
// main.tsx
import { AssetLoader } from './lib/assets';

AssetLoader.preloadCritical().catch(console.error);
```

### priority: 'high'

ホーム画面到達後にロードする。
`AssetLoader.preloadHigh()` を **ホーム画面マウント時の `useEffect`** で呼ぶ。

対象例:
- ホーム背景
- クエストマップ背景
- 初期ユニット6体の立ち絵
- 通常・レアカードフレーム

```tsx
// HomePage.tsx
useEffect(() => {
  void AssetLoader.preloadHigh();
}, []);
```

### priority: 'normal'

シーン到達時に必要になり次第ロードする（Hook が担当）。  
`useAsset(id, true)` がコンポーネントマウント時に自動的に発火。

### priority: 'lazy'

IntersectionObserver と組み合わせてビューポート内に入った時にロードする。  
`useAsset(id, false)` で遅延フラグを立て、コンポーネント側で制御。

---

## プリロード API

### AssetLoader

```ts
// 単一ロード
await AssetLoader.load('BG_HOME_FLOATING_CITY');

// バッチプリロード
await AssetLoader.preload(['UNIT_FIRE_SWORDSMAN_001', 'UNIT_WATER_MAGE_001']);

// critical プリロード（起動時）
await AssetLoader.preloadCritical();

// high + critical プリロード（ホーム到達後）
await AssetLoader.preloadHigh();

// シーン別プリロード（バトル開始前）
const { loaded, failed } = await AssetLoader.preloadScene([
  'BG_BATTLE_MYSTIC_FOREST',
  'ENEMY_SHADOW_SLIME_001',
  'BOSS_BLACK_CRYSTAL_DRAGON_001',
]);
```

### AssetManager（シーン別高レベル API）

```ts
// タイトル画面プリロード
await AssetManager.preloadTitleScene();

// ホーム画面プリロード
await AssetManager.preloadHomeScene();

// ガチャ画面プリロード
await AssetManager.preloadSummonScene();

// バトル画面プリロード（使用する背景IDと敵IDを渡す）
await AssetManager.preloadBattleScene(
  'BG_BATTLE_MYSTIC_FOREST',
  ['ENEMY_SHADOW_SLIME_001', 'ENEMY_SHADOW_GOBLIN_001'],
);
```

---

## React Hook でのロード

### 基本パターン

```tsx
import { useAsset } from '../hooks/assets';

function UnitCard({ unitId }: { unitId: string }) {
  const { url, isLoaded } = useAsset(unitId);

  return (
    <img
      src={url}
      alt={unitId}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
```

### 背景パターン

```tsx
import { useBackground } from '../hooks/assets';
import { BgAssetId } from '../lib/assets';

function HomeScreen() {
  const { cssValue } = useBackground(BgAssetId.HOME_FLOATING_CITY);

  return (
    <div
      className="fixed inset-0 bg-cover bg-center"
      style={{ backgroundImage: cssValue }}
    />
  );
}
```

### 属性アイコンパターン

```tsx
import { useAttrIcon } from '../hooks/assets';
import type { ElementType } from '../types';

function ElementBadge({ element }: { element: ElementType }) {
  const { url } = useAttrIcon(element);
  return <img src={url} alt={element} className="w-6 h-6" />;
}
```

---

## キャッシュ管理

### キャッシュ状態確認

```ts
const stats = AssetLoader.getCacheStats();
// { loaded: 42, loading: 3, error: 0, idle: 0 }

console.log(`キャッシュ件数: ${AssetLoader.getCacheSize()}`);
```

### メモリ解放

```ts
// 特定アセットを解放
AssetLoader.evict('BG_BATTLE_MYSTIC_FOREST');

// 指定 ID 以外を解放（ホームに戻る時など）
AssetLoader.evictExcept([
  'BG_HOME_FLOATING_CITY',
  'ICON_CURRENCY_GOLD',
  'ICON_CURRENCY_DIAMOND',
]);

// 全キャッシュクリア（シーン完全リセット時）
AssetLoader.evictAll();
```

---

## フォールバック設計

- ロードエラー時: `1×1 透明 PNG` にフォールバック → ゲームが止まらない
- fallback 中は CSS で プレースホルダーカラーを表示する推奨パターン:

```tsx
const { url, isLoaded, isError } = useAsset('UNIT_FIRE_SWORDSMAN_001');

<div className="relative w-24 h-36">
  {!isLoaded && (
    <div className="absolute inset-0 bg-purple-900/40 animate-pulse rounded" />
  )}
  <img src={url} className={isLoaded ? 'opacity-100' : 'opacity-0'} />
</div>
```

---

## パフォーマンス指標（目標値）

| 指標 | 目標 |
|------|------|
| Critical プリロード完了 | 起動後 2 秒以内 |
| タイトル画面表示 | Critical 完了後即座 |
| ガチャ演出エフェクト | 全エフェクト 500ms 以内にロード済み |
| バトル背景 | ステージ遷移アニメーション中（500ms）にロード完了 |
| ユニット立ち絵 | スクロール到達の 200ms 前にロード完了（lazy） |

---

## WebP 運用ガイドライン

全アセットは `.webp` 形式を使用。

```bash
# PNG / JPEG → WebP 変換（cwebp コマンド）
cwebp -q 90 input.png -o output.webp        # 通常画像
cwebp -q 90 -lossless input.png -o output.webp  # 透過PNG（完全可逆）
cwebp -q 85 -resize 1024 1536 input.png -o output.webp  # リサイズ込み変換
```

| 用途 | 品質 | 推奨サイズ |
|------|------|-----------|
| 背景 | q=85 | 1920×1080 |
| キャラクター立ち絵 | q=90 lossless | 1024×1536 |
| アイコン | q=90 lossless | 256×256 |
| エフェクト（透過） | q=90 lossless | 512〜1024 px |
| ボス | q=90 | 1024×1024〜1536 |
