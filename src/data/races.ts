import type { RaceMaster } from '../types';

export const RACE_MASTER: RaceMaster[] = [
  {
    id: 'human',
    name: '人族',
    emoji: '⚔️',
    description: 'アルカナ大陸で最も数の多い種族。バランスの取れた能力を持ち、どんな状況にも対応できる。',
    traitDescription: 'HP・攻撃・防御・回復 全体的に高水準',
    statFocus: 'バランス型（初心者向け）',
  },
  {
    id: 'demon',
    name: '魔人族',
    emoji: '🗡️',
    description: '闇の力を宿した種族。圧倒的な攻撃力を誇るが、守りは薄い。一撃必殺を信条とする。',
    traitDescription: '攻撃力が非常に高い。防御・回復は低め',
    statFocus: '攻撃特化型',
  },
  {
    id: 'goddess',
    name: '女神族',
    emoji: '✨',
    description: '神の血を引く神聖な種族。回復と補助に長け、仲間を支え続ける力を持つ。',
    traitDescription: '回復力と補助スキルが得意。HPは低め',
    statFocus: 'サポート・回復型',
  },
  {
    id: 'beastkin',
    name: '獣人族',
    emoji: '🐾',
    description: '獣の本能を持つ種族。素早い身体能力と鋭い感覚で敵を圧倒する。',
    traitDescription: '素早さと物理攻撃が高い。魔法防御は低め',
    statFocus: 'スピード・物理型',
  },
  {
    id: 'spirit',
    name: '精霊族',
    emoji: '🌿',
    description: '自然の精霊と共存する神秘の種族。魔法と属性スキルの扱いに長けた魔法使いの一族。',
    traitDescription: '魔法攻撃と属性スキルが得意。物理防御は低め',
    statFocus: '魔法・属性特化型',
  },
];

export const getRaceMaster = (id: string): RaceMaster | undefined =>
  RACE_MASTER.find(r => r.id === id);
