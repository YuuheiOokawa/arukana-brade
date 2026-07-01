import type { SummonPool } from '../types';

const SSR_UNITS = [
  'unit_001', 'unit_002', 'unit_003', 'unit_004', 'unit_005', 'unit_006',
  'unit_017', 'unit_023', 'unit_029', 'unit_037', 'unit_045', 'unit_053',
  'unit_061', 'unit_062',
  'unit_071', 'unit_072', 'unit_079', 'unit_080', 'unit_087', 'unit_093',
  'unit_099', 'unit_105', 'unit_111', 'unit_112', 'unit_113', 'unit_114', 'unit_115',
];

const SR_UNITS = [
  'unit_007', 'unit_008', 'unit_009', 'unit_010', 'unit_011', 'unit_012',
  'unit_018', 'unit_024', 'unit_030', 'unit_031', 'unit_038', 'unit_039',
  'unit_046', 'unit_047', 'unit_054', 'unit_055', 'unit_063', 'unit_064', 'unit_065',
  'unit_073', 'unit_074', 'unit_075', 'unit_081', 'unit_082', 'unit_083',
  'unit_088', 'unit_089', 'unit_094', 'unit_095', 'unit_100', 'unit_101',
  'unit_106', 'unit_107', 'unit_116', 'unit_117', 'unit_118', 'unit_119',
  'unit_120', 'unit_121', 'unit_122', 'unit_123', 'unit_124', 'unit_125',
  'unit_126', 'unit_127',
];

const R_UNITS = [
  'unit_013', 'unit_014',
  'unit_019', 'unit_020', 'unit_025', 'unit_026', 'unit_032', 'unit_033', 'unit_034',
  'unit_040', 'unit_041', 'unit_042', 'unit_048', 'unit_049', 'unit_050',
  'unit_056', 'unit_057', 'unit_058', 'unit_066', 'unit_067', 'unit_068',
  'unit_076', 'unit_077', 'unit_084', 'unit_085', 'unit_090', 'unit_091',
  'unit_096', 'unit_097', 'unit_102', 'unit_103', 'unit_108', 'unit_109',
  'unit_128', 'unit_129', 'unit_130', 'unit_131', 'unit_132', 'unit_133',
  'unit_134', 'unit_135', 'unit_136', 'unit_137', 'unit_138', 'unit_139',
  'unit_140', 'unit_141', 'unit_142',
];

const N_UNITS = [
  'unit_015', 'unit_016',
  'unit_021', 'unit_022', 'unit_027', 'unit_028', 'unit_035', 'unit_036',
  'unit_043', 'unit_044', 'unit_051', 'unit_052', 'unit_059', 'unit_060',
  'unit_069', 'unit_070',
  'unit_078', 'unit_086', 'unit_092', 'unit_098', 'unit_104', 'unit_110',
  'unit_143', 'unit_144', 'unit_145', 'unit_146', 'unit_147', 'unit_148',
  'unit_149', 'unit_150',
];

export const SUMMON_POOLS: SummonPool[] = [
  {
    id: 'summon_standard',
    name: 'スタンダード召喚',
    description: '様々なユニットが出現する通常の召喚。',
    cost1: 50,
    cost10: 450,
    isAvailable: true,
    rates: [
      { rarity: 'SSR', rate: 0.04, unitIds: SSR_UNITS },
      { rarity: 'SR',  rate: 0.15, unitIds: SR_UNITS },
      { rarity: 'R',   rate: 0.40, unitIds: R_UNITS },
      { rarity: 'N',   rate: 0.41, unitIds: N_UNITS },
    ],
  },
  {
    id: 'summon_arcana',
    name: 'アルカナ召喚',
    description: 'SSR・SR確率アップ！アルカナの力を宿したユニットが出現しやすい。',
    cost1: 100,
    cost10: 900,
    isAvailable: true,
    banner: '🌟 SSR確率2倍！',
    rates: [
      { rarity: 'SSR', rate: 0.08, unitIds: SSR_UNITS },
      { rarity: 'SR',  rate: 0.25, unitIds: SR_UNITS },
      { rarity: 'R',   rate: 0.40, unitIds: R_UNITS },
      { rarity: 'N',   rate: 0.27, unitIds: N_UNITS },
    ],
  },
  {
    id: 'summon_thunder',
    name: '⚡ 雷属性ピックアップ召喚',
    description: '雷属性ユニットの出現率大幅UP！ライトニングロードとサンダーゴッドを狙え！',
    cost1: 100,
    cost10: 900,
    isAvailable: true,
    banner: '⚡ 雷属性SSR確率3倍！',
    rates: [
      { rarity: 'SSR', rate: 0.10, unitIds: ['unit_061', 'unit_062', ...SSR_UNITS.filter(id => !['unit_061','unit_062'].includes(id))] },
      { rarity: 'SR',  rate: 0.25, unitIds: ['unit_063', 'unit_064', 'unit_065', ...SR_UNITS.filter(id => !['unit_063','unit_064','unit_065'].includes(id))] },
      { rarity: 'R',   rate: 0.40, unitIds: R_UNITS },
      { rarity: 'N',   rate: 0.25, unitIds: N_UNITS },
    ],
  },
  {
    id: 'summon_ticket',
    name: 'チケット召喚',
    description: '召喚チケットを使用した召喚。SR以上確定！',
    cost1: 0,
    cost10: 0,
    isAvailable: true,
    rates: [
      { rarity: 'SSR', rate: 0.05, unitIds: SSR_UNITS },
      { rarity: 'SR',  rate: 0.95, unitIds: SR_UNITS },
      { rarity: 'R',   rate: 0,    unitIds: [] },
      { rarity: 'N',   rate: 0,    unitIds: [] },
    ],
  },
  {
    id: 'summon_ssr_ticket',
    name: 'SSR確定チケット召喚',
    description: 'SSR確定の最高級チケット召喚！',
    cost1: 0,
    cost10: 0,
    isAvailable: false,
    rates: [
      { rarity: 'SSR', rate: 1.0,  unitIds: SSR_UNITS },
      { rarity: 'SR',  rate: 0,    unitIds: [] },
      { rarity: 'R',   rate: 0,    unitIds: [] },
      { rarity: 'N',   rate: 0,    unitIds: [] },
    ],
  },
];
