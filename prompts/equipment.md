# 装備プロンプト

対象: 武器・防具・アクセサリー・アーティファクト 最終200種  
合計目標: 約400枚（アイコン200 + 詳細イラスト200）

---

## 共通スタイル

```
fantasy RPG equipment icon, detailed illustration,
128x128 pixels, dark background, anime game art style,
magical glow effect, rune engravings, detailed metalwork,
premium game asset quality
```

---

## 武器カテゴリ

### 剣（ソード）

#### equip_sword_arcana_001.webp（入手条件: ストーリー報酬）
**ファイルパス**: `public/assets/images/icons/equipment/weapons/equip_sword_arcana_001.webp`
**ステータス**: [ ] 未生成
**優先度**: MVP
**レアリティ**: ★3

#### Positive Prompt
```
fantasy longsword icon, elegant silver blade with purple rune inscriptions,
ornate golden crossguard, purple gem in hilt,
magical purple aura around blade, arcana symbol on blade surface,
RPG weapon icon style, 128x128 pixels, diagonal display,
dark background, anime game equipment art
```

---

#### equip_sword_fire_legend_001.webp（伝説武器）
**ファイルパス**: `public/assets/images/icons/equipment/weapons/equip_sword_fire_legend_001.webp`
**ステータス**: [ ] 未生成
**優先度**: Ver2.0
**レアリティ**: ★7

#### Positive Prompt
```
legendary fire greatsword icon, enormous red-black blade,
roaring flame motif carved into metal, ancient runes glowing orange,
dramatic fire magic radiating, golden crossguard with fire gem,
ultimate legendary weapon, RPG game icon 128x128,
intense fire aura, epic legendary quality
```

---

### 属性別 武器プロンプトタグ

| 属性 | 武器外観 | 追加タグ |
|------|---------|---------|
| 火 | 炎の刃・赤黒 | `flame blade, ember glow, volcanic metal` |
| 水 | 流水の刃・青銀 | `water crystal blade, wave pattern, icy shimmer` |
| 雷 | 稲妻の刃・白黄 | `lightning edge, electric crackle, charged metal` |
| 風 | 風紋の刃・緑白 | `wind current engravings, feather motif, light blade` |
| 光 | 聖光の刃・白金 | `holy light blade, divine radiance, angel wing crossguard` |
| 闇 | 闇の刃・紫黒 | `shadow blade, dark mist, cursed runes, void energy` |
| 土 | 大地の刃・茶緑 | `earth crystal embedded, stone texture, ancient carved` |

---

## 武器種別 プロンプトテンプレート

| 武器種 | 英語名 | 特徴タグ |
|--------|--------|---------|
| 剣 | longsword | `single-edged, crossguard, elegant` |
| 大剣 | greatsword | `massive, two-handed, heavy, powerful` |
| 短剣 | dagger | `small, curved, fast, dual-wield` |
| 槍 | lance/spear | `long pole, pointed tip, elegant reach` |
| 斧 | battle axe | `heavy blade, brutal, large head` |
| 弓 | bow | `curved wood/crystal, string drawn, agile` |
| 杖 | magic staff | `ornate top crystal, rune carvings, mystic` |
| 魔導書 | grimoire | `leather bound, glowing pages, arcane symbols` |
| 拳 | knuckle/gauntlet | `metal fist, rune knuckles, impact design` |
| 扇 | war fan | `elegant blades, decorative, exotic` |

---

## 防具カテゴリ

### 鎧（チェストピース）

#### equip_armor_hero_starter.webp
**ファイルパス**: `public/assets/images/icons/equipment/armor/equip_armor_hero_starter.webp`
**ステータス**: [ ] 未生成
**優先度**: MVP

#### Positive Prompt
```
starter hero chest armor icon, silver light plate armor,
purple cape trim, gold accent lines,
subtle protective runes, starter equipment feeling,
not too ornate, functional heroic design,
RPG armor icon 128x128, anime game art, front display
```

---

#### equip_armor_dark_knight_001.webp
**ファイルパス**: `public/assets/images/icons/equipment/armor/equip_armor_dark_knight_001.webp`
**ステータス**: [ ] 未生成
**優先度**: Ver1.0

#### Positive Prompt
```
dark knight heavy chest armor icon, black iron plate with dark energy,
purple soul flame vents on chest, skull motif shoulder pieces,
blood red gem center ornament, dark aura emanating,
powerful menacing armor design, RPG icon 128x128,
anime dark fantasy equipment, front-facing display
```

---

### 盾・兜・アクセサリー テンプレート

```
# 盾
[ELEMENT] shield icon, [SHAPE] shield design,
magical [ELEMENT_COLOR] barrier glow,
rune inscription on surface, [ELEMENT] gem center,
RPG shield icon 128x128, front-facing display

# 兜
[CLASS] helmet/helm icon, [MATERIAL] construction,
[ELEMENT] magical glow on visor,
ornate [ELEMENT] motif decorations,
RPG helmet icon 128x128, front display angle

# 指輪
[ELEMENT] ring icon, elegant band with [ELEMENT_COLOR] gem,
magical glow, rune inscriptions,
premium jewelry design, RPG accessory icon 64x64

# ネックレス
[ELEMENT] necklace/pendant icon, [GEM_SHAPE] pendant,
[ELEMENT_COLOR] magical shine, delicate chain,
RPG accessory icon 64x64
```

---

## アーティファクト（特殊最高レアリティ装備）

#### equip_artifact_arcana_core.webp
**ファイルパス**: `public/assets/images/icons/equipment/artifacts/equip_artifact_arcana_core.webp`
**ステータス**: [ ] 未生成
**優先度**: Ver3.0

#### Positive Prompt
```
legendary arcana core artifact, mysterious floating orb,
all 7 elemental colors swirling inside crystal sphere,
ancient cosmic runes orbiting around it,
overwhelming magical power emanating,
ultimate artifact item icon, 128x128,
rainbow prismatic glow, transcendent magical object,
anime JRPG legendary artifact design
```

---

## 生成優先チェックリスト

### MVP（ゲーム開始に必要）

- [ ] equip_sword_arcana_001.webp（初期入手剣）
- [ ] equip_armor_hero_starter.webp（初期防具）
- [ ] equip_staff_arcana_001.webp（初期杖）
- [ ] equip_ring_starter.webp（初期指輪）

### Ver1.0（属性別武器揃える）

- [ ] 火属性: 剣・杖・防具 各1
- [ ] 水属性: 剣・杖・防具 各1
- [ ] 雷属性: 剣・弓・防具 各1
- [ ] 風属性: 弓・短剣・防具 各1
- [ ] 光属性: 剣・魔導書・防具 各1
- [ ] 闇属性: 剣・短剣・防具 各1
- [ ] 土属性: 斧・防具 各1
