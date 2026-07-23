// アリーナ階級名 (No.1〜100、下位→上位の順)
export const RANK_NAMES: string[] = [
  '名もなき挑戦者', '駆け出しの闘士', '見習い剣士', '若き戦士', '戦場の新星',
  '鉄刃の戦士', '鋼刃の戦士', '疾風の戦士', '猛炎の戦士', '百戦の闘士',
  '青銅の剣士', '白銀の剣士', '黄金の剣士', '紅蓮の剣士', '蒼天の剣士',
  '烈火の闘士', '疾風の闘士', '雷鳴の闘士', '氷刃の闘士', '歴戦の猛者',
  '剣豪', '剣鬼', '剣聖', '武豪', '武神の候補者',
  '紅蓮の騎士', '蒼穹の騎士', '雷光の騎士', '黒炎の騎士', '白銀の騎士王',
  '戦場の英雄', '千刃の英雄', '万軍の英雄', '不敗の英雄', '救世の英雄',
  '覇道の将', '天翔の将', '破軍の将', '無双の将', '天下無双',
  '覇王の剣', '覇王の盾', '覇王の翼', '覇王の魂', '覇王',
  '皇剣の覇者', '皇天の覇者', '皇龍の覇者', '皇帝', '天上の覇者',
  '天剣の闘将', '天槍の闘将', '天翼の闘将', '天雷の闘将', '天焔の闘将',
  '聖域の守護者', '聖剣の継承者', '聖戦の覇者', '聖天の英雄', '神域への挑戦者',
  '神剣の使徒', '神槍の使徒', '神翼の使徒', '神雷の使徒', '神焔の使徒',
  '六星の守護者', '七星の守護者', '八星の守護者', '九星の守護者', '十星の覇者',
  '星界の騎士', '星界の将軍', '星界の王', '星界の皇帝', '星界の覇帝',
  '天界の征服者', '神界の征服者', '魔界の征服者', '三界の征服者', '世界の覇者',
  '運命を斬る者', '因果を断つ者', '時を超える者', '次元を裂く者', '理を超える者',
  '神殺し', '神々の天敵', '神域の破壊者', '神話の超越者', '終焉を超えし者',
  '原初の戦神', '永劫の戦神', '無限の戦神', '創世の戦神', '終焉の戦神',
  'アルカナの超越者', 'アルカナの支配者', 'アルカナの覇神', '唯一無二の神話', 'ARCANA BLADE',
];

// 10ランクごとのブロック単位で必要ポイントの増分(step)を上げていく（最終ランクのみ単独）
export const RANK_BLOCKS: { color: string; step: number; count: number }[] = [
  { color: '#9ca3af', step: 100,  count: 10 }, // 1-10
  { color: '#b45309', step: 150,  count: 10 }, // 11-20
  { color: '#94a3b8', step: 200,  count: 10 }, // 21-30
  { color: '#f59e0b', step: 300,  count: 10 }, // 31-40
  { color: '#e2e8f0', step: 400,  count: 10 }, // 41-50
  { color: '#60a5fa', step: 500,  count: 10 }, // 51-60
  { color: '#a855f7', step: 700,  count: 10 }, // 61-70
  { color: '#c4b5fd', step: 900,  count: 10 }, // 71-80
  { color: '#f97316', step: 1200, count: 10 }, // 81-90
  { color: '#ec4899', step: 2000, count: 9  }, // 91-99
  { color: '#fff8e0', step: 0,    count: 1  }, // 100 (ARCANA BLADE)
];

export interface ArenaRankTitle {
  min: number;
  label: string;
  color: string;
  blockIndex: number; // RANK_BLOCKS 上のブロック番号 (0=最下位ブロック, 10=ARCANA BLADEのみの最上位ブロック)
}

export const RANK_TITLES: ArenaRankTitle[] = (() => {
  const result: ArenaRankTitle[] = [];
  let cur = 0;
  let idx = 0;
  RANK_BLOCKS.forEach((block, blockIndex) => {
    for (let i = 0; i < block.count; i++) {
      result.push({ min: cur, label: RANK_NAMES[idx] ?? `階級${idx + 1}`, color: block.color, blockIndex });
      idx++;
      cur += block.step;
    }
  });
  return result.sort((a, b) => b.min - a.min);
})();

export const getRankTitle = (pts: number): ArenaRankTitle =>
  RANK_TITLES.find(r => pts >= r.min) ?? RANK_TITLES[RANK_TITLES.length - 1];

// 次ランクまでの進捗率(%)。ブロックごとに必要ポイント(100〜2000)が異なるため、
// 現在ランクと直上のランクの実際の閾値差から計算する。
export const getRankProgressPct = (pts: number): number => {
  const idx = RANK_TITLES.findIndex(r => pts >= r.min);
  if (idx <= 0) return 100; // 最上位ランク、またはテーブル未取得
  const current = RANK_TITLES[idx];
  const next = RANK_TITLES[idx - 1];
  const span = next.min - current.min;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((pts - current.min) / span) * 100));
};

// 次ランクまで残り何ポイント必要か。最上位ランク(ARCANA BLADE)なら null
export const getPointsToNextRank = (pts: number): number | null => {
  const idx = RANK_TITLES.findIndex(r => pts >= r.min);
  if (idx <= 0) return null;
  const next = RANK_TITLES[idx - 1];
  return Math.max(0, next.min - pts);
};

// ホーム画面/プロフィール画面のプロフィール枠を、アリーナ階級(blockIndex 0〜10)が
// 上がるほど段階的に豪華にするためのスタイルを返す。
export interface ArenaFrameStyle {
  border: string;
  boxShadow: string;
  background?: string;
  /** 最上位ブロック(ARCANA BLADEランクのみ)は虹色の回転リングを重ねる */
  rainbow: boolean;
}

export const getArenaFrameStyle = (pts: number): ArenaFrameStyle => {
  const title = getRankTitle(pts);
  const tier = title.blockIndex; // 0〜10
  const borderWidth = 1 + Math.floor(tier / 3); // 1〜4px
  const glowBlur = 6 + tier * 5; // 6〜56px
  const glowOpacity = Math.min(0.75, 0.18 + tier * 0.055);
  const bgOpacity = Math.min(0.16, tier * 0.015);
  return {
    border: `${borderWidth}px solid ${title.color}${tier === 0 ? '55' : 'aa'}`,
    boxShadow: tier === 0
      ? '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
      : `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 ${glowBlur}px ${hexToRgba(title.color, glowOpacity)}`,
    background: tier === 0
      ? undefined
      : `linear-gradient(145deg, ${hexToRgba(title.color, bgOpacity)} 0%, rgba(14,8,36,0.98) 65%)`,
    rainbow: tier === RANK_BLOCKS.length - 1,
  };
};

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
