# アルカナブレイド — アセットマニフェスト管理ガイド

最終更新: 2026-06-25

---

## マニフェストとは

各アセットの **ID・パス・カテゴリ・優先度・メタデータ** を一元管理する型定義ファイル群。  
ゲーム内でアセットを参照する際は **文字列パスを直接書かず、ID 経由でアクセス**する。

---

## 新規アセット追加手順

### ① ファイルを配置

```
public/assets/images/{category}/{subcategory}/{filename}.webp
```

例:
```
public/assets/images/characters/units/unit_fire_warrior_002.webp
```

---

### ② assetIds.ts に ID を追加

[src/lib/assets/assetIds.ts](../src/lib/assets/assetIds.ts) を開き、対応するオブジェクトに追記:

```ts
export const UnitAssetId = {
  // 既存 ...
  FIRE_WARRIOR_002: 'UNIT_FIRE_WARRIOR_002',  // ← 追加
} as const;
```

**命名規則:**
- `UPPER_SNAKE_CASE`
- カテゴリプレフィックス: `BG_` / `HERO_` / `UNIT_` / `ENEMY_` / `ICON_` / `BTN_` / `FRAME_` / `EFFECT_` / `ITEM_` / `EQUIP_` / `PORTRAIT_` / `CUTIN_`
- 末尾に連番: `_001`, `_002` ...

---

### ③ *Assets.ts にエントリを追加

対応するマニフェストファイルを開き、エントリを追記:

```ts
// src/data/assets/characterAssets.ts

[UnitAssetId.FIRE_WARRIOR_002]: {
  id: UnitAssetId.FIRE_WARRIOR_002,
  path: '/assets/images/characters/units/unit_fire_warrior_002.webp',
  category: 'character',
  mediaType: 'image/webp',
  priority: 'normal',    // critical / high / normal / lazy
  preload: false,
  transparent: true,
  size: { width: 1024, height: 1536 },
  elementType: 'fire',
  characterId: 'unit_fire_warrior_002',
  pose: 'standing',
  tags: ['unit', 'fire', 'warrior'],
  status: 'placeholder', // ← 画像生成前は必ず placeholder
},
```

---

### ④ Hook で使用

```tsx
import { useCharacterImage } from '../hooks/assets';
import { UnitAssetId } from '../lib/assets/assetIds';

const { url, isLoaded } = useCharacterImage(UnitAssetId.FIRE_WARRIOR_002);
return <img src={url} className={isLoaded ? 'opacity-100' : 'opacity-0 transition-opacity'} />;
```

---

## アセットステータス管理

各エントリには `status` フィールドがあり、生成進捗を追跡できる:

| ステータス | 意味 |
|-----------|------|
| `placeholder` | 画像未生成（絵文字・色で代替表示） |
| `generated` | AI生成済み・まだ採用していない |
| `adopted` | 採用済み・ゲームで使用中 |
| `deprecated` | 廃止予定（削除前の猶予期間） |

画像を生成・採用したらステータスを更新:
```ts
status: 'adopted',
```

---

## 未生成アセット一覧を確認する（開発ツール）

ブラウザコンソールで:
```ts
import { AssetManager } from './src/lib/assets/AssetManager';
AssetManager.getMissingAssets().map(a => a.id);
// → ['BG_TITLE_ARCANA_GATE', 'HERO_HUMAN_MALE_001', ...]
```

---

## マニフェスト統計を確認する

```ts
AssetManager.printStats();
// [AssetManager] Stats
// | category    | count |
// | background  |    14 |
// | character   |    18 |
// | enemy       |    17 |
// ...
// Missing (placeholder): 82
```

---

## AssetEntry フィールド一覧

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✅ | AssetId 定数と一致する一意 ID |
| `path` | string | ✅ | `/assets/images/...` 形式の絶対パス |
| `category` | AssetCategory | ✅ | background / character / enemy / ... |
| `mediaType` | AssetMediaType | ✅ | image/webp / audio/mp3 / ... |
| `priority` | AssetPriority | ✅ | critical / high / normal / lazy |
| `preload` | boolean | ✅ | true = 優先度に応じて自動プリロード |
| `transparent` | boolean | ― | 透明チャンネルを持つか |
| `size` | {width, height} | ― | 推奨サイズ (px) |
| `elementType` | ElementType | ― | 属性（fire/water/...） |
| `tags` | string[] | ― | 検索・フィルタ用タグ |
| `status` | AssetStatus | ― | placeholder / generated / adopted / deprecated |

カテゴリ固有フィールドは `assetTypes.ts` の各インターフェース参照。

---

## ファイル対応表

| カテゴリ | マニフェストファイル | ID 定数 |
|---------|-----------------|---------|
| 背景 | `backgroundAssets.ts` | `BgAssetId` |
| 主人公 | `characterAssets.ts` | `HeroAssetId` |
| ユニット | `characterAssets.ts` | `UnitAssetId` |
| 敵 | `enemyAssets.ts` | `EnemyAssetId` |
| 属性アイコン | `iconAssets.ts` | `AttrIconId` |
| メニューアイコン | `iconAssets.ts` | `MenuIconId` |
| 通貨アイコン | `iconAssets.ts` | `CurrencyIconId` |
| ボタン | `uiAssets.ts` | `BtnAssetId` |
| フレーム | `uiAssets.ts` | `FrameAssetId` |
| エフェクト | `effectAssets.ts` | `EffectAssetId` |
| アイテム | `itemAssets.ts` | `ItemAssetId` |
| 装備品 | `equipmentAssets.ts` | `EquipAssetId` |
