import type { MissionMaster } from '../types';

export const DAILY_MISSIONS: MissionMaster[] = [
  {
    id: 'daily_login',
    title: 'ログイン',
    description: '今日ゲームにログインする',
    type: 'login', target: 1, emoji: '🌟',
    rewards: [{ type: 'diamond', amount: 10 }],
  },
  {
    id: 'daily_battle_3',
    title: 'バトル3回',
    description: 'クエストバトルで3回勝利する',
    type: 'battle_win', target: 3, emoji: '⚔️',
    rewards: [{ type: 'gold', amount: 2000 }, { type: 'item', amount: 1, itemId: 'item_exp_s' }],
  },
  {
    id: 'daily_quest_clear',
    title: 'クエストクリア',
    description: 'クエストを1ステージクリアする',
    type: 'quest_clear', target: 1, emoji: '🗺️',
    rewards: [{ type: 'stamina', amount: 10 }],
  },
  {
    id: 'daily_summon',
    title: '召喚1回',
    description: '召喚を1回以上行う',
    type: 'summon', target: 1, emoji: '✨',
    rewards: [{ type: 'gold', amount: 3000 }],
  },
  {
    id: 'daily_enhance',
    title: 'ユニット強化',
    description: 'ユニットを1回強化する',
    type: 'enhance', target: 1, emoji: '⬆️',
    rewards: [{ type: 'item', amount: 1, itemId: 'item_exp_m' }],
  },
  {
    id: 'daily_friend_battle',
    title: 'フレンドと出撃',
    description: 'フレンドのユニットを連れてクエストをクリアする',
    type: 'friend_battle', target: 1, emoji: '🤝',
    rewards: [{ type: 'diamond', amount: 20 }, { type: 'gold', amount: 1000 }],
  },
  {
    id: 'daily_battle_5',
    title: 'バトル5回',
    description: 'クエストバトルで5回勝利する（追加ボーナス）',
    type: 'battle_win', target: 5, emoji: '🏆',
    rewards: [{ type: 'diamond', amount: 30 }, { type: 'item', amount: 1, itemId: 'item_stamina_potion' }],
  },
];

export const WEEKLY_MISSIONS: MissionMaster[] = [
  {
    id: 'weekly_battle_20',
    title: '週間バトル20回',
    description: '1週間でバトルを20回勝利する',
    type: 'battle_win', target: 20, emoji: '⚔️',
    rewards: [{ type: 'diamond', amount: 100 }, { type: 'item', amount: 1, itemId: 'item_stamina_full' }],
  },
  {
    id: 'weekly_summon_5',
    title: '週間召喚5回',
    description: '1週間で召喚を5回行う',
    type: 'summon', target: 5, emoji: '✨',
    rewards: [{ type: 'diamond', amount: 50 }, { type: 'gold', amount: 10000 }],
  },
];
