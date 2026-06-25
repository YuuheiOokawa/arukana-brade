# アルカナブレイド — 装備品画像プロンプト集

最終更新: 2026-06-25  
対象フォルダ: `src/assets/images/equipment/`

---

## 共通スタイルタグ

```
equipment icon art, dark fantasy RPG mobile game, 2D illustration,
square format 1:1 ratio, transparent background,
detailed weapon/armor rendering, fantasy RPG equipment aesthetic,
readable at 128px, clean silhouette, dramatic angle display
```

## 共通ネガティブプロンプト

```
low quality, blurry, text, watermark, logo, pixelated,
childish cartoon style, 3D photorealistic, background scenery,
characters holding equipment, multiple items in one frame
```

---

## 📐 サイズ

| 種別 | サイズ | 備考 |
|------|--------|------|
| 武器 | 256×256〜512×512 | 斜め角度推奨 |
| 防具 | 256×256 | 正面または斜め |
| アクセサリ | 256×256 | 正面 |

---

## 🏆 MVP — 武器

---

## equip_weapon_arcana_sword_001

用途: アルカナの剣（主人公初期装備）  
保存先: `src/assets/images/equipment/weapons/equip_weapon_arcana_sword_001.webp`  
推奨サイズ: 512×512  
透過: 必須  
優先度: MVP  
ステータス: [ ] 未生成

### 日本語プロンプト

「アルカナの剣」主人公の初期装備の長剣。
漆黒の刃に青紫の魔力が走るデザイン。刀身の中央に七芒星の紋章が光る。
金色の鍔（ガード）と柄頭が高級感を演出。グリップには革巻き。
全体を45度の角度で表示。魔力のオーラが刃の周囲に薄くまとわりつく。
透明背景、正方形フォーマット。

### English Prompt

Arcana Sword initial protagonist weapon icon for dark fantasy mobile RPG. Elegant longsword displayed at 45-degree angle. Jet black blade with blue-violet magical energy flowing along the edge. Seven-pointed arcana emblem glowing on center of blade. Gold cross-guard and pommel adding luxury feel. Leather-wrapped grip. Subtle magical aura around the blade. Transparent background, square format. Detailed fantasy RPG weapon icon.

### Negative Prompt

low quality, blurry, text, watermark, background, character holding sword, cartoon style, 3D photorealistic, modern weapon design, multiple swords

---

## equip_weapon_dark_blade_001

用途: 闇の魔剣  
保存先: `src/assets/images/equipment/weapons/equip_weapon_dark_blade_001.webp`  
推奨サイズ: 512×512  
透過: 必須  
優先度: Ver1.0  
ステータス: [ ] 未生成

### English Prompt

Dark Magic Sword weapon icon for dark fantasy mobile RPG. Curved black blade with dark purple shadow energy coursing through it. Ominous red-purple runes etched along blade. Dark metal cross-guard with skull or void eye motif. Black wrapped grip with dark crystal pommel. Shadow wisps emanating from the blade. 45-degree angle display. Transparent background, square format.

### Negative Prompt

low quality, blurry, text, watermark, background, character, cartoon style, 3D photorealistic, bright happy colors

---

## equip_weapon_fire_staff_001

用途: 炎の魔杖  
保存先: `src/assets/images/equipment/weapons/equip_weapon_fire_staff_001.webp`  
推奨サイズ: 512×512  
透過: 必須  
優先度: Ver1.0  
ステータス: [ ] 未生成

### English Prompt

Fire Magic Staff weapon icon for dark fantasy mobile RPG. Tall wooden staff with ornate red-gold top piece holding a flaming gem orb. Fire carved wood with ember patterns. Top gem: translucent red-orange with inner fire glow. Flame wisps licking upward from gem. Small fire runes along staff length. Slight diagonal display angle. Transparent background, square format.

### Negative Prompt

low quality, blurry, text, watermark, background, character, cartoon style, 3D photorealistic, cold blue tones

---

## 🏆 MVP — 防具

---

## equip_armor_arcana_plate_001

用途: アルカナ鎧（主人公初期胴防具）  
保存先: `src/assets/images/equipment/armor/equip_armor_arcana_plate_001.webp`  
推奨サイズ: 256×256  
透過: 必須  
優先度: Ver1.0  
ステータス: [ ] 未生成

### English Prompt

Arcana plate armor chestpiece icon for dark fantasy mobile RPG. Front-facing view of a breastplate. Dark blue-violet metal with gold trim around edges. Arcana star emblem engraved in center, glowing faintly. Pauldron attachment points visible. High-quality craftsmanship feel. Transparent background, square format. Fantasy RPG armor icon.

### Negative Prompt

low quality, blurry, text, watermark, background, character wearing armor, cartoon style, 3D photorealistic, modern military design

---

## 📋 装備品命名規則

```
equip_{slot}_{element/theme}_{name}_{tier}.webp

slot: weapon / armor / helmet / gloves / boots / accessory / ring / necklace
element/theme: fire / water / thunder / wind / light / dark / arcana / none
tier: 001 / 002 ... (強化段階または個別品)
```

---

## 📋 装備品追加予定リスト（Ver1.0）

| カテゴリ | 名前 | 属性 |
|---------|------|------|
| 武器 | 聖剣エクスリス | 光 |
| 武器 | 雷槍 ジュピター | 雷 |
| 武器 | 風の弓 シルフィード | 風 |
| 防具 | 水の魔装 アクア | 水 |
| 防具 | 神聖の鎧 ホーリープレート | 光 |
| アクセ | 力のリング | 無 |
| アクセ | 魔力のペンダント | 無 |
| アクセ | スピードのブーツ | 風 |
