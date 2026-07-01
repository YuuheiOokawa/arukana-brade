import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Guild, GuildMember } from '../types';

const weekMondayStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().slice(0, 10);
};

// ダミーギルドメンバー
const DUMMY_MEMBERS: GuildMember[] = [
  { id: 'npc_1', name: 'アルカナの騎士', rank: 45, power: 85000, role: 'master',  joinedAt: Date.now() - 30 * 86400000 },
  { id: 'npc_2', name: '炎の魔法使い',   rank: 38, power: 72000, role: 'officer', joinedAt: Date.now() - 20 * 86400000 },
  { id: 'npc_3', name: '大地の戦士',     rank: 32, power: 61000, role: 'member',  joinedAt: Date.now() - 15 * 86400000 },
  { id: 'npc_4', name: '水の巫女',       rank: 28, power: 55000, role: 'member',  joinedAt: Date.now() - 10 * 86400000 },
  { id: 'npc_5', name: '風の踊り子',     rank: 25, power: 48000, role: 'member',  joinedAt: Date.now() -  7 * 86400000 },
  { id: 'npc_6', name: '闇の剣客',       rank: 22, power: 42000, role: 'member',  joinedAt: Date.now() -  5 * 86400000 },
  { id: 'npc_7', name: '光の聖女',       rank: 19, power: 36000, role: 'member',  joinedAt: Date.now() -  3 * 86400000 },
];

export type GuildMissionReward =
  | { type: 'diamond'; amount: number }
  | { type: 'gold'; amount: number }
  | { type: 'item'; itemId: string; amount: number };

export const GUILD_MISSIONS = [
  {
    id: 'gm_1', type: 'battle' as const, title: 'ギルドバトル5回',
    target: 5, progress: 0, reward: '💎×50', claimed: false,
    rewardData: { type: 'diamond', amount: 50 } as GuildMissionReward,
  },
  {
    id: 'gm_2', type: 'exp' as const, title: 'ギルドEXP獲得',
    target: 1000, progress: 0, reward: '🪙×5000', claimed: false,
    rewardData: { type: 'gold', amount: 5000 } as GuildMissionReward,
  },
  {
    id: 'gm_3', type: 'raid' as const, title: 'ラス討伐参加',
    target: 1, progress: 0, reward: '✨チケット×1', claimed: false,
    rewardData: { type: 'item', itemId: 'item_summon_ticket', amount: 1 } as GuildMissionReward,
  },
];

interface GuildStore {
  guild: Guild | null;
  guildMissions: typeof GUILD_MISSIONS;
  lastGuildMissionReset: string;
  guildChatMessages: { sender: string; text: string; timestamp: number }[];
  createGuild: (name: string, emblem: string, playerName: string) => void;
  leaveGuild: () => void;
  addGuildExp: (amount: number) => void;
  updateGuildMissionProgress: (type: 'battle' | 'exp' | 'raid', count?: number) => void;
  checkAndResetGuildMissions: () => void;
  sendChatMessage: (playerName: string, text: string) => void;
  claimGuildMission: (id: string) => GuildMissionReward | null;
}

const PRESET_GUILDS = [
  { id: 'guild_a', name: 'アルカナ騎士団',   description: 'レイドボス討伐を中心に活動！初心者歓迎',  level: 8, emblem: '⚔️' },
  { id: 'guild_b', name: '召喚師の集い',     description: '召喚・育成重視。まったり楽しもう！',       level: 5, emblem: '✨' },
  { id: 'guild_c', name: 'ダークファング',   description: 'アリーナ上位を目指す上級者ギルド',         level: 12, emblem: '🌑' },
];
export { PRESET_GUILDS };

export const useGuildStore = create<GuildStore>()(
  persist(
    (set, get) => ({
      guild: null,
      guildMissions: GUILD_MISSIONS,
      lastGuildMissionReset: '',
      guildChatMessages: [
        { sender: 'アルカナの騎士', text: 'ようこそ！一緒に強くなりましょう！', timestamp: Date.now() - 3600000 },
        { sender: '炎の魔法使い',   text: 'ラスボス討伐の準備ができた人は連絡を', timestamp: Date.now() - 1800000 },
        { sender: '大地の戦士',     text: '昨日のレイドお疲れ様でした！',        timestamp: Date.now() - 900000 },
      ],

      createGuild: (name, emblem, playerName) => {
        const playerMember: GuildMember = {
          id: 'player',
          name: playerName,
          rank: 1,
          power: 0,
          role: 'master',
          joinedAt: Date.now(),
          isPlayer: true,
        };
        set({
          guild: {
            id: `guild_${Date.now()}`,
            name, emblem,
            description: 'ギルドへようこそ！',
            level: 1, exp: 0,
            members: [playerMember, ...DUMMY_MEMBERS.slice(0, 4)],
            createdAt: Date.now(),
          },
        });
      },

      leaveGuild: () => set({ guild: null }),

      addGuildExp: (amount) => {
        set(s => {
          if (!s.guild) return {};
          let { level, exp } = s.guild;
          exp += amount;
          let needed = level * 1000;
          while (exp >= needed && level < 20) { exp -= needed; level++; needed = level * 1000; }
          return {
            guild: { ...s.guild, level, exp },
            guildMissions: s.guildMissions.map(m =>
              m.type === 'exp' && !m.claimed && m.progress < m.target
                ? { ...m, progress: Math.min(m.target, m.progress + amount) }
                : m
            ),
          };
        });
      },

      updateGuildMissionProgress: (type, count = 1) => {
        set(s => ({
          guildMissions: s.guildMissions.map(m =>
            m.type === type && !m.claimed && m.progress < m.target
              ? { ...m, progress: Math.min(m.target, m.progress + count) }
              : m
          ),
        }));
      },

      checkAndResetGuildMissions: () => {
        const monday = weekMondayStr();
        if (get().lastGuildMissionReset === monday) return;
        set({
          guildMissions: GUILD_MISSIONS.map(m => ({ ...m, progress: 0, claimed: false })),
          lastGuildMissionReset: monday,
        });
      },

      sendChatMessage: (playerName, text) => {
        set(s => ({
          guildChatMessages: [
            ...s.guildChatMessages,
            { sender: playerName, text, timestamp: Date.now() },
          ].slice(-50),
        }));
      },

      claimGuildMission: (id) => {
        const m = get().guildMissions.find(gm => gm.id === id);
        if (!m || m.progress < m.target || m.claimed) return null;
        set(s => ({
          guildMissions: s.guildMissions.map(gm => gm.id === id ? { ...gm, claimed: true } : gm),
        }));
        return m.rewardData;
      },
    }),
    { name: 'arcana-guild' }
  )
);
