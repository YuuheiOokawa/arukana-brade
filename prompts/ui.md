# UIプロンプト

対象: ボタン・フレーム・ゲージ・カード・ダイアログ  
合計目標: 約310枚

---

## デザインコンセプト

- **テーマ**: ダークファンタジー × 魔法宝石UI
- **ベースカラー**: 深紫 `#1a0a2e`
- **メインカラー**: 紫 `#7c3aed`
- **ゴールド**: `#f0c040`
- **テキスト**: 白 `#ffffff` / 金 `#f0c040`
- **素材感**: 暗い宝石・金属・魔法陣・ルーン

---

## ボタン

### ui_button_primary_normal.webp
**ファイルパス**: `public/assets/images/ui/buttons/ui_button_primary_normal.webp`
**解像度**: 400×80
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
fantasy RPG game primary button, dark purple rounded rectangle,
gold border with rune engravings at corners,
subtle purple inner glow, magical gem center accent,
dark fantasy game UI element, horizontal button shape,
400x80 pixels, no text, clean design, mobile game button
```

---

### ui_button_primary_pressed.webp
**ファイルパス**: `public/assets/images/ui/buttons/ui_button_primary_pressed.webp`
**解像度**: 400×80
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
fantasy RPG game pressed button state, dark purple rounded rectangle,
slightly darker with inner shadow, gold border dimmed,
pressed/active state feeling, darker inner glow,
dark fantasy game UI element, 400x80 pixels, depressed look
```

---

### ui_button_danger_normal.webp (赤・危険)
### ui_button_secondary_normal.webp (グレー・サブ)
### ui_button_gacha_normal.webp (ゴールド・ガチャ専用)

---

## カードフレーム

### ui_frame_card_star1.webp
**ファイルパス**: `public/assets/images/ui/cards/ui_frame_card_star1.webp`
**解像度**: 200×280
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
1-star rarity card frame, simple light blue border,
rounded rectangle with subtle sparkle corners,
clean minimal dark background, light blue glow edge,
anime mobile game card frame, 200x280 portrait,
transparent center area for character art
```

---

### ui_frame_card_star5.webp
**ファイルパス**: `public/assets/images/ui/cards/ui_frame_card_star5.webp`
**解像度**: 200×280
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
5-star SSR rarity card frame, elaborate pink iridescent border,
flower petal ornaments at corners, gem decorations,
shimmering pearl effect on frame, premium feeling,
dark background with pink aura glow,
anime mobile game SSR card frame, 200x280 portrait,
transparent center, highly ornate design
```

---

### ui_frame_card_crown.webp
**ファイルパス**: `public/assets/images/ui/cards/ui_frame_card_crown.webp`
**解像度**: 200×280
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
CROWN ultimate rarity card frame, rainbow prismatic border,
crown motif at top center, all-element gem decorations,
holographic rainbow shimmer effect, most premium card design,
transparent center for character art,
anime mobile game ultimate card frame, 200x280,
spectacularly ornate, divine transcendent quality
```

---

## パネル・ダイアログ

### ui_panel_info.webp
**ファイルパス**: `public/assets/images/ui/panels/ui_panel_info.webp`
**解像度**: 700×400
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
dark fantasy info panel background, dark purple semi-transparent rectangle,
gold ornate border with corner rune decorations,
subtle magical texture inside panel, inner shadow and glow,
anime JRPG game UI panel, 700x400 landscape,
no text area, dark purple atmosphere, premium design
```

---

### ui_dialog_default.webp
**ファイルパス**: `public/assets/images/ui/dialogs/ui_dialog_default.webp`
**解像度**: 800×500
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
fantasy RPG dialog box, dark purple rounded panel,
elaborate gold border with corner gem decorations,
magic rune pattern in background texture,
inner gradient from dark purple to near black,
anime JRPG UI dialog window, 800x500,
premium polished design, magical atmosphere
```

---

## HPゲージ・バー系

### ui_gauge_hp_base.webp
**ファイルパス**: `public/assets/images/ui/gauges/ui_gauge_hp_base.webp`
**解像度**: 400×30
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
HP health bar base track, dark rounded rectangle,
dark gray with slight metallic sheen, inner shadow,
game health bar background track, 400x30 pixels,
anime RPG battle UI element, no fill, empty bar base
```

---

### ui_gauge_hp_fill.webp
**ファイルパス**: `public/assets/images/ui/gauges/ui_gauge_hp_fill.webp`
**解像度**: 400×30
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
HP health bar fill, vibrant red gradient from orange-red to deep red,
glowing red edge, slight pulse glow effect,
game health bar fill texture, 400x30 pixels,
anime RPG battle UI element, bright red energy bar
```

---

| ゲージ種 | ファイル名 | 色 | 優先度 |
|---------|-----------|-----|--------|
| HP | `ui_gauge_hp_fill.webp` | 赤 | MVP |
| MP（マジック） | `ui_gauge_mp_fill.webp` | 青 | MVP |
| BB（ブレイブバースト） | `ui_gauge_bb_fill.webp` | 紫・金 | Ver1.0 |
| EXP | `ui_gauge_exp_fill.webp` | 緑 | Ver1.0 |
| スタミナ | `ui_gauge_stamina_fill.webp` | 黄緑 | Ver1.0 |

---

## テキストボックス（ストーリー用）

### ui_textbox_story.webp
**ファイルパス**: `public/assets/images/ui/dialogs/ui_textbox_story.webp`
**解像度**: 1080×300
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
story dialogue text box, dark semi-transparent panel at bottom,
wide horizontal format 1080x300, subtle dark purple texture,
thin gold border on top edge only, no text,
visual novel JRPG dialogue box, anime game UI,
premium dark fantasy style, fits character name above
```

---

## ナビゲーションアイコン（48×48）

| アイコン | ファイル名 | シンボル |
|---------|-----------|---------|
| ホーム | `ui_nav_home.webp` | 家 |
| クエスト | `ui_nav_quest.webp` | 地図・剣 |
| ユニット | `ui_nav_units.webp` | 人物 |
| 召喚 | `ui_nav_summon.webp` | 星・光 |
| プロフィール | `ui_nav_profile.webp` | 顔・勲章 |
| ショップ | `ui_nav_shop.webp` | コイン |
| ギルド | `ui_nav_guild.webp` | 旗 |
| アリーナ | `ui_nav_arena.webp` | トロフィー |

#### Positive Prompt テンプレート
```
[NAV_NAME] navigation icon, [SYMBOL] symbol,
fantasy RPG game tab icon, purple gold color scheme,
48x48 pixels, clean bold design, dark background,
anime JRPG mobile game bottom navigation icon,
glowing edge when selected state
```

---

## バッジ・状態異常アイコン

| 状態 | 色 | シンボル |
|-----|-----|---------|
| 毒 | 緑紫 | 骸骨・しずく |
| 炎上 | 赤橙 | 炎 |
| 凍結 | 青白 | 雪片 |
| 麻痺 | 黄 | 稲妻 |
| 睡眠 | 紫 | ZZZ・月 |
| 混乱 | ピンク | 渦巻き |
| バフ（攻撃↑） | 橙 | 上矢印・剣 |
| バフ（防御↑） | 青 | 上矢印・盾 |
| デバフ（攻撃↓） | 灰 | 下矢印・剣 |
