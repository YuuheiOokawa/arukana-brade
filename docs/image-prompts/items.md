# アルカナブレイド — アイテム画像プロンプト集

最終更新: 2026-06-25  
対象フォルダ: `src/assets/images/items/`

---

## 共通スタイルタグ

```
item icon art, dark fantasy RPG mobile game, 2D illustration,
square format 1:1 ratio, transparent background, high contrast,
detailed item rendering, fantasy RPG item aesthetic,
readable at 128px and 64px, clean silhouette
```

## 共通ネガティブプロンプト

```
low quality, blurry, text, labels, watermark, logo, pixelated,
childish cartoon style, western cartoon, 3D render photorealistic,
background scenery, multiple items in one frame, characters
```

---

## 📐 サイズ

| 種別 | サイズ | 備考 |
|------|--------|------|
| 消耗品 | 256×256 | ストアで見やすいサイズ |
| 素材 | 256×256 | 強化素材 |
| 通貨 | 256×256 | コイン・ダイヤ |

---

## 🏆 MVP — 通貨アイテム

---

## item_currency_gold_coin

用途: ゴールドコイン  
保存先: `src/assets/images/items/currency/item_currency_gold_coin.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### English Prompt

Gold coin currency icon for dark fantasy mobile RPG. Single shiny gold coin slightly angled to show depth. Face of coin has an arcana seven-pointed star emblem. Coin edge with fine ridged detail. Bright gold with white highlight on top edge, darker gold shadow on bottom. Tiny sparkle reflections on surface. Transparent background. Square format, clean crisp edges. Fantasy RPG coin aesthetic.

### Negative Prompt

low quality, blurry, text, watermark, multiple coins stack, real-world coin design, 3D photorealistic, cartoonish, background

---

## item_currency_diamond

用途: ダイヤ（プレミアム通貨）  
保存先: `src/assets/images/items/currency/item_currency_diamond.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### 日本語プロンプト

ダイヤ（ゲームのプレミアム通貨）のアイコン。
菱形の透明感あるクリスタルダイヤモンド。青から水色へのグラデーション。
カット面が複数あり、内部に光の反射が美しく輝く。
周囲に小さな光の輝きが散らばる。透明背景。正方形フォーマット。

### English Prompt

Diamond premium currency icon for dark fantasy mobile RPG. Brilliant cut crystal diamond shape, blue to cyan gradient, highly transparent and refractive. Multiple facets catching light beautifully. Inner light reflections and rainbow caustic patterns. Tiny sparkle stars surrounding the diamond. Transparent background, square format, clean edges. Premium gemstone aesthetic.

### Negative Prompt

low quality, blurry, text, watermark, opaque diamond, red or warm colors, cartoonish flat shape, 3D photorealistic, background, multiple gems

---

## item_currency_summon_ticket

用途: 召喚チケット  
保存先: `src/assets/images/items/currency/item_currency_summon_ticket.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### English Prompt

Summon ticket item icon for dark fantasy mobile RPG gacha. Slightly angled rectangular ticket with ornate border. Deep purple and gold color scheme. Arcana circle magic emblem on the face. Gold perforated edge detail on one side (like a real ticket stub). Subtle magical shimmer on ticket surface. Transparent background, square format. Premium JRPG summon ticket aesthetic.

### Negative Prompt

low quality, blurry, text, watermark, modern movie ticket design, plain rectangle, 3D photorealistic, cartoonish, background

---

## 🏆 MVP — 消耗品アイテム

---

## item_consumable_hp_potion_s

用途: HPポーション（小）  
保存先: `src/assets/images/items/consumables/item_consumable_hp_potion_s.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### English Prompt

Small HP recovery potion item icon for dark fantasy mobile RPG. Glass bottle with cork stopper. Filled with glowing red liquid, inner light from the liquid. Bottle has decorative etched lines, fantasy RPG style potion bottle silhouette. Red glow emanating from liquid within. Bottle surface glass reflections. Transparent background, square format. Classic JRPG potion design.

### Negative Prompt

low quality, blurry, text, watermark, modern medicine bottle, flat design, 3D photorealistic, cartoonish, background

---

## item_consumable_stamina_orb

用途: スタミナ回復オーブ  
保存先: `src/assets/images/items/consumables/item_consumable_stamina_orb.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### English Prompt

Stamina recovery orb item icon for dark fantasy mobile RPG. Small glowing green spherical orb with lightning-like energy patterns inside. Green to yellow-green gradient glow. Energy crackling within the sphere. Glass surface with reflections. Transparent background, square format. Energy/action recovery aesthetic.

### Negative Prompt

low quality, blurry, text, watermark, red color, flat circle, 3D photorealistic, cartoonish, background

---

## 📋 強化素材（Ver1.0）

| ファイル名 | 名前 | 色テーマ |
|-----------|------|---------|
| item_material_magic_crystal_s | 魔力水晶（小） | 青紫 |
| item_material_magic_crystal_m | 魔力水晶（中） | 青紫（大きめ） |
| item_material_dragon_scale | ドラゴンの鱗 | 黒緑 |
| item_material_angel_feather | 天使の羽 | 白金 |
| item_material_dark_core | 闇のコア | 黒紫 |
| item_material_flame_essence | 炎のエッセンス | 赤オレンジ |
| item_material_awakening_stone | 覚醒の石 | 虹色 |

---

## 📋 命名規則

```
item_{category}_{name}_{size_variant}.webp

category: currency / consumables / materials
size_variant: s / m / l（サイズ区別がある場合）
```
