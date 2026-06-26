# アルカナブレイド 画像生成プロンプト設計ガイド

最終更新: 2026-06-25

---

## 世界観・アートスタイル

アルカナブレイドは**ダークファンタジー × 剣と魔法**の世界観です。

### ゲームの雰囲気
- 深みのある暗め配色（紫・金・黒が基調）
- 魔法陣・ルーン文字の装飾
- 神秘的・荘厳な雰囲気
- アニメ調イラスト（日本のソシャゲ風）

---

## 共通スタイルプロンプト

### ✅ 必ず付与するタグ（Positive）

```
anime style, JRPG mobile game art, dark fantasy,
high quality digital illustration, detailed,
vibrant colors with dark atmosphere,
dramatic lighting, magical aura,
2D art, professional game asset
```

### ❌ 必ず除外するタグ（Negative）

```
3D render, photorealistic, western cartoon style,
blurry, low quality, watermark, signature, text, logo,
ugly, deformed, extra limbs, bad anatomy,
nsfw, inappropriate content
```

---

## カラーパレット（ゲーム全体で統一）

| 用途 | カラーコード | 使用箇所 |
|------|------------|---------|
| メインパープル | `#7c3aed` | UI・魔法・テーマカラー |
| ゴールド | `#f0c040` | 高レアリティ・重要UI |
| ダークベース | `#08081a` | 背景ベース |
| ネオンパープル | `#c4b5fd` | グロー効果 |
| 炎レッド | `#ef4444` | 火属性 |
| 水ブルー | `#3b82f6` | 水属性 |
| 雷イエロー | `#eab308` | 雷属性 |
| 風グリーン | `#10b981` | 風属性 |
| 光ホワイト | `#fef9c3` | 光属性 |
| 闇パープル | `#6b21a8` | 闇属性 |
| 土ブラウン | `#92400e` | 土属性 |

---

## 属性別スタイル

| 属性 | 英語 | 色 | 雰囲気 |
|------|------|-----|--------|
| 火 | fire | 赤・オレンジ | 情熱的・攻撃的・炎が揺れる |
| 水 | water | 青・水色 | 清潔・流動的・水流・波 |
| 雷 | thunder | 黄・白 | 鋭利・スピード・稲妻 |
| 風 | wind | 緑・薄青 | 爽快・自由・空気の流れ |
| 光 | light | 金・白 | 神聖・清純・後光 |
| 闇 | dark | 紫・黒 | 神秘・禁忌・暗黒エネルギー |
| 土 | earth | 茶・緑 | 重厚・安定・大地の力 |

---

## レアリティ別スタイル

| レアリティ | 色 | 演出 |
|-----------|-----|------|
| ★1 | 水色 `#7bc8ff` | シンプル・清潔感 |
| ★2 | 紫 `#b773ff` | 魔法的 |
| ★3 | 金 `#ffe48d` | 輝き・格調 |
| ★4 | オレンジ `#ff9d47` | 力強さ |
| ★5 | ピンク `#ff6b9d` | 華やか・特別感 |
| ★6 | シアン `#00f5ff` | 神秘・超越 |
| ★7 | 赤 `#ff4466` | 覇気・圧倒的強さ |
| ★👑 | 虹 `#fff8e0` | 最高・至高・全属性 |

---

## ファイル管理ルール

1. 各mdファイルは**カテゴリ別**に管理
2. プロンプトには必ず**ファイル名**を記載
3. 生成後は**実際のファイルパス**を追記
4. **品質評価**（★1〜5）を記録
5. **再生成が必要**な場合はフラグを立てる

### テンプレート形式

```markdown
## {ファイル名}

**ファイルパス**: `public/assets/images/{path}/{filename}.webp`
**ステータス**: [ ] 未生成 / [ ] 生成済み / [ ] 採用 / [ ] 再生成
**品質**: ★★★★☆
**解像度**: 128×128
**優先度**: MVP / Ver1.0 / Ver2.0

### Positive Prompt
{プロンプト}

### Negative Prompt
{ネガティブプロンプト}

### 備考
{特記事項}
```

---

## プロンプトファイル一覧

| ファイル | 内容 | 枚数目安 |
|---------|------|---------|
| [characters.md](characters.md) | ユニット全300体 | 1,650枚 |
| [heroes.md](heroes.md) | 主人公10種 | 70枚 |
| [enemies.md](enemies.md) | 敵200体 | 400枚 |
| [bosses.md](bosses.md) | ボス60体 | 240枚 |
| [backgrounds.md](backgrounds.md) | 背景全種 | 400枚 |
| [ui.md](ui.md) | UI素材 | 310枚 |
| [icons.md](icons.md) | アイコン全種 | 1,504枚 |
| [effects.md](effects.md) | エフェクト | 158枚 |
| [items.md](items.md) | アイテム200種 | 200枚 |
| [equipment.md](equipment.md) | 装備200種 | 400枚 |
| [story_cg.md](story_cg.md) | ストーリーCG | 300枚 |
