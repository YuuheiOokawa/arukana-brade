# アルカナブレイド — アセット運用ガイドライン

最終更新: 2026-06-25

---

## 命名規則

### 画像ファイル名

```
{category}_{subcategory}_{descriptor}_{variant}.webp
```

| カテゴリ | 例 |
|---------|-----|
| 背景 | `bg_title_arcana_gate.webp` |
| 主人公 | `hero_human_male_001.webp` |
| ユニット | `unit_fire_swordsman_001.webp` |
| 敵（通常） | `enemy_shadow_slime_001.webp` |
| 敵（ボス） | `boss_black_crystal_dragon_001.webp` |
| ボタン | `btn_gold_primary.webp` |
| フレーム | `frame_unit_card_arcana.webp` |
| アイコン（属性） | `icon_attr_fire.webp` |
| アイコン（メニュー） | `icon_menu_quest.webp` |
| エフェクト | `effect_summon_magic_circle.webp` |
| アイテム | `item_currency_diamond.webp` |
| 装備 | `equip_weapon_arcana_sword_001.webp` |
| ポートレート | `portrait_hero_human_male_001.webp` |
| カットイン | `cutin_hero_human_male_skill.webp` |

### アセット ID

```
UPPER_SNAKE_CASE with category prefix
```

| カテゴリ | プレフィックス | 例 |
|---------|-------------|-----|
| 背景 | `BG_` | `BG_HOME_FLOATING_CITY` |
| 主人公 | `HERO_` | `HERO_HUMAN_MALE_001` |
| ユニット | `UNIT_` | `UNIT_FIRE_SWORDSMAN_001` |
| 敵 | `ENEMY_` / `BOSS_` / `RAID_` | `BOSS_BLACK_CRYSTAL_DRAGON_001` |
| 属性アイコン | `ICON_ATTR_` | `ICON_ATTR_FIRE` |
| メニューアイコン | `ICON_MENU_` | `ICON_MENU_QUEST` |
| ボタン | `BTN_` | `BTN_GOLD_PRIMARY` |
| フレーム | `FRAME_` | `FRAME_UNIT_CARD_ARCANA` |
| エフェクト | `EFFECT_` | `EFFECT_SUMMON_MAGIC_CIRCLE` |
| アイテム | `ITEM_` | `ITEM_CURRENCY_DIAMOND` |
| 装備 | `EQUIP_` | `EQUIP_WEAPON_ARCANA_SWORD_001` |
| ポートレート | `PORTRAIT_` | `PORTRAIT_HERO_HUMAN_MALE_001` |
| カットイン | `CUTIN_` | `CUTIN_HERO_HUMAN_MALE_SKILL` |

---

## 推奨サイズ一覧

| 種別 | サイズ (px) | 形式 | 透過 |
|------|------------|------|------|
| 背景（横） | 1920×1080 | webp | ✗ |
| バトル背景 | 1920×1080 | webp | ✗ |
| シナリオ背景 | 1920×1080 | webp | ✗ |
| キャラクター立ち絵（カード） | 1024×1536 | webp lossless | ✅ |
| ポートレート | 512×512 | webp | ✅ or グラデ背景 |
| 顔アイコン | 256×256 | webp lossless | ✅ |
| カットイン | 1024×512 | webp lossless | ✅ |
| 通常敵 | 512×512 | webp lossless | ✅ |
| エリート敵 | 768×768 | webp lossless | ✅ |
| ボス（縦） | 1024×1536 | webp lossless | ✅ |
| レイドボス（横） | 1920×1080 | webp lossless | ✅ |
| ボタン（横長） | 512×128〜192 | webp lossless | ✅ |
| カードフレーム | 512×768 | webp lossless | ✅ |
| 属性アイコン | 256×256 | webp lossless | ✅ |
| メニューアイコン | 256×256 | webp lossless | ✅ |
| 通貨アイコン | 256×256 | webp lossless | ✅ |
| エフェクト（通常） | 512×512 | webp lossless | ✅ |
| エフェクト（大） | 1024×1024 | webp lossless | ✅ |
| アイテムアイコン | 256×256 | webp lossless | ✅ |
| 装備アイコン | 256〜512 px | webp lossless | ✅ |

