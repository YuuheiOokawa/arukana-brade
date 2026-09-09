export type SummonRarity = 'SSR' | 'SR' | 'R' | 'N';

export const UNIT_IDS_BY_RARITY: Readonly<Record<SummonRarity, readonly string[]>> = {
  SSR: [
    'unit_001', 'unit_002', 'unit_003', 'unit_004', 'unit_005', 'unit_006',
    'unit_017', 'unit_023', 'unit_029', 'unit_037', 'unit_045', 'unit_053',
    'unit_061', 'unit_062', 'unit_071', 'unit_072', 'unit_079', 'unit_080',
    'unit_087', 'unit_093', 'unit_099', 'unit_105', 'unit_111', 'unit_112',
    'unit_113', 'unit_114', 'unit_115',
  ],
  SR: [
    'unit_007', 'unit_008', 'unit_009', 'unit_010', 'unit_011', 'unit_012',
    'unit_018', 'unit_024', 'unit_030', 'unit_031', 'unit_038', 'unit_039',
    'unit_046', 'unit_047', 'unit_054', 'unit_055', 'unit_063', 'unit_064',
    'unit_065', 'unit_073', 'unit_074', 'unit_075', 'unit_081', 'unit_082',
    'unit_083', 'unit_088', 'unit_089', 'unit_094', 'unit_095', 'unit_100',
    'unit_101', 'unit_106', 'unit_107', 'unit_116', 'unit_117', 'unit_118',
    'unit_119', 'unit_120', 'unit_121', 'unit_122', 'unit_123', 'unit_124',
    'unit_125', 'unit_126', 'unit_127',
  ],
  R: [
    'unit_013', 'unit_014', 'unit_019', 'unit_020', 'unit_025', 'unit_026',
    'unit_032', 'unit_033', 'unit_034', 'unit_040', 'unit_041', 'unit_042',
    'unit_048', 'unit_049', 'unit_050', 'unit_056', 'unit_057', 'unit_058',
    'unit_066', 'unit_067', 'unit_068', 'unit_076', 'unit_077', 'unit_084',
    'unit_085', 'unit_090', 'unit_091', 'unit_096', 'unit_097', 'unit_102',
    'unit_103', 'unit_108', 'unit_109', 'unit_128', 'unit_129', 'unit_130',
    'unit_131', 'unit_132', 'unit_133', 'unit_134', 'unit_135', 'unit_136',
    'unit_137', 'unit_138', 'unit_139', 'unit_140', 'unit_141', 'unit_142',
  ],
  N: [
    'unit_015', 'unit_016', 'unit_021', 'unit_022', 'unit_027', 'unit_028',
    'unit_035', 'unit_036', 'unit_043', 'unit_044', 'unit_051', 'unit_052',
    'unit_059', 'unit_060', 'unit_069', 'unit_070', 'unit_078', 'unit_086',
    'unit_092', 'unit_098', 'unit_104', 'unit_110', 'unit_143', 'unit_144',
    'unit_145', 'unit_146', 'unit_147', 'unit_148', 'unit_149', 'unit_150',
  ],
};

export const UNIT_RARITY_BY_ID = new Map<string, SummonRarity>(
  Object.entries(UNIT_IDS_BY_RARITY).flatMap(([rarity, ids]) =>
    ids.map(id => [id, rarity as SummonRarity] as const),
  ),
);

interface SummonServerRule {
  counts: readonly number[];
  cost1: number;
  cost10: number;
  rarities: readonly SummonRarity[];
  tutorial?: boolean;
}

export const SUMMON_SERVER_RULES: Readonly<Record<string, SummonServerRule>> = {
  summon_standard: { counts: [1, 10], cost1: 50, cost10: 450, rarities: ['SSR', 'SR', 'R', 'N'] },
  summon_arcana: { counts: [1, 10], cost1: 100, cost10: 900, rarities: ['SSR', 'SR', 'R', 'N'] },
  summon_thunder: { counts: [1, 10], cost1: 100, cost10: 900, rarities: ['SSR', 'SR', 'R', 'N'] },
  summon_ticket: { counts: [1, 10], cost1: 0, cost10: 0, rarities: ['SSR', 'SR'] },
  summon_ssr_ticket: { counts: [1], cost1: 0, cost10: 0, rarities: ['SSR'] },
  tutorial_free: { counts: [10], cost1: 0, cost10: 0, rarities: ['SSR', 'SR', 'R', 'N'], tutorial: true },
};

export const RAID_BOSS_MAX_HP: Readonly<Record<string, number>> = {
  raid_dark_lord: 10_000_000,
  raid_fire_titan: 7_500_000,
  raid_thunder_wyrm: 8_500_000,
  raid_water_leviathan: 9_000_000,
  raid_light_seraph: 8_800_000,
};

export const GUILD_EMBLEMS = ['⚔️', '🛡️', '🔥', '💧', '🌿', '⚡', '🌑', '🌟', '✨', '🐉', '👑'] as const;

export const toIntegerInRange = (value: unknown, min: number, max: number): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
};

export const isValidArcanaPlayerId = (value: string): boolean => /^ARC-[0-9A-Z]{6,12}$/.test(value);
