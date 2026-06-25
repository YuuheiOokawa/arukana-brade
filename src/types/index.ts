// ===== 属性 =====
export type ElementType = 'fire' | 'water' | 'wind' | 'earth' | 'light' | 'dark' | 'thunder';

export const ELEMENT_NAMES: Record<ElementType, string> = {
  fire: '炎',
  water: '水',
  wind: '風',
  earth: '土',
  light: '光',
  dark: '闇',
  thunder: '雷',
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  fire: 'text-element-fire',
  water: 'text-element-water',
  wind: 'text-element-wind',
  earth: 'text-element-earth',
  light: 'text-element-light',
  dark: 'text-element-dark',
  thunder: 'text-element-thunder',
};

export const ELEMENT_BG: Record<ElementType, string> = {
  fire: 'bg-element-fire',
  water: 'bg-element-water',
  wind: 'bg-element-wind',
  earth: 'bg-element-earth',
  light: 'bg-element-light',
  dark: 'bg-element-dark',
  thunder: 'bg-element-thunder',
};

// 属性相性テーブル: [攻撃側][防御側] = 倍率
export const ELEMENT_ADVANTAGE: Record<ElementType, Partial<Record<ElementType, number>>> = {
  fire:    { wind: 1.5, water: 0.75 },
  water:   { fire: 1.5, wind: 0.75 },
  wind:    { earth: 1.5, fire: 0.75, thunder: 1.5 },
  earth:   { water: 1.5, wind: 0.75 },
  light:   { dark: 1.5 },
  dark:    { light: 1.5 },
  thunder: { water: 1.5, wind: 0.75 },
};

// ===== 星レアリティ (★1〜★7 + ★👑) =====
// ガチャ排出: ★1〜★3のみ。★4以上は育成・進化・覚醒で到達
export type StarRarity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'CROWN';

// ===== レアリティ (UnitMaster 内部用: 既存互換) =====
export type RarityType = 'N' | 'R' | 'SR' | 'SSR';

export const RARITY_ORDER: Record<RarityType, number> = { N: 0, R: 1, SR: 2, SSR: 3 };
export const RARITY_COLORS: Record<RarityType, string> = {
  N: 'rarity-n',
  R: 'rarity-r',
  SR: 'rarity-sr',
  SSR: 'rarity-ssr',
};

// ===== ガチャ表示用星レアリティ (★1〜★3、排出上限) =====
export type GachaStar = 1 | 2 | 3;

export const RARITY_TO_STAR: Record<RarityType, GachaStar> = {
  N: 1,
  R: 1,
  SR: 2,
  SSR: 3,
};

export const STAR_COLORS: Record<GachaStar, string> = {
  1: 'rgba(123,200,255,.88)',
  2: 'rgba(183,115,255,.92)',
  3: 'rgba(255,228,141,.98)',
};

export const STAR_LABELS: Record<GachaStar, string> = {
  1: 'NORMAL',
  2: 'RARE',
  3: 'ARCANA',
};

// ===== シナリオ =====
export type SceneType = 'narration' | 'dialogue';
export type CharacterPosition = 'left' | 'center' | 'right';

export interface ScenarioLine {
  lineId: string;
  type: SceneType;
  speakerName?: string;
  characterId?: string;
  position?: CharacterPosition;
  text: string;
  expression?: string;
  effect?: string;
}

export interface ScenarioMaster {
  scenarioId: string;
  questId: string;
  stageId: string;
  backgroundKey: 'forest' | 'ruins' | 'temple' | 'cave' | 'castle' | 'sky' | 'darkness';
  bgmKey?: string;
  lines: ScenarioLine[];
}

// ===== スキル =====
export type SkillTargetType = 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self';
export type SkillEffectType = 'damage' | 'heal' | 'buff_atk' | 'buff_def' | 'buff_rec' | 'debuff_atk' | 'debuff_def' | 'status_poison' | 'status_paralyze';

export interface SkillEffect {
  type: SkillEffectType;
  power: number;
  duration?: number;
  chance?: number;
}

export interface SkillMaster {
  id: string;
  name: string;
  description: string;
  bbCost: number;
  target: SkillTargetType;
  effects: SkillEffect[];
  element?: ElementType;
  animationType: 'slash' | 'magic' | 'heal' | 'explosion';
}

// ===== ユニット =====
export interface UnitStats {
  hp: number;
  atk: number;
  def: number;
  rec: number;
}

