import type { PlayerData, OwnedUnit } from '../types';

export interface AchievementMaster {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  rewardDiamond: number;
  check: (p: PlayerData, units: OwnedUnit[]) => boolean;
}

export const ACHIEVEMENTS: AchievementMaster[] = [
  { id: 'first_win',   emoji: '⚔️', label: '初勝利',     desc: 'バトルで1勝',       color: '#ef4444', rewardDiamond: 20,  check: (p) => (p.battleWins ?? 0) >= 1 },
  { id: 'warrior',     emoji: '🗡️', label: '猛者',       desc: '10勝達成',          color: '#f97316', rewardDiamond: 50,  check: (p) => (p.battleWins ?? 0) >= 10 },
  { id: 'hero',        emoji: '🔥', label: '英雄',       desc: '100勝達成',         color: '#ef4444', rewardDiamond: 150, check: (p) => (p.battleWins ?? 0) >= 100 },
  { id: 'summoner_1',  emoji: '💫', label: '召喚師',     desc: '召喚10回',          color: '#8b5cf6', rewardDiamond: 30,  check: (p) => (p.summonCount ?? 0) >= 10 },
  { id: 'summoner_2',  emoji: '✨', label: '大召喚師',   desc: '召喚50回',          color: '#a855f7', rewardDiamond: 80,  check: (p) => (p.summonCount ?? 0) >= 50 },
  { id: 'explorer',    emoji: '🗺️', label: '探検家',     desc: 'クエスト10回',      color: '#f59e0b', rewardDiamond: 30,  check: (p) => (p.questClears ?? 0) >= 10 },
  { id: 'adventurer',  emoji: '🌟', label: '冒険者',     desc: 'クエスト50回',      color: '#eab308', rewardDiamond: 80,  check: (p) => (p.questClears ?? 0) >= 50 },
  { id: 'rank_10',     emoji: '🏆', label: '上級者',     desc: 'ランク10到達',      color: '#f0c040', rewardDiamond: 50,  check: (p) => p.rank >= 10 },
  { id: 'rank_50',     emoji: '👑', label: 'マスター',   desc: 'ランク50到達',      color: '#d97706', rewardDiamond: 200, check: (p) => p.rank >= 50 },
  { id: 'collector',   emoji: '👥', label: 'コレクター', desc: '10体獲得',          color: '#3b82f6', rewardDiamond: 50,  check: (_, u) => u.length >= 10 },
  { id: 'collector_2', emoji: '🏛️', label: '大収集家',  desc: '30体獲得',          color: '#2563eb', rewardDiamond: 100, check: (_, u) => u.length >= 30 },
  { id: 'veteran',     emoji: '📅', label: '常連',       desc: '7日間ログイン',     color: '#10b981', rewardDiamond: 60,  check: (p) => (p.loginDays ?? 0) >= 7 },
];
