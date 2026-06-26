# ボスプロンプト（詳細版）

対象: 通常ボス50体 + レイドボス10体  
合計目標: 約240枚

---

## 共通スタイル

```
anime JRPG boss character, dark fantasy,
massive imposing design, ultra detailed,
transparent background, full body or dramatic bust,
overwhelming power and malevolence,
epic villain design, high quality game art
```

---

## 章ボス一覧

| 章 | ボス名 | 種族 | 属性 | テーマ |
|----|--------|------|------|--------|
| 1 | ゴブリンキング | ゴブリン | 土 | 最初の壁・古城の支配者 |
| 2 | 堕ちた騎士長 | 人間（不死） | 闇 | 裏切り者・かつての英雄 |
| 3 | 海竜アクアリス | 竜族 | 水 | 海域の守護者・狂暴化 |
| 4 | 炎の巨人イグニファス | 巨人族 | 火 | 火山の番人 |
| 5 | 風の精霊王ゼファロス | 精霊 | 風 | 堕落した精霊の王 |
| 6 | 雷皇ヴォルティカ | 天使（堕天使） | 雷 | 電撃の支配者 |
| 7 | 闇の巫女シャドウレイン | 人間（魔女） | 闇 | 知性的な悪役 |
| 8 | 光の番人ルクスエルト | 天使 | 光 | 試練を与える者 |
| 9 | 大地の守護竜ゲイア | 竜族 | 土 | 大地の怒り |
| 10 | 魔王ダークネスロード | 悪魔王 | 闇/全属性 | 最終ボス |

---

## 第1章ボス

### boss_goblin_king_sprite.webp
**ファイルパス**: `public/assets/images/enemies/boss/boss_goblin_king_sprite.webp`
**解像度**: 512×512
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
goblin king boss enemy, oversized muscular green goblin,
crude iron crown, massive spiked club weapon,
patchwork heavy armor from stolen pieces,
scarred battle-worn body, menacing grin showing sharp teeth,
elevated on stone throne background hint,
anime JRPG chapter 1 boss sprite, dark fantasy,
transparent background, full body, ultra detailed,
512x512, imposing yet beatable for chapter 1
```

---

### boss_goblin_king_cutin.webp
**ファイルパス**: `public/assets/images/enemies/boss/boss_goblin_king_cutin.webp`
**解像度**: 1080×400
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
goblin king boss reveal horizontal banner,
close-up menacing face, wide evil grin, iron crown,
red beady eyes gleaming, dramatic low angle,
dark stone throne room in background blur,
anime JRPG boss introduction cutin, 1080x400 wide,
dark green and iron color scheme, threatening atmosphere
```

---

## 第2章ボス

### boss_fallen_knight_sprite.webp
**ファイルパス**: `public/assets/images/enemies/boss/boss_fallen_knight_sprite.webp`
**解像度**: 512×512
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
fallen knight dark knight boss, tragic former hero now corrupted,
once-noble full plate armor now blackened and cracked,
purple dark energy seeping from armor seams, visor cracked revealing purple eye,
elegant but tainted longsword, conflicted but dangerous stance,
dark magic aura around entire body,
anime JRPG chapter 2 boss sprite, dark fantasy undead warrior,
transparent background, 512x512, ultra detailed design,
black purple silver color scheme, tragic villain aesthetic
```

---

## 最終ボス

### boss_darkness_lord_sprite.webp
**ファイルパス**: `public/assets/images/enemies/boss/boss_darkness_lord_sprite.webp`
**解像度**: 1024×1024
**ステータス**: [ ] 未生成
**優先度**: Ver2.0

#### Positive Prompt
```
demon dark lord final boss, towering humanoid figure,
enormous black wings spanning full width, massive dark horns,
elaborate corrupted armor in black purple gold,
six glowing eyes in different elemental colors,
all 7 elements corrupted and swirling around him,
dark energy crown with cracked reality effect,
world-ending aura, absolute evil presence,
anime JRPG ultimate final boss sprite, dark fantasy,
transparent background, ultra massive full body,
1024x1024, most detailed and epic design in the game,
deep purple black with all-element accents
```

---

## レイドボス（マルチプレイ専用）

### boss_raid_ancient_dragon.webp
**ファイルパス**: `public/assets/images/enemies/raid/boss_raid_ancient_dragon.webp`
**解像度**: 1024×1024
**ステータス**: [ ] 未生成
**優先度**: Ver3.0

#### Positive Prompt
```
ancient colossal dragon raid boss, immense serpentine dragon,
scales encrusted with ancient magic runes and battle damage,
multiple colored energy auras (all 7 elements) corrupting its body,
enormous wingspan filling frame, multiple heads optional,
ancient beyond time, damaged yet overwhelming power,
buildings could fit in one claw,
anime JRPG raid boss artwork, dark fantasy,
transparent background, 1024x1024, overwhelmingly detailed,
ancient stone and corrupted rainbow element color scheme
```

---

## ボス演出フレーム

### boss_intro_frame_normal.webp（通常ボス登場枠）
**ファイルパス**: `public/assets/images/effects/cutin/boss_intro_frame_normal.webp`
**解像度**: 1080×1920
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
boss introduction screen frame, dark dramatic background,
red warning border glow on screen edge, dark corner vignettes,
enemy boss encounter atmosphere, ominous red signal,
empty center for boss sprite, anime JRPG boss fight start screen,
1080x1920 portrait, intense threatening mood
```

---

## ボスデザイン指針

| ボスランク | サイズ | 解像度 | 素材種 |
|-----------|--------|--------|--------|
| ミニボス | 普通〜大 | 512×512 | スプライト |
| 章ボス | 大 | 512×512 | スプライト + カットイン |
| 最終ボス | 超大 | 1024×1024 | スプライト + カットイン + 登場演出 |
| レイドボス | 画面いっぱい | 1024×1024 | スプライト + 登場演出 |