export interface UnitMaster {
  id: string;
  name: string;
  title: string;
  element: ElementType;
  rarity: RarityType;
  maxLevel: number;
  baseStats: UnitStats;
  maxStats: UnitStats;
  skillId: string;
  bbSkillId: string;
  leaderSkillDescription: string;
  leaderSkillEffect?: LeaderSkillEffect;
  awakenMaterials?: AwakenMaterial[];
  maxAwaken: number;
  awakenBonus?: UnitStats[];
  emoji: string;
  description: string;
}

export interface LeaderSkillEffect {
  target: 'all' | ElementType;
  stat: keyof UnitStats;
  multiplier: number;
}

export interface AwakenMaterial {
  itemId: string;
  quantity: number;
}

// ===== 所持ユニット =====
export interface OwnedUnit {
  instanceId: string;
  masterId: string;
  level: number;
  exp: number;
  awakenRank: number;     // 素材覚醒ランク (0〜maxAwaken)
  awakeningCount: number; // ガチャ被り覚醒カウント (0〜4)
  currentRarity: StarRarity; // 現在のレアリティ (進化で上昇)
  currentStats: UnitStats;
  isLocked: boolean;
  acquiredAt: number;
}

// ===== ガチャ結果タイプ =====
export type GachaApplyResult =
  | { type: 'new' }
  | { type: 'awakening'; awakeningCount: number }
  | { type: 'crystal' };

// ===== 敵 =====
export interface EnemyMaster {
  id: string;
  name: string;
  element: ElementType;
  stats: UnitStats;
  skillId?: string;
  dropItemIds: string[];
  expReward: number;
  emoji: string;
}

// ===== クエスト =====
export interface QuestStage {
  id: string;
  name: string;
  staminaCost: number;
  recommendedPower: number;
  waves: QuestWave[];
  rewardGold: number;
  rewardExp: number;
  rewardItems: { itemId: string; quantity: number; chance: number }[];
  isCleared?: boolean;
}

export interface QuestWave {
  enemies: { enemyId: string; level: number }[];
  isBoss?: boolean;
}

export interface QuestArea {
  id: string;
  name: string;
  description: string;
  stages: QuestStage[];
  requiredClearStageId?: string;
  emoji: string;
}

export interface QuestWorld {
  id: string;
  name: string;
  areas: QuestArea[];
}

// ===== アイテム =====
export type ItemCategory = 'material' | 'exp_potion' | 'summon_ticket' | 'stamina' | 'awaken_material';

export interface ItemMaster {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  emoji: string;
  sellPrice?: number;
}

export interface OwnedItem {
  itemId: string;
  quantity: number;
}

// ===== フレンド =====
export interface FriendCandidate {
  friendId: string;
  playerName: string;
  playerRank: number;
  leaderUnitMasterId: string;
  leaderUnitLevel: number;
  leaderUnitAwakenRank: number;
  leaderSkillDescription: string;
  lastLogin: string;
}

// ===== バトル =====
export interface BattleUnit {
  instanceId: string;
  masterId: string;
  name: string;
  element: ElementType;
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  rec: number;
  bbGauge: number;
  skillId: string;
  bbSkillId: string;
  isFriend: boolean;
  isAlly: true;
  buffs: StatusEffect[];
  emoji: string;
}

export interface BattleEnemy {
  instanceId: string;
  masterId: string;
  name: string;
  element: ElementType;
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  skillId?: string;
  isAlly: false;
  buffs: StatusEffect[];
  emoji: string;
}

export type BattleParticipant = BattleUnit | BattleEnemy;

export interface StatusEffect {
  type: SkillEffectType;
  power: number;
  remainingTurns: number;
}

export type BattleActionType = 'normal_attack' | 'skill' | 'bb_skill';

export interface BattleLog {
  turn: number;
  actorName: string;
  action: BattleActionType;
  targetNames: string[];
  damage?: number;
  heal?: number;
  isCritical?: boolean;
  elementBonus?: boolean;
}

export type BattlePhase = 'friend_select' | 'battle' | 'victory' | 'defeat';

// ===== プレイヤー =====
export interface PlayerData {
  name: string;
  rank: number;
  exp: number;
  gold: number;
  diamond: number;
  stamina: number;
  maxStamina: number;
  staminaRecoveryTime: number;
  lastLoginAt: number;
  createdAt: number;
  // プロフィール拡張 (オプション: 旧データとの互換)
  playerId?: string;
  title?: string;
  bio?: string;
  favoriteUnitInstanceId?: string | null;
  loginDays?: number;
}