---

## アセット追加フロー

```
① 画像を生成・用意する
   ↓
② ファイル名を命名規則に沿ってリネーム
   ↓
③ public/assets/images/{category}/{subcategory}/ に配置
   ↓
④ src/lib/assets/assetIds.ts に ID 定数を追加
   ↓
⑤ src/data/assets/*Assets.ts にエントリ追加
      priority: ???
      preload: ???
      size: { width: ???, height: ??? }
      status: 'adopted'  ← 必ず 'adopted' に変更
   ↓
⑥ npx tsc --noEmit で型チェック
   ↓
⑦ Hook で使用
      const { url } = useBackground(BgAssetId.XXX);
```

---

## アセット削除フロー

**削除は即時削除せず段階的に行う:**

```
① status: 'deprecated' に変更
   ↓ (1〜2 スプリント後)
② 使用箇所をすべて確認・除去
   ↓
③ *Assets.ts からエントリを削除
   ↓
④ assetIds.ts から ID 定数を削除
   ↓
⑤ public/assets/ からファイルを削除
   ↓
⑥ tsc + ビルドで確認
```

---

## 禁止事項

❌ **コンポーネント内でパスを直接書く**
```tsx
// BAD
<img src="/assets/images/backgrounds/home/bg_home_floating_city.webp" />
```

✅ **必ず ID + Hook 経由でアクセス**
```tsx
// GOOD
const { url } = useBackground(BgAssetId.HOME_FLOATING_CITY);
<img src={url} />
```

---

❌ **未登録ファイルを public に置くだけで終わらせる**  
→ 必ずマニフェストに登録する。登録なしは存在確認・プリロード対象外になる。

---

❌ **JPEG を透過が必要な素材に使う**  
→ 透過が必要な全素材は WebP lossless または PNG を使用。

---

## キャッシュ方針

| 状況 | アクション |
|------|-----------|
| 通常プレイ | キャッシュは解放しない（メモリ許容量内） |
| バトル終了後ホームに戻る | `evictExcept(home画面に必要なIDリスト)` |
| ガチャから退場 | `evictExcept(['BG_HOME_...', 'ICON_...'])` |
| アプリを長時間バックグラウンドにした後 | `evictAll()` + `preloadCritical()` |

---

## 将来対応: 高解像度版（Retina 対応）

現在は通常解像度のみ。将来的に:

```
public/assets/images/icons/attributes/icon_attr_fire.webp       → 通常
public/assets/images/icons/attributes/icon_attr_fire@2x.webp    → Retina
```

AssetLoader で `window.devicePixelRatio` を参照して切り替える予定。  
マニフェストに `retinaPath?: string` フィールドを追加することで対応。

---

## 将来対応: 季節イベント・スキン画像

```
public/assets/images/characters/units/skins/
  unit_fire_swordsman_001_xmas.webp    ← クリスマススキン
  unit_fire_swordsman_001_summer.webp  ← 夏イベントスキン
```

ID 命名:
```ts
UNIT_FIRE_SWORDSMAN_001_SKIN_XMAS = 'UNIT_FIRE_SWORDSMAN_001_SKIN_XMAS'
```

マニフェストに `skinOf?: string` フィールドでベースキャラとの関連を明示。

---

## 将来対応: 音声・BGM・SE

```
public/assets/sounds/
  bgm/bgm_title.mp3
  bgm/bgm_home.mp3
  bgm/bgm_battle_normal.mp3
  se/se_gacha_pull.mp3
  se/se_levelup.mp3
  voices/voice_hero_human_male_001_battle_01.mp3
```

`SoundAsset` 型は `assetTypes.ts` に定義済み。  
実装時は `AssetLoader` に音声ロード処理（`HTMLAudioElement`）を追加するだけで統合できる。
