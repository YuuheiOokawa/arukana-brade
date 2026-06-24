import { useState } from 'react';
import { useGuildStore, PRESET_GUILDS } from '../../stores/guildStore';
import { usePlayerStore } from '../../stores/playerStore';
import { TopBar } from '../../components/layout/TopBar';

type Tab = 'home' | 'members' | 'mission' | 'chat';

export const GuildPage = () => {
  const { guild, createGuild, leaveGuild, claimGuildMission, guildMissions, guildChatMessages, sendChatMessage } = useGuildStore();
  const { player } = usePlayerStore();
  const [tab, setTab] = useState<Tab>('home');
  const [chatInput, setChatInput] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildEmblem, setNewGuildEmblem] = useState('⚔️');

  const EMBLEMS = ['⚔️', '🛡️', '🔥', '💧', '🌿', '⚡', '🌑', '🌟', '🐉', '👑'];

  if (!guild) {
    return (
      <div className="min-h-screen pb-28">
        <TopBar title="ギルド" />
        <div className="px-4 space-y-4 py-2">
          {/* ギルド未加入 */}
          <div className="card-base p-5 text-center">
            <p className="text-5xl mb-3">🏰</p>
            <p className="text-white font-bold text-lg mb-1">ギルドに参加していません</p>
            <p className="text-gray-500 text-sm">ギルドに参加してレイドに挑戦しよう！</p>
          </div>

          {/* おすすめギルド */}
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">おすすめギルド</p>
            <div className="space-y-2">
              {PRESET_GUILDS.map(pg => (
                <div key={pg.id} className="card-base p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-900/40 rounded-xl flex items-center justify-center text-2xl">
                      {pg.emblem}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{pg.name}</p>
                      <p className="text-gray-500 text-xs">{pg.description}</p>
                      <p className="text-purple-400 text-xs mt-0.5">ギルドLv {pg.level}</p>
                    </div>
                    <button
                      onClick={() => createGuild(pg.name, pg.emblem, player.name)}
                      className="btn-primary text-xs py-2 px-3 min-h-0">
                      参加
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ギルド新規作成 */}
          <div className="card-base p-4">
            <p className="text-white font-bold mb-3">🏗️ 新しいギルドを作成</p>
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
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newGuildEmblem === e ? 'bg-purple-700 border-2 border-purple-400' : 'bg-gray-800 border border-gray-700'
                    }`}>{e}</button>
                ))}
              </div>
            </div>
            <button
              disabled={!newGuildName.trim()}
              onClick={() => { if (newGuildName.trim()) createGuild(newGuildName.trim(), newGuildEmblem, player.name); }}
              className="btn-primary w-full disabled:opacity-40">
              ギルドを作成
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ギルド加入後
  const guildLevel = guild.level;
  const guildExpNeeded = guildLevel * 1000;

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="ギルド" />

      {/* ギルドヘッダー */}
      <div className="mx-4 mb-4 rounded-2xl p-4 border border-purple-800/40"
        style={{ background: 'linear-gradient(135deg, #12052a, #1a0a40)' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-purple-900/60 rounded-2xl flex items-center justify-center text-3xl">
            {guild.emblem}
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-lg">{guild.name}</p>
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
        <button onClick={leaveGuild} className="ml-auto flex-shrink-0 btn-ghost text-xs py-2 px-3 min-h-0">
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
                <div className="text-xs text-gray-500">{m.reward}</div>
                {m.progress >= m.target && !m.claimed && (
                  <button className="btn-gold text-xs py-1.5 px-2.5 min-h-0 rounded-lg"
                    onClick={() => claimGuildMission(m.id)}>受取</button>
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
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">
                {m.isPlayer ? '🧑' : m.role === 'master' ? '👑' : m.role === 'officer' ? '⭐' : '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`font-bold text-sm ${m.isPlayer ? 'text-yellow-400' : 'text-white'}`}>
                    {m.name} {m.isPlayer ? '(自分)' : ''}
                  </p>
                  <span className="text-[10px] text-gray-500">
                    {m.role === 'master' ? '👑ギルドマスター' : m.role === 'officer' ? '⭐幹部' : 'メンバー'}
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
                <span className="text-yellow-400 text-xs font-medium">{m.reward}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(1, m.progress / m.target) * 100}%` }} />
                </div>
                <span className="text-gray-500 text-xs">{m.progress}/{m.target}</span>
                {m.progress >= m.target && !m.claimed && (
                  <button className="btn-gold text-xs py-1.5 px-3 min-h-0 rounded-lg"
                    onClick={() => claimGuildMission(m.id)}>受取</button>
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
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                  {msg.sender === player.name ? '🧑' : '👤'}
                </div>
                <div className={`max-w-[70%] ${msg.sender === player.name ? 'items-end' : 'items-start'} flex flex-col`}>
                  <p className="text-gray-500 text-xs mb-0.5">{msg.sender}</p>
                  <div className={`rounded-xl px-3 py-2 text-sm ${
                    msg.sender === player.name
                      ? 'bg-purple-700/60 text-white rounded-tr-sm'
                      : 'bg-gray-800/80 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
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
            <button
              disabled={!chatInput.trim()}
              onClick={() => { if (chatInput.trim()) { sendChatMessage(player.name, chatInput.trim()); setChatInput(''); } }}
              className="btn-primary px-4 py-2.5 min-h-0 disabled:opacity-40">
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
