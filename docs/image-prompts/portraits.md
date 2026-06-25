# アルカナブレイド — ポートレート・バスト画像プロンプト集

最終更新: 2026-06-25  
対象フォルダ: `src/assets/images/portraits/`

---

## 概要

ポートレートはチャット・ホーム画面・プロフィール等で使う**上半身クローズアップ画像**です。  
キャラクターカード（全身）とは別に、会話シーンや顔アイコンとして使用します。

---

## 共通スタイルタグ

```
bust portrait, dark fantasy JRPG character portrait, high quality digital illustration,
anime style, face and upper body focus, detailed expression, soft focus background,
professional mobile game character portrait, 2D illustration
```

## 共通ネガティブプロンプト

```
low quality, blurry, distorted anatomy, extra fingers, bad hands, text, watermark,
logo, cropped at neck, full body visible, pixelated, childish, cheap mobile game style,
3D render, photorealistic, western cartoon style, ugly, deformed, extra limbs
```

---

## 📐 サイズ

| 用途 | サイズ | 備考 |
|------|--------|------|
| ホームポートレート | 512×512 | 胸上 |
| ストーリー会話 | 1024×1024 | 胸〜肩上 |
| プロフィールサムネイル | 256×256 | 顔アイコン |

---

## 🏆 MVP — 主人公ポートレート

---

## portrait_hero_human_male_001

用途: 人族男主人公 ポートレート  
保存先: `src/assets/images/portraits/portrait_hero_human_male_001.webp`  
推奨サイズ: 512×512  
透過: 不要（グラデーション背景可）  
優先度: MVP  
ステータス: [ ] 未生成

### 日本語プロンプト

人族男性主人公の上半身ポートレート。
銀髪または黒髪の20代の凛々しい青年。エメラルドグリーンの瞳。
青紫の鎧の胸当てと肩当ての一部が見え、アルカナの紋章が胸元に輝く。
表情は自信にあふれ、どこか遠くを見据えるような目線。
背景は深い紫と黒のグラデーション（文字を重ねにくい背景は避ける）。
ソシャゲのホーム画面のプロフィールポートレートとして映える構図。

### English Prompt

Human male protagonist bust portrait for dark fantasy mobile JRPG home screen. Upper body (chest and above). Dignified young man in early 20s, silver or black hair, emerald green eyes. Dark blue-violet armor chest plate and pauldron partially visible, glowing arcana emblem on chest. Confident expression with a distant heroic gaze. Background: deep purple to black soft gradient. Suitable for profile or home screen portrait. Anime JRPG style, high quality.

### Negative Prompt

low quality, blurry, distorted anatomy, extra fingers, bad hands, text, watermark, pixelated, childish, 3D render, western cartoon, ugly, bad anatomy, full body showing, background too busy

---

## portrait_hero_goddess_female_001

用途: 女神族女主人公 ポートレート  
保存先: `src/assets/images/portraits/portrait_hero_goddess_female_001.webp`  
推奨サイズ: 512×512  
透過: 不要  
優先度: MVP  
ステータス: [ ] 未生成

### English Prompt

Goddess race female protagonist bust portrait for dark fantasy mobile JRPG. Upper body. Serene and beautiful young goddess woman, golden or silver-white hair, radiant golden eyes. White and gold sacred armor visible on shoulders. Soft golden halo barely visible behind head. Gentle divine smile, holy presence. Soft white-gold gradient background with subtle light rays. Premium JRPG home screen portrait quality.

### Negative Prompt

low quality, blurry, distorted anatomy, extra fingers, text, watermark, pixelated, childish, 3D render, western cartoon, bad anatomy, dark evil appearance, full body

---

## 📋 NPCポートレート（Ver1.0）

| ファイル名 | キャラ | 役割 |
|-----------|--------|------|
| portrait_npc_guild_master | ギルドマスター（老人男性） | クエスト窓口 |
| portrait_npc_shop_keeper | 商人（女性） | ショップ |
| portrait_npc_blacksmith | 鍛冶師（男性） | 装備強化 |
| portrait_npc_sage | 賢者（中性的な老人） | ストーリー案内 |

---

## 📋 命名規則

```
portrait_{category}_{race/role}_{gender}_{variant}.webp

category: hero / npc / unit
race: human / demon / goddess / elf / etc.
gender: male / female
variant: 001, 002 ... または happy / serious / battle など表情バリエーション
```
