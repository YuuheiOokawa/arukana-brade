import type { SkillMaster } from '../types';

export const SKILL_MASTER: SkillMaster[] = [
  // ===== 通常スキル - 単体攻撃 (basic) =====
  { id: 'skill_slash',         name: '烈火斬',       description: '敵単体に炎属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'slash' },
  { id: 'skill_water_blast',   name: '水流弾',       description: '敵単体に水属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'magic' },
  { id: 'skill_wind_cutter',   name: '風刃斬',       description: '敵単体に風属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'slash' },
  { id: 'skill_earth_smash',   name: '大地砕き',     description: '敵単体に土属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'slash' },
  { id: 'skill_light_ray',     name: '聖光線',       description: '敵単体に光属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'magic' },
  { id: 'skill_dark_void',     name: '虚無の刃',     description: '敵単体に闇属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], animationType: 'slash' },
  { id: 'skill_thunder_bolt',  name: '雷撃',         description: '敵単体に雷属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }], element: 'thunder', animationType: 'magic' },

  // 通常スキル - 単体攻撃 (mid power)
  { id: 'skill_fire_burst',    name: '炎爆発',       description: '敵単体に強力な炎属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'explosion' },
  { id: 'skill_aqua_lance',    name: '水の槍',       description: '敵単体に強力な水属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'magic' },
  { id: 'skill_gale_slash',    name: '嵐の斬撃',     description: '敵単体に強力な風属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'slash' },
  { id: 'skill_rock_crush',    name: '岩砕き',       description: '敵単体に強力な土属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'slash' },
  { id: 'skill_holy_arrow',    name: '聖矢',         description: '敵単体に強力な光属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'magic' },
  { id: 'skill_shadow_pierce', name: '影刺し',       description: '敵単体に強力な闇属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'slash' },
  { id: 'skill_thunder_strike',name: '雷撃強化',     description: '敵単体に強力な雷属性攻撃',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], element: 'thunder', animationType: 'magic' },

  // 通常スキル - 単体攻撃 (high power)
  { id: 'skill_wind_razor',    name: '風の刃',       description: '敵単体に超強力な風属性攻撃',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }], animationType: 'slash' },
  { id: 'skill_light_blade',   name: '聖剣',         description: '敵単体に超強力な光属性攻撃',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.8 }], animationType: 'slash' },
  { id: 'skill_thunder_fury',  name: '雷の怒り',     description: '敵単体に超強力な雷属性攻撃',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }], element: 'thunder', animationType: 'magic' },
  { id: 'skill_thunder_dash',  name: '雷撃突進',     description: '電光石火の一撃を繰り出す',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.8 }], element: 'thunder', animationType: 'slash' },
  { id: 'skill_thunder_beam',  name: '雷光線',       description: '強力な雷の光線を放つ',               bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 3.0 }], element: 'thunder', animationType: 'magic' },
  { id: 'skill_earth_giant',   name: '土の巨人',     description: '大地の力で敵を粉砕する',             bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 3.0 }], animationType: 'explosion' },
  { id: 'skill_fire_fang',     name: '炎牙',         description: '炎の牙で敵を噛み砕く',               bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.2 }], animationType: 'slash' },
  { id: 'skill_thunder_axe',   name: '雷斧',         description: '電気を帯びた大斧で斬りつける',       bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }], element: 'thunder', animationType: 'slash' },
  { id: 'skill_water_flow',    name: '水流',         description: '鋭い水流で敵を貫く',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.8 }], animationType: 'magic' },
  { id: 'skill_dark_devour',   name: '闇喰い',       description: '闇で敵を喰らい自身を回復',           bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }, { type: 'heal', power: 0.5 }], animationType: 'slash' },
  { id: 'skill_light_cross',   name: '光十字',       description: '聖なる光で十字に斬りつける',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }], animationType: 'slash' },
  { id: 'skill_wind_pierce',   name: '風穿',         description: '風属性攻撃で防御を貫く',             bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.2 }, { type: 'debuff_def', power: 0.8, duration: 2 }], animationType: 'slash' },

  // 通常スキル - 全体攻撃
  { id: 'skill_multi_slash',   name: '連撃',         description: '敵全体に攻撃を行う',                 bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'slash' },
  { id: 'skill_fire_wave',     name: '炎の波動',     description: '敵全体に炎属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'explosion' },
  { id: 'skill_water_wave',    name: '水の波動',     description: '敵全体に水属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'magic' },
  { id: 'skill_wind_wave',     name: '風の波動',     description: '敵全体に風属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'magic' },
  { id: 'skill_earth_wave',    name: '土の波動',     description: '敵全体に土属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'explosion' },
  { id: 'skill_light_wave',    name: '光の波動',     description: '敵全体に光属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'magic' },
  { id: 'skill_dark_wave',     name: '闇の波動',     description: '敵全体に闇属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], animationType: 'magic' },
  { id: 'skill_thunder_wave',  name: '雷の波動',     description: '敵全体に雷属性の波動を放つ',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.2 }], element: 'thunder', animationType: 'magic' },
  { id: 'skill_earth_spike',   name: '土の棘',       description: '地面から棘を生やし敵全体を傷つける', bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.5 }], animationType: 'explosion' },
  { id: 'skill_light_nova',    name: '聖光爆発',     description: '聖なる光で敵全体を薙ぎ払う',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.5 }], animationType: 'magic' },
  { id: 'skill_dark_explosion',name: '闇の爆発',     description: '闇の力で敵全体を吹き飛ばす',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.8 }], animationType: 'explosion' },
  { id: 'skill_thunder_chain', name: '連鎖雷撃',     description: '雷が敵全体に連鎖する',               bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.3 }], element: 'thunder', animationType: 'magic' },
  { id: 'skill_fire_dance',    name: '炎の舞',       description: '炎を舞わせながら敵全体を攻撃',       bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.4 }], animationType: 'explosion' },
  { id: 'skill_thunder_sphere',name: '雷球',         description: '巨大な雷球で敵全体を攻撃',           bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.5 }], element: 'thunder', animationType: 'explosion' },
  { id: 'skill_dark_tentacle', name: '闇触手',       description: '闇の触手で敵全体を締め上げる',       bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.4 }], animationType: 'slash' },
  { id: 'skill_water_dragon',  name: '水龍',         description: '水龍召喚で敵全体を薙ぎ払う',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 2.0 }], animationType: 'magic' },
  { id: 'skill_wind_storm',    name: '嵐',           description: '激しい嵐で敵全体を蹂躙する',         bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.6 }], animationType: 'magic' },
  { id: 'skill_light_sword',   name: '聖剣光',       description: '聖なる光剣で敵全体を切り裂く',       bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 2.5 }], animationType: 'slash' },
  { id: 'skill_water_arrow',   name: '水矢雨',       description: '水の矢を雨のように降り注がせる',     bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.3 }], animationType: 'magic' },
  { id: 'skill_earth_tremor',  name: '地震動',       description: '大地を揺らして敵全体を転ばせる',     bbCost: 0, target: 'all_enemies', effects: [{ type: 'damage', power: 1.0 }, { type: 'debuff_def', power: 0.85, duration: 2 }], animationType: 'explosion' },

  // 通常スキル - 回復
  { id: 'skill_heal',          name: '回復の光',     description: '味方単体のHPを回復する',             bbCost: 0, target: 'single_ally', effects: [{ type: 'heal', power: 1.2 }], animationType: 'heal' },
  { id: 'skill_full_heal',     name: '大回復',       description: '味方全体のHPを回復する',             bbCost: 0, target: 'all_allies', effects: [{ type: 'heal', power: 1.5 }], animationType: 'heal' },
  { id: 'skill_wind_feather',  name: '風の羽',       description: '風の力で自身のHPを回復する',         bbCost: 0, target: 'self',       effects: [{ type: 'heal', power: 1.5 }], animationType: 'heal' },
  { id: 'skill_light_grace',   name: '聖恵み',       description: '聖なる光で味方全体を少し回復',       bbCost: 0, target: 'all_allies', effects: [{ type: 'heal', power: 1.0 }], animationType: 'heal' },
  { id: 'skill_water_heal_stream', name: '水の癒し', description: '水流で味方全体を回復する',           bbCost: 0, target: 'all_allies', effects: [{ type: 'heal', power: 1.2 }], animationType: 'heal' },
  { id: 'skill_earth_prayer',  name: '大地の祈り',   description: '大地の加護で味方全体を回復',         bbCost: 0, target: 'all_allies', effects: [{ type: 'heal', power: 1.2 }], animationType: 'heal' },
  { id: 'skill_light_bless',   name: '祝福',         description: '聖なる祝福で回復力を高める',         bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_rec', power: 1.8, duration: 3 }], animationType: 'heal' },

  // 通常スキル - バフ
  { id: 'skill_atk_up',        name: '鼓舞',         description: '味方全体の攻撃力を上昇させる',       bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.3, duration: 2 }], animationType: 'magic' },
  { id: 'skill_def_up',        name: '守護の壁',     description: '味方全体の防御力を上昇させる',       bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.4, duration: 2 }], animationType: 'magic' },
  { id: 'skill_wind_boost',    name: '風の加速',     description: '味方全体の攻撃力を3ターン上昇',      bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.4, duration: 3 }], animationType: 'magic' },
  { id: 'skill_earth_wall',    name: '土壁',         description: '味方全体の防御力を3ターン大幅上昇',  bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.6, duration: 3 }], animationType: 'magic' },
  { id: 'skill_water_veil',    name: '水の帳',       description: '水の盾で味方全体の防御力上昇',       bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.5, duration: 2 }], animationType: 'magic' },
  { id: 'skill_wind_spirit',   name: '風精霊',       description: '風の精霊が味方全体の攻撃力を高める', bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.25, duration: 2 }], animationType: 'magic' },
  { id: 'skill_light_barrier', name: '光の盾',       description: '聖光で味方全体の防御力を大幅上昇',   bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.5, duration: 3 }], animationType: 'magic' },
  { id: 'skill_dark_shroud',   name: '闇の帷',       description: '闇に紛れて攻撃力を大幅上昇',         bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.4, duration: 2 }], animationType: 'magic' },
  { id: 'skill_fire_armor',    name: '炎鎧',         description: '炎の鎧を纏い防御力を上昇させる',     bbCost: 0, target: 'self',       effects: [{ type: 'buff_def', power: 1.8, duration: 3 }], animationType: 'magic' },
  { id: 'skill_earth_guard',   name: '土の守護',     description: '大地の力で自身の防御を大幅強化',     bbCost: 0, target: 'self',       effects: [{ type: 'buff_def', power: 2.0, duration: 2 }], animationType: 'magic' },
  { id: 'skill_wind_speed',    name: '風速',         description: '風のスピードで自身の攻撃力上昇',     bbCost: 0, target: 'self',       effects: [{ type: 'buff_atk', power: 1.5, duration: 3 }], animationType: 'magic' },
  { id: 'skill_earth_fortress',name: '土の砦',       description: '要塞のような守備で全体防御大幅上昇', bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.8, duration: 3 }], animationType: 'magic' },
  { id: 'skill_wind_dance',    name: '風舞',         description: '風と舞い攻撃力と回復力を上昇',       bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.3, duration: 2 }, { type: 'buff_rec', power: 1.2, duration: 2 }], animationType: 'magic' },
  { id: 'skill_fire_wall',     name: '炎の壁',       description: '炎の障壁で防御と攻撃力を同時強化',   bbCost: 0, target: 'all_allies', effects: [{ type: 'buff_def', power: 1.3, duration: 2 }, { type: 'buff_atk', power: 1.2, duration: 2 }], animationType: 'magic' },

  // 通常スキル - デバフ
  { id: 'skill_dark_curse',    name: '闇の呪い',     description: '闇の呪いで敵の攻撃力を大幅低下',     bbCost: 0, target: 'single_enemy', effects: [{ type: 'debuff_atk', power: 0.6, duration: 3 }], animationType: 'magic' },
  { id: 'skill_water_prison',  name: '水獄',         description: '水牢で敵の防御力を大幅低下',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'debuff_def', power: 0.6, duration: 3 }], animationType: 'magic' },
  { id: 'skill_fire_roar',     name: '炎の咆哮',     description: '炎の咆哮で敵全体の防御力を低下',     bbCost: 0, target: 'all_enemies', effects: [{ type: 'debuff_def', power: 0.7, duration: 2 }], animationType: 'explosion' },
  { id: 'skill_dark_mist',     name: '闇霧',         description: '闇の霧で敵全体の攻撃力を低下',       bbCost: 0, target: 'all_enemies', effects: [{ type: 'debuff_atk', power: 0.7, duration: 2 }], animationType: 'magic' },
  { id: 'skill_water_freeze',  name: '氷結',         description: '凍結で敵の攻撃力を大幅低下',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }, { type: 'debuff_atk', power: 0.7, duration: 2 }], animationType: 'magic' },
  { id: 'skill_fire_brand',    name: '炎印',         description: '炎の焼き印で防御力低下',             bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.8 }, { type: 'debuff_def', power: 0.8, duration: 2 }], animationType: 'explosion' },
  { id: 'skill_dark_void_ex',  name: '虚無の深淵',   description: '深淵に引き込み防御を剥ぎ取る',       bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }, { type: 'debuff_def', power: 0.7, duration: 3 }], animationType: 'magic' },
  { id: 'skill_light_purify',  name: '光の浄化',     description: '聖光で敵の防御を削ぎながら攻撃',     bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.5 }, { type: 'debuff_def', power: 0.75, duration: 2 }], animationType: 'magic' },

  // 必殺技 (bbCost: 100) - 既存
  { id: 'bb_inferno',          name: '業炎インフェルノ',        description: '敵全体に炎の大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.0 }, { type: 'status_poison', power: 0.1, duration: 3, chance: 0.5 }], element: 'fire',  animationType: 'explosion' },
  { id: 'bb_tidal_wave',       name: '大海嘯ティダルウェーブ', description: '敵全体に水の大ダメージ、攻撃力低下', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 2.8 }, { type: 'debuff_atk', power: 0.7, duration: 2 }], element: 'water', animationType: 'magic' },
  { id: 'bb_storm_blade',      name: '嵐刃ストームブレード',   description: '敵全体に風の大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 2.5 }], element: 'wind',  animationType: 'slash' },
  { id: 'bb_earthquake',       name: '大地震撼',               description: '敵全体に土の大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.2 }], element: 'earth', animationType: 'explosion' },
  { id: 'bb_holy_judgment',    name: '聖裁ホーリージャッジメント', description: '敵全体に光の超大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 2.8 }], element: 'light', animationType: 'magic' },
  { id: 'bb_dark_apocalypse',  name: '黒滅ダークアポカリプス', description: '敵全体に闇の超大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }], element: 'dark',  animationType: 'explosion' },
  { id: 'bb_arcana_heal',      name: 'アルカナヒール',         description: '味方全体を大回復し攻撃力上昇', bbCost: 100, target: 'all_allies', effects: [{ type: 'heal', power: 2.0 }, { type: 'buff_atk', power: 1.5, duration: 3 }], animationType: 'heal' },
  { id: 'bb_blade_storm',      name: 'ブレードストーム',       description: '敵単体に5連続攻撃', bbCost: 100, target: 'single_enemy', effects: [{ type: 'damage', power: 5.0 }], animationType: 'slash' },

  // 必殺技 - 炎
  { id: 'bb_fire_burst',       name: '爆炎バースト',           description: '敵全体に炎の超大ダメージ+燃焼', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }, { type: 'debuff_def', power: 0.8, duration: 2 }], element: 'fire',  animationType: 'explosion' },
  { id: 'bb_volcano_rage',     name: '火山の怒り',             description: '溶岩の雨で敵全体に超大ダメージ',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.0 }], element: 'fire',  animationType: 'explosion' },
  { id: 'bb_fire_phoenix',     name: '炎鳥鳳凰',               description: '不死鳥が敵全体を焼き尽くす',       bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.8 }, { type: 'buff_atk', power: 1.5, duration: 2 }], element: 'fire',  animationType: 'explosion' },

  // 必殺技 - 水
  { id: 'bb_aqua_prison',      name: '水獄アクアプリズン',     description: '水牢で敵全体を閉じ込め大ダメージ',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.0 }, { type: 'debuff_def', power: 0.7, duration: 2 }], element: 'water', animationType: 'magic' },
  { id: 'bb_ocean_storm',      name: '海嵐オーシャンストーム', description: '嵐の海で敵全体に超大ダメージ',       bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.8 }], element: 'water', animationType: 'magic' },
  { id: 'bb_blizzard',         name: '極寒ブリザード',         description: '氷の嵐で敵全体を凍らせる',           bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.2 }, { type: 'debuff_atk', power: 0.6, duration: 3 }], element: 'water', animationType: 'magic' },

  // 必殺技 - 風
  { id: 'bb_gale_slash_bb',    name: '嵐刃連斬',               description: '疾風の連撃で敵全体に大ダメージ',     bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }, { type: 'buff_atk', power: 1.3, duration: 2 }], element: 'wind',  animationType: 'slash' },
  { id: 'bb_tornado',          name: '竜巻グレートトルネード', description: '巨大竜巻で敵全体に超大ダメージ',     bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.0 }], element: 'wind',  animationType: 'explosion' },
  { id: 'bb_wind_god',         name: '風神の加護',             description: '風神の力で全体攻撃+防御強化',         bbCost: 100, target: 'all_allies', effects: [{ type: 'buff_atk', power: 1.8, duration: 3 }, { type: 'buff_def', power: 1.6, duration: 3 }], animationType: 'magic' },

  // 必殺技 - 土
  { id: 'bb_terra_crush',      name: '大地粉砕テラクラッシュ', description: '大地を砕いて敵全体に大ダメージ',     bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }, { type: 'debuff_def', power: 0.7, duration: 2 }], element: 'earth', animationType: 'explosion' },
  { id: 'bb_mountain_break',   name: '山砕き',                 description: '山を砕く一撃で敵全体に超大ダメージ', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.2 }], element: 'earth', animationType: 'explosion' },
  { id: 'bb_earth_fortress_bb',name: '鉄壁要塞',               description: '不動の守備で全体防御を大幅強化',     bbCost: 100, target: 'all_allies', effects: [{ type: 'buff_def', power: 2.5, duration: 3 }, { type: 'heal', power: 1.5 }], animationType: 'magic' },

  // 必殺技 - 光
  { id: 'bb_divine_ray',       name: '神聖光線ディバインレイ', description: '神の光で敵全体に大ダメージ+全体回復', bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }], element: 'light', animationType: 'magic' },
  { id: 'bb_seraph_blessing',  name: '天使の加護セラフブレス', description: '天使の祝福で全体大回復+攻撃力上昇',   bbCost: 100, target: 'all_allies', effects: [{ type: 'heal', power: 3.0 }, { type: 'buff_atk', power: 1.6, duration: 3 }], animationType: 'heal' },
  { id: 'bb_divine_shield',    name: '神盾ディバインシールド', description: '聖なる盾で全体防御大幅強化+回復',     bbCost: 100, target: 'all_allies', effects: [{ type: 'buff_def', power: 2.5, duration: 3 }, { type: 'heal', power: 2.0 }], animationType: 'heal' },

  // 必殺技 - 闇
  { id: 'bb_void_collapse',    name: '虚無崩壊ヴォイドコラプス', description: '虚無の力で敵全体に超絶ダメージ',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.5 }], element: 'dark',  animationType: 'explosion' },
  { id: 'bb_shadow_realm',     name: '影の領域シャドウレルム', description: '影の世界に引き込み大ダメージ+弱体',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }, { type: 'debuff_atk', power: 0.6, duration: 3 }], element: 'dark',  animationType: 'magic' },
  { id: 'bb_night_fall',       name: '夜の帳ナイトフォール',   description: '永遠の夜で敵全体を闇に包む',           bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 2.0 }, { type: 'debuff_atk', power: 0.5, duration: 3 }, { type: 'debuff_def', power: 0.7, duration: 3 }], element: 'dark',  animationType: 'magic' },

  // 必殺技 - 雷
  { id: 'bb_thunder_god',      name: '雷神の一撃サンダーゴッド', description: '雷神の力で敵全体に超大ダメージ',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.0 }], element: 'thunder', animationType: 'explosion' },
  { id: 'bb_lightning_storm',  name: '雷嵐ライトニングストーム', description: '雷の嵐で敵全体に大ダメージ+弱体',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.5 }, { type: 'debuff_def', power: 0.7, duration: 2 }], element: 'thunder', animationType: 'magic' },
  { id: 'bb_thunder_judgment', name: '雷裁サンダージャッジメント', description: '天の裁きで単体に超絶大ダメージ', bbCost: 100, target: 'single_enemy', effects: [{ type: 'damage', power: 8.0 }], element: 'thunder', animationType: 'explosion' },

  // 必殺技 - 全属性・特殊
  { id: 'bb_arcana_blast',     name: 'アルカナブラスト',       description: 'アルカナの力で敵全体に大ダメージ',   bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.0 }], animationType: 'explosion' },
  { id: 'bb_guardian_spirit',  name: '守護精霊',               description: '精霊の加護で全体大回復+防御強化',     bbCost: 100, target: 'all_allies', effects: [{ type: 'heal', power: 2.5 }, { type: 'buff_def', power: 1.8, duration: 3 }], animationType: 'heal' },
  { id: 'bb_berserker_soul',   name: '狂戦士の魂',             description: '狂戦士化で全体攻撃力を大幅強化',       bbCost: 100, target: 'all_allies', effects: [{ type: 'buff_atk', power: 2.0, duration: 3 }], animationType: 'magic' },

  // 通常スキル・必殺技 - 追加補完（後発ユニットが参照していたが未定義だったスキル群）
  { id: 'skill_earth_pulse',  name: '大地の鼓動', description: '敵全体に土属性の波動を放つ',                 bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.2 }], animationType: 'explosion' },
  { id: 'skill_dark_drain',   name: '闇の吸収',   description: '敵単体から生命力を吸収し自身を回復',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }, { type: 'heal', power: 0.5 }], animationType: 'magic' },
  { id: 'skill_coral_storm',  name: '珊瑚嵐',     description: '敵全体に水属性の嵐を叩きつける',             bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.5 }], animationType: 'magic' },
  { id: 'skill_ice_lance',    name: '氷槍',       description: '氷の槍で敵単体を貫き攻撃力を下げる',         bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.8 }, { type: 'debuff_atk', power: 0.75, duration: 2 }], animationType: 'magic' },
  { id: 'skill_wave_dance',   name: '波の舞',     description: '波と舞い味方全体の攻撃力と回復力を上昇',     bbCost: 0, target: 'all_allies',   effects: [{ type: 'buff_atk', power: 1.3, duration: 2 }, { type: 'buff_rec', power: 1.2, duration: 2 }], animationType: 'magic' },
  { id: 'skill_sea_storm',    name: '海嵐',       description: '敵全体に猛烈な海の嵐を放つ',                 bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.6 }], animationType: 'magic' },
  { id: 'skill_wind_fury',    name: '疾風の怒り', description: '敵単体に超強力な風属性攻撃',                 bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.5 }], animationType: 'slash' },
  { id: 'skill_dragon_wind',  name: '竜風',       description: '竜の咆哮のような風で敵全体を攻撃',           bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.5 }], animationType: 'magic' },
  { id: 'skill_nature_heal',  name: '自然の癒し', description: '自然の力で味方全体を回復する',               bbCost: 0, target: 'all_allies',   effects: [{ type: 'heal', power: 1.3 }], animationType: 'heal' },
  { id: 'skill_wind_blade',   name: '風刃',       description: '鋭い風の刃で敵単体を斬りつける',             bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.8 }], animationType: 'slash' },
  { id: 'skill_leaf_blade',   name: '葉隠れ斬',   description: '木の葉を纏った刃で敵単体を斬る',             bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.6 }], animationType: 'slash' },
  { id: 'skill_solar_burst',  name: '太陽爆光',   description: '太陽の光で敵全体を焼き払う',                 bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.6 }], animationType: 'magic' },
  { id: 'skill_fox_fire',     name: '狐火',       description: '妖しい炎で敵単体の防御力を下げつつ攻撃',     bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 1.8 }, { type: 'debuff_def', power: 0.8, duration: 2 }], animationType: 'magic' },
  { id: 'skill_earth_crush',  name: '大地の圧砕', description: '敵単体に強力な土属性攻撃',                   bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'slash' },
  { id: 'skill_holy_light',   name: '聖光の癒し', description: '聖なる光で味方全体を回復する',               bbCost: 0, target: 'all_allies',   effects: [{ type: 'heal', power: 1.2 }], animationType: 'heal' },
  { id: 'skill_dark_strike',  name: '暗黒撃',     description: '敵単体に強力な闇属性攻撃',                   bbCost: 0, target: 'single_enemy', effects: [{ type: 'damage', power: 2.0 }], animationType: 'slash' },
  { id: 'skill_wind_gale',    name: '疾風怒濤',   description: '敵全体に強風を叩きつける',                   bbCost: 0, target: 'all_enemies',  effects: [{ type: 'damage', power: 1.4 }], animationType: 'magic' },

  { id: 'bb_deep_sea_blast',  name: '深海爆砕',   description: '深海の圧力で敵全体に超大ダメージ',                 bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.8 }], element: 'water', animationType: 'magic' },
  { id: 'bb_absolute_zero',   name: '絶対零度',   description: '全てを凍てつかせ敵全体に大ダメージ+大幅弱体',     bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 3.6 }, { type: 'debuff_atk', power: 0.55, duration: 3 }], element: 'water', animationType: 'magic' },
  { id: 'bb_hurricane_blast', name: '大暴風',     description: '大暴風で敵全体に超大ダメージ',                     bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.0 }], element: 'wind',  animationType: 'explosion' },
  { id: 'bb_divine_light',    name: '神々の加護', description: '神々しい光で全体を大回復し攻撃力上昇',           bbCost: 100, target: 'all_allies',  effects: [{ type: 'heal', power: 2.8 }, { type: 'buff_atk', power: 1.5, duration: 3 }], element: 'light', animationType: 'heal' },
  { id: 'bb_shadow_void',     name: '影の虚無',   description: '虚無に呑み込み敵全体に超大ダメージ',               bbCost: 100, target: 'all_enemies', effects: [{ type: 'damage', power: 4.2 }], element: 'dark',  animationType: 'explosion' },
];

export const getSkill = (id: string): SkillMaster | undefined =>
  SKILL_MASTER.find(s => s.id === id);
