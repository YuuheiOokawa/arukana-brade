# アルカナブレイド — カットイン画像プロンプト集

最終更新: 2026-06-25  
対象フォルダ: `src/assets/images/cutins/`

---

## 概要

カットインは**スキル発動・必殺技演出**で画面を横切るキャラクターの顔〜上半身アップ画像です。  
ゲームの盛り上がりを演出する重要なビジュアルです。

---

## 共通スタイルタグ

```
cut-in art, dark fantasy JRPG battle cut-in, high quality digital illustration,
anime style, extreme close-up face or upper body, intense battle expression,
dynamic angle, speed lines effect, diagonal composition,
professional mobile game battle VFX art
```

## 共通ネガティブプロンプト

```
low quality, blurry, distorted anatomy, bad hands, text, watermark, logo,
cropped forehead or chin, calm relaxed expression, full body pose, background scenery,
pixelated, childish, 3D render, western cartoon style, nsfw, symmetric composition
```

---

## 📐 サイズ

| 用途 | サイズ | 備考 |
|------|--------|------|
| 通常スキルカットイン | 1024×512 | 横長、画面を帯状に横断 |
| 必殺技カットイン | 1024×512 | 横長、より迫力重視 |

---

## 🏆 MVP — 主人公カットイン

---

## cutin_hero_human_male_skill

用途: 人族男主人公 スキルカットイン  
保存先: `src/assets/images/cutins/cutin_hero_human_male_skill.webp`  
推奨サイズ: 1024×512  
透過: 推奨  
優先度: MVP  
ステータス: [ ] 未生成

### 日本語プロンプト

人族男性主人公のスキル発動カットイン素材。
右側から向かって左側を睨むような極端な斜めアングルの顔〜肩アップ。
銀髪が風になびき、エメラルドの瞳が鋭く輝く。剣を構えた姿。
速度線が後方に走り、青紫のエネルギーがあたりに飛び散る。
表情は戦闘の緊張感と自信が混在した、かっこいいバトル表情。
横長フォーマット、透明背景。

### English Prompt

Human male protagonist skill activation cut-in art for dark fantasy mobile JRPG battle. Horizontal wide format. Extreme dynamic angle, character viewed from right side glaring toward left. Silver hair flowing back, sharp emerald eyes glowing. Partial sword grip and shoulder armor visible. Blue-violet energy sparks scattering around. Speed lines radiating from behind. Intense battle expression: fierce, confident, cool. Transparent background, horizontal format. Anime JRPG battle cut-in style.

### Negative Prompt

low quality, blurry, distorted anatomy, text, watermark, calm relaxed expression, symmetric front-facing, full body, background scenery, 3D render, childish, pixelated

---

## cutin_hero_human_male_ultimate

用途: 人族男主人公 必殺技カットイン  
保存先: `src/assets/images/cutins/cutin_hero_human_male_ultimate.webp`  
推奨サイズ: 1024×512  
透過: 推奨  
優先度: MVP  
ステータス: [ ] 未生成

### 日本語プロンプト

人族男性主人公の必殺技カットイン。スキルカットインよりさらに迫力を増した構図。
右下から左上を見上げるような見上げアングル。顔のアップ、目に力が宿る。
アルカナの紋章が目の周りや額に浮かび上がる。
全身に青紫と金の極光（オーロラ）のようなエネルギーが迸る。
圧倒的な存在感と力の解放感。

### English Prompt

Human male protagonist ultimate skill cut-in art for dark fantasy mobile JRPG battle. More dramatic and powerful than normal skill cut-in. Low-angle view looking up from right-bottom to upper-left. Extreme face close-up, glowing intense eyes with full power unleashed. Arcana seven-pointed star emblem appearing on forehead and around eyes. Blue-violet and gold aurora-like energy erupting from all directions. Overwhelming presence, peak power release moment. Transparent background, horizontal format. Maximum dramatic impact.

### Negative Prompt

low quality, blurry, distorted anatomy, text, watermark, calm expression, weak energy level, symmetric pose, full body, background scenery, 3D render, childish

---

## 📋 全ユニット分カットインテンプレート（Ver1.0+）

各ユニット・ヒーローについて以下の2種類を用意する：
- `cutin_{id}_skill.webp` — スキルカットイン
- `cutin_{id}_ultimate.webp` — 必殺技カットイン

| ファイルID | キャラ | 優先度 |
|-----------|--------|--------|
| hero_human_male | 人族男主人公 | MVP |
| hero_human_female | 人族女主人公 | MVP |
| hero_demon_male | 魔人族男主人公 | Ver1.0 |
| hero_demon_female | 魔人族女主人公 | Ver1.0 |
| hero_goddess_female | 女神族女主人公 | Ver1.0 |
| unit_fire_swordsman_001 | 火剣士 | Ver1.0 |
| unit_water_mage_001 | 水魔導師 | Ver1.0 |
| unit_dark_blade_001 | 闇魔剣士 | Ver1.0 |

---

## 📋 命名規則

```
cutin_{character_id}_{type}.webp

type: skill / ultimate
character_id: hero_human_male / unit_fire_swordsman_001 など
```