// ===== プロフィール =====
export interface PlayerProfile {
  playerId: string;
  name: string;
  rank: number;
  title: string;
  bio: string;
  favoriteUnitInstanceId: string | null;
  loginDays: number;
  createdAt: number;
}

// ===== 召喚 =====
export interface SummonPool {
  id: string;
  name: string;
  description: string;
  cost1: number;
  cost10: number;
  rates: SummonRate[];
  isAvailable: boolean;
  banner?: string;
}

export interface SummonRate {
  rarity: RarityType;
  rate: number;
  unitIds: string[];
}

// ===== パーティ編成 =====
export interface PartyComposition {
  id: string;
  name: string;
  slots: (string | null)[];
  leaderId: string | null;
}

// ===== 装備システム =====
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type EquipmentRarity = 'N' | 'R' | 'SR' | 'SSR';

export interface EquipmentStats {
  hp?: number;
  atk?: number;
  def?: number;
  rec?: number;
}

export interface EquipmentMaster {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  baseStats: EquipmentStats;
  maxStats: EquipmentStats;
  maxLevel: number;
  emoji: string;
  requiredElement?: ElementType;
}

export interface OwnedEquipment {
  instanceId: string;
  masterId: string;
  level: number;
  exp: number;
  equippedTo?: string;
}

// ===== デイリーミッション =====
export type MissionType = 'login' | 'battle_win' | 'quest_clear' | 'summon' | 'enhance' | 'friend_battle';
export type MissionRewardType = 'gold' | 'diamond' | 'stamina' | 'item';

export interface MissionReward {
  type: MissionRewardType;
  amount: number;
  itemId?: string;
}

export interface MissionMaster {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  rewards: MissionReward[];
  emoji: string;
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyMissionState {
  date: string;
  progresses: MissionProgress[];
}

// ===== イベントクエスト =====
export interface EventQuest {
  id: string;
  name: string;
  description: string;
  startTimestamp: number;
  endTimestamp: number;
  stages: QuestStage[];
  emoji: string;
  bannerColor: string;
}

// ===== レイドボス =====
export interface RaidBossMaster {
  id: string;
  name: string;
  element: ElementType;
  totalHp: number;
  waves: QuestWave[];
  emoji: string;
  bannerColor: string;
  entryStaminaCost: number;
  rewards: { minDamage: number; items: string[] }[];
  endTimestamp: number;
}

export interface RaidBossState {
  bossId: string;
  currentHp: number;
  totalDamageDealt: number;
  entryCount: number;
}

// ===== ギルド =====
export interface GuildMember {
  id: string;
  name: string;
  rank: number;
  power: number;
  role: 'master' | 'officer' | 'member';
  joinedAt: number;
  isPlayer?: boolean;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  exp: number;
  emblem: string;
  members: GuildMember[];
  createdAt: number;
}

// ===== チュートリアル =====
export type GenderType = 'male' | 'female';
export type RaceType = 'human' | 'demon' | 'goddess' | 'beastkin' | 'spirit';

export interface RaceMaster {
  id: RaceType;
  name: string;
  description: string;
  emoji: string;
  traitDescription: string;
  statFocus: string;
}

export interface HeroMaster {
  heroId: string;
  name: string;
  title: string;
  gender: GenderType;
  race: RaceType;
  element: ElementType;
  emoji: string;
  description: string;
  catchphrase: string;
  unitMasterId: string;
}

export type TutorialPhase =
  | 'title'
  | 'intro'
  | 'name_input'
  | 'hero_select'
  | 'tutorial_battle'
  | 'complete';

export interface TutorialProgress {
  completed: boolean;
  phase: TutorialPhase;
  playerName: string;
  selectedHeroId: string | null;
  selectedGender: GenderType | null;
  selectedRace: RaceType | null;
}

// ===== アリーナ/PvP =====
export interface ArenaRecord {
  wins: number;
  losses: number;
  rank: number;
  points: number;
  season: number;
}

export interface ArenaOpponent {
  id: string;
  playerName: string;
  playerRank: number;
  power: number;
  leaderUnitMasterId: string;
  leaderUnitLevel: number;
  leaderUnitAwakenRank: number;
  arenaPoints: number;
}
