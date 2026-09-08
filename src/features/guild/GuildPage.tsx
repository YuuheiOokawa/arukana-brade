import { useState, useEffect, useCallback } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { useGuildStore, PRESET_GUILDS } from '../../stores/guildStore';
import { usePlayerStore } from '../../stores/playerStore';
import { TopBar } from '../../components/layout/TopBar';
import { GuildEmblem, MemberIcon, RewardIcon } from '../../components/ui/GameGlyphs';
import { getItemMaster } from '../../data/items';
import { Icon } from '../../components/ui/Icon';

type Tab = 'home' | 'members' | 'mission' | 'chat';

interface ApiGuild {
  id: string;
  name: string;
  emblem: string;
  description: string;
  level: number;
  exp: number;
  members: { id: string; playerId: string; role: string; joinedAt: string }[];
}

export const GuildPage = () => {
  const {
    guild, createGuild, hydrateGuildFromServer, leaveGuild,
    claimGuildMission, guildMissions, guildChatMessages,
    sendChatMessage, checkAndResetGuildMissions,
  } = useGuildStore();
  const { player, addItem, addGold } = usePlayerStore();

  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [chatInput, setChatInput] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildEmblem, setNewGuildEmblem] = useState('⚔️');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    checkAndResetGuildMissions();
  }, [checkAndResetGuildMissions]);

  // 起動時にサーバーからギルド情報を取得してローカルストアに反映
  const fetchGuildFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/actions?action=guild', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json() as { guild: ApiGuild | null };
      if (data.guild && !guild) {
        // サーバー側にギルドがあるのにローカルにない場合は同期
        // (createGuild だと level/exp が毎回 1/0 にリセットされてしまうため、
        //  既存ギルドの復元には hydrateGuildFromServer を使う)
        hydrateGuildFromServer(data.guild, player.name);
      }
    } catch { /* offline時はlocalStorage継続 */ }
  }, [guild, hydrateGuildFromServer, player.name]);

  useEffect(() => {
    void fetchGuildFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaimMission = (id: string) => {
    const reward = claimGuildMission(id);
    if (!reward) return;
    let msg = '';
    if (reward.type === 'diamond') {
      usePlayerStore.getState().addDiamond(reward.amount);
      msg = `ダイヤ ${reward.amount}個を獲得しました`;
    } else if (reward.type === 'gold') {
      addGold(reward.amount);
      msg = `ゴールド ${reward.amount.toLocaleString()}Gを獲得しました`;
    } else if (reward.type === 'item') {
      addItem(reward.itemId, reward.amount);
      msg = `${getItemMaster(reward.itemId)?.name ?? 'アイテム'}を獲得しました`;
    }
    setRewardToast(msg);
    setTimeout(() => setRewardToast(null), 3000);
  };

  const handleCreateGuild = async () => {
    const name = newGuildName.trim();
    if (!name) return;
    setApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guild_create', name, emblem: newGuildEmblem }),
      });
      const data = await res.json() as { guild?: ApiGuild; error?: string };
      if (!res.ok || data.error) {
        setApiError(data.error ?? 'ギルド作成に失敗しました');
        // APIが失敗してもローカルには保存する
        createGuild(name, newGuildEmblem, player.name);
      } else if (data.guild) {
        createGuild(data.guild.name, data.guild.emblem, player.name);
      }
    } catch {
      // オフライン時はローカルのみ保存
      createGuild(name, newGuildEmblem, player.name);
    } finally {
      setApiLoading(false);
    }
  };

  const handleJoinPreset = async (pg: typeof PRESET_GUILDS[0]) => {
    setApiLoading(true);
    setApiError(null);
    try {
      // プリセットギルドはサーバーにまだ存在しないため create → join の代わりに
      // サーバー側でギルドを作成してから参加する
      const createRes = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guild_create', name: pg.name, emblem: pg.emblem }),
      });
      if (!createRes.ok) {
        // APIエラーでもローカルには参加
        createGuild(pg.name, pg.emblem, player.name);
        return;
      }
      const data = await createRes.json() as { guild?: ApiGuild };
      if (data.guild) createGuild(data.guild.name, data.guild.emblem, player.name);
      else createGuild(pg.name, pg.emblem, player.name);
    } catch {
      createGuild(pg.name, pg.emblem, player.name);
    } finally {
      setApiLoading(false);
    }
  };

  const handleLeaveGuild = async () => {
    try {
      await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guild_leave' }),
      });
    } catch { /* offline時はローカルのみ */ }
    leaveGuild();
  };

  const EMBLEMS = ['⚔️', '🛡️', '🔥', '💧', '🌿', '⚡', '🌑', '🌟', '🐉', '👑'];

  if (!guild) {
    return (
      <div className="game-page min-h-screen pb-28">
        <TopBar title="ギルド" />
        <div className="px-4 space-y-4 py-2">
          <div className="card-base p-5 text-center">
            <span className="mx-auto mb-4 guild-emblem guild-emblem-gold" style={{width:72,height:72}}><Icon name="guild" size={34}/></span>
            <p className="text-white font-bold text-lg mb-1">ギルドに参加していません</p>
            <p className="text-gray-500 text-sm">ギルドに参加してレイドに挑戦しよう！</p>
          </div>

          {apiError && (
            <div className="px-4 py-2 rounded-xl bg-red-900/40 border border-red-700/40 text-red-300 text-sm">{apiError}</div>
          )}

          {/* おすすめギルド */}
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">おすすめギルド</p>
            <div className="space-y-2">
              {PRESET_GUILDS.map(pg => (
                <div key={pg.id} className="card-base p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-900/40 rounded-xl flex items-center justify-center text-2xl">
                      <GuildEmblem emblem={pg.emblem} size={48}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{pg.name}</p>
                      <p className="text-gray-500 text-xs truncate">{pg.description}</p>
                      <p className="text-purple-400 text-xs mt-0.5">ギルドLv {pg.level}</p>
                    </div>
                    <GameButton variant="primary" size="sm"
                      disabled={apiLoading}
                      onClick={() => void handleJoinPreset(pg)}>
                      {apiLoading ? '...' : '参加'}
                    </GameButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ギルド新規作成 */}
          <div className="card-base p-4">
            <p className="text-white font-bold mb-3 flex items-center gap-2"><Icon name="guild" size={20}/>新しいギルドを作成</p>
            <div className="mb-3">
              <p className="text-gray-500 text-xs mb-1">ギルド名</p>
              <input
                type="text" value={newGuildName} onChange={e => setNewGuildName(e.target.value)}
                placeholder="ギルド名を入力..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-2">エンブレム</p>
              <div className="flex gap-2 flex-wrap">
                {EMBLEMS.map(e => (
                  <button key={e} onClick={() => setNewGuildEmblem(e)}
                    aria-label={`エンブレム ${EMBLEMS.indexOf(e) + 1}`}
                    className="rounded-xl flex items-center justify-center transition-all"><GuildEmblem emblem={e} size={40} selected={newGuildEmblem === e}/></button>
                ))}
              </div>
            </div>
            <GameButton variant="primary" fullWidth
              disabled={!newGuildName.trim() || apiLoading}
              onClick={() => void handleCreateGuild()}>
              {apiLoading ? '作成中...' : 'ギルドを作成'}
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  // ギルド加入後
  const guildLevel = guild.level;
  const guildExpNeeded = guildLevel * 1000;

  return (
    <div className="game-page min-h-screen pb-28">
      <TopBar title="ギルド" />
      {rewardToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-yellow-900/90 border border-yellow-600 text-yellow-200 text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
          {rewardToast}
        </div>
      )}

      {/* ギルドヘッダー */}
      <div className="guild-hero mx-4 mb-4 rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, #12052a, #1a0a40)' }}>
        <div className="flex items-center gap-3">
          <GuildEmblem emblem={guild.emblem} size={58}/>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg truncate">{guild.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-purple-400 text-xs font-bold">Lv {guildLevel}</span>
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(guild.exp / guildExpNeeded) * 100}%` }} />
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">メンバー {guild.members.length}人</p>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="px-4 mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {([['home', 'ホーム'], ['members', 'メンバー'], ['mission', 'ミッション'], ['chat', 'チャット']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {label}
          </button>
        ))}
        <button onClick={() => void handleLeaveGuild()} className="ml-auto flex-shrink-0 btn-ghost text-xs py-2 px-3 min-h-0">
          脱退
        </button>
      </div>

      {/* ホーム */}
      {tab === 'home' && (
        <div className="px-4 space-y-3">
          <div className="card-base p-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">ギルドミッション達成状況</p>
            {guildMissions.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-700/30 last:border-0">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{m.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(1, m.progress / m.target) * 100}%` }} />
                    </div>
                    <span className="text-gray-500 text-xs">{m.progress}/{m.target}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><RewardIcon type={m.reward.includes('G') ? 'gold' : 'diamond'} size={14}/>{m.reward}</div>
                {m.progress >= m.target && !m.claimed && (
                  <GameButton variant="gold" size="sm" onClick={() => handleClaimMission(m.id)}>受取</GameButton>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* メンバー */}
      {tab === 'members' && (
        <div className="px-4 space-y-2">
          {guild.members.map(m => (
            <div key={m.id} className={`card-base p-3.5 flex items-center gap-3 ${m.isPlayer ? 'border-yellow-600/30' : ''}`}>
              <MemberIcon role={m.role} self={m.isPlayer}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className={`font-bold text-sm truncate ${m.isPlayer ? 'text-yellow-400' : 'text-white'}`}>
                    {m.name} {m.isPlayer ? '(自分)' : ''}
                  </p>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">
                    {m.role === 'master' ? 'ギルドマスター' : m.role === 'officer' ? '幹部' : 'メンバー'}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">Rank {m.rank} · 戦力 {m.power.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ミッション */}
      {tab === 'mission' && (
        <div className="px-4 space-y-2">
          {guildMissions.map(m => (
            <div key={m.id} className={`card-base p-4 ${m.claimed ? 'opacity-50' : ''}`}>
              <div className="flex justify-between mb-2">
                <p className={`font-bold text-sm ${m.claimed ? 'line-through text-gray-500' : 'text-white'}`}>{m.title}</p>
                <span className="text-yellow-400 text-xs font-medium flex items-center gap-1"><RewardIcon type={m.reward.includes('G') ? 'gold' : 'diamond'} size={14}/>{m.reward}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(1, m.progress / m.target) * 100}%` }} />
                </div>
                <span className="text-gray-500 text-xs">{m.progress}/{m.target}</span>
                {m.progress >= m.target && !m.claimed && (
                  <GameButton variant="gold" size="sm" onClick={() => handleClaimMission(m.id)}>受取</GameButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* チャット */}
      {tab === 'chat' && (
        <div className="px-4 flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 scrollbar-hide">
            {[...guildChatMessages].reverse().map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.sender === player.name ? 'flex-row-reverse' : ''}`}>
                <MemberIcon role="member" self={msg.sender === player.name}/>
                <div className={`max-w-[70%] ${msg.sender === player.name ? 'items-end' : 'items-start'} flex flex-col`}>
                  <p className="text-gray-500 text-xs mb-0.5">{msg.sender}</p>
                  <div className={`rounded-xl px-3 py-2 text-sm ${
                    msg.sender === player.name
                      ? 'bg-purple-700/60 text-white rounded-tr-sm'
                      : 'bg-gray-800/80 text-gray-200 rounded-tl-sm'
                  }`}>{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { sendChatMessage(player.name, chatInput.trim()); setChatInput(''); } }}
              placeholder="メッセージを入力..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500"
            />
            <GameButton variant="primary" size="sm"
              disabled={!chatInput.trim()}
              onClick={() => { if (chatInput.trim()) { sendChatMessage(player.name, chatInput.trim()); setChatInput(''); } }}>
              送信
            </GameButton>
          </div>
        </div>
      )}
    </div>
  );
};
