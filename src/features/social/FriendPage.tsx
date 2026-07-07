import { useState, useEffect, useCallback } from 'react';
import { GameButton } from '../../components/ui/game/GameButton';
import { TopBar } from '../../components/layout/TopBar';
import { useAuthStore } from '../../stores/authStore';
import { UNIT_MASTER } from '../../data/units';
import { elementGradient } from '../../utils/elementUtils';

type Tab = 'list' | 'requests' | 'add';

interface FriendData {
  friendPlayerId: string;
  arcanaPlayerId: string;
  playerName: string;
  playerRank: number;
  leaderUnitMasterId: string | null;
  leaderUnitLevel: number;
  leaderUnitAwakenRank: number;
  lastLogin: string;
}

interface ReceivedRequest {
  requestId: string;
  fromPlayerId: string;
  fromArcanaPlayerId: string;
  fromPlayerName: string;
  fromPlayerRank: number;
  createdAt: string;
}

export const FriendPage = () => {
  const { player } = useAuthStore();
  const [tab, setTab] = useState<Tab>('list');
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReceivedRequest[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions?action=friends', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json() as { friends: FriendData[]; receivedRequests: ReceivedRequest[]; sentRequestCount: number };
      setFriends(data.friends ?? []);
      setReceivedRequests(data.receivedRequests ?? []);
      setSentCount(data.sentRequestCount ?? 0);
    } catch { /* offline */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchFriends(); }, [fetchFriends]);

  const handleCopyId = () => {
    if (!player?.arcanaPlayerId) return;
    void navigator.clipboard.writeText(player.arcanaPlayerId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendRequest = async () => {
    const code = addInput.trim().toUpperCase();
    if (!code) return;
    setAddLoading(true);
    setAddResult(null);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_request', arcanaPlayerId: code }),
      });
      const data = await res.json() as { ok?: boolean; autoAccepted?: boolean; targetName?: string; error?: string };
      if (!res.ok || data.error) {
        setAddResult({ type: 'error', msg: data.error ?? '申請に失敗しました' });
      } else {
        const msg = data.autoAccepted
          ? `${data.targetName ?? 'プレイヤー'} とフレンドになりました！`
          : `${data.targetName ?? 'プレイヤー'} に申請を送りました`;
        setAddResult({ type: 'success', msg });
        setAddInput('');
        void fetchFriends();
      }
    } catch {
      setAddResult({ type: 'error', msg: 'ネットワークエラーが発生しました' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleAccept = async (requestId: string, name: string) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_accept', requestId }),
      });
      if (res.ok) {
        showToast(`${name} とフレンドになりました！`);
        void fetchFriends();
      }
    } catch { /* offline */ }
  };

  const handleReject = async (requestId: string) => {
    try {
      await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_reject', requestId }),
      });
      void fetchFriends();
    } catch { /* offline */ }
  };

  const handleDelete = async (arcanaPlayerId: string, name: string) => {
    if (!window.confirm(`${name} をフレンドから削除しますか？`)) return;
    try {
      await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_delete', arcanaPlayerId }),
      });
      showToast(`${name} をフレンドから削除しました`);
      void fetchFriends();
    } catch { /* offline */ }
  };

  const pendingCount = receivedRequests.length;

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="フレンド" />

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg"
          style={{ background: 'rgba(79,70,229,0.95)', border: '1px solid rgba(139,92,246,0.5)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* 自分のID */}
      <div className="mx-4 mb-4 rounded-2xl p-4 border border-purple-800/30"
        style={{ background: 'linear-gradient(135deg, #0d0530, #1a0a40)' }}>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">あなたのフレンドID</p>
        <div className="flex items-center gap-2">
          <p className="text-yellow-400 font-black text-lg tracking-widest flex-1">
            {player?.arcanaPlayerId || '---'}
          </p>
          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(139,92,246,0.4)'}`, color: copied ? '#86efac' : '#c4b5fd' }}>
            {copied ? '✓ コピー済み' : 'コピー'}
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1">このIDを友達に教えてフレンド申請してもらおう</p>
      </div>

      {/* タブ */}
      <div className="px-4 mb-4 flex gap-1.5">
        {([['list', `フレンド (${friends.length})`], ['requests', `申請${pendingCount > 0 ? ` (${pendingCount})` : ''}`], ['add', '追加']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {label}
            {t === 'requests' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* フレンド一覧 */}
      {!loading && tab === 'list' && (
        <div className="px-4 space-y-2">
          {friends.length === 0 ? (
            <div className="card-base p-8 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-400 text-sm font-bold mb-1">フレンドがいません</p>
              <p className="text-gray-600 text-xs">「追加」タブからフレンドIDで申請しよう</p>
            </div>
          ) : (
            friends.map(f => {
              const master = f.leaderUnitMasterId ? UNIT_MASTER.find(m => m.id === f.leaderUnitMasterId) : null;
              return (
                <div key={f.friendPlayerId} className="card-base p-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: master ? elementGradient(master.element) : 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {master?.emoji ?? '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-white font-bold text-sm truncate">{f.playerName}</p>
                      <span className="text-gray-500 text-xs">Rank {f.playerRank}</span>
                    </div>
                    {master && (
                      <p className="text-gray-400 text-xs truncate">
                        {master.name} Lv.{f.leaderUnitLevel}
                        {f.leaderUnitAwakenRank > 0 && <span className="text-yellow-400 ml-1">{'★'.repeat(f.leaderUnitAwakenRank)}</span>}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mt-0.5">🕐 {f.lastLogin}</p>
                  </div>
                  <button
                    onClick={() => void handleDelete(f.arcanaPlayerId, f.playerName)}
                    className="text-gray-500 hover:text-red-400 text-xs px-3 py-2 rounded-lg transition-colors active:scale-95 flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    削除
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 申請 */}
      {!loading && tab === 'requests' && (
        <div className="px-4 space-y-3">
          {receivedRequests.length === 0 && sentCount === 0 ? (
            <div className="card-base p-8 text-center">
              <p className="text-4xl mb-3">📬</p>
              <p className="text-gray-400 text-sm font-bold mb-1">申請はありません</p>
              <p className="text-gray-600 text-xs">フレンド申請が届くとここに表示されます</p>
            </div>
          ) : (
            <>
              {receivedRequests.length > 0 && (
                <>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">受信した申請</p>
                  {receivedRequests.map(req => (
                    <div key={req.requestId} className="card-base p-3.5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-900/40 flex items-center justify-center text-xl flex-shrink-0">👤</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{req.fromPlayerName}</p>
                          <p className="text-gray-500 text-xs">Rank {req.fromPlayerRank} · {req.fromArcanaPlayerId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <GameButton variant="primary" size="sm" fullWidth onClick={() => void handleAccept(req.requestId, req.fromPlayerName)}>
                          承認
                        </GameButton>
                        <GameButton variant="secondary" size="sm" fullWidth onClick={() => void handleReject(req.requestId)}>
                          拒否
                        </GameButton>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {sentCount > 0 && (
                <div className="card-base p-4 flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <div>
                    <p className="text-gray-300 text-sm font-bold">送信済み申請: {sentCount}件</p>
                    <p className="text-gray-600 text-xs">相手が承認すると自動でフレンドになります</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 追加 */}
      {!loading && tab === 'add' && (
        <div className="px-4">
          <div className="card-base p-5">
            <p className="text-white font-bold mb-1">フレンドIDで追加</p>
            <p className="text-gray-500 text-xs mb-4">相手の「ARC-xxxxx」形式のIDを入力してください</p>
            <div className="mb-3">
              <input
                type="text"
                value={addInput}
                onChange={e => { setAddInput(e.target.value); setAddResult(null); }}
                onKeyDown={e => { if (e.key === 'Enter' && !addLoading) void handleSendRequest(); }}
                placeholder="ARC-XXXXXX"
                maxLength={20}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest outline-none focus:border-purple-500 uppercase"
              />
            </div>
            {addResult && (
              <div className={`mb-3 px-3 py-2 rounded-xl text-sm font-bold ${addResult.type === 'success' ? 'bg-green-900/40 border border-green-700/40 text-green-300' : 'bg-red-900/40 border border-red-700/40 text-red-300'}`}>
                {addResult.type === 'success' ? '✓ ' : '⚠️ '}{addResult.msg}
              </div>
            )}
            <GameButton
              variant="primary"
              fullWidth
              disabled={!addInput.trim() || addLoading}
              onClick={() => void handleSendRequest()}>
              {addLoading ? '送信中...' : '申請を送る'}
            </GameButton>
          </div>

          <div className="mt-4 card-base p-4">
            <p className="text-gray-400 text-xs font-bold mb-2">💡 フレンド機能について</p>
            <ul className="text-gray-600 text-xs space-y-1">
              <li>・フレンドのリーダーユニットをクエストで借りられます</li>
              <li>・相互申請の場合は自動でフレンドになります</li>
              <li>・フレンドは最大50人まで登録できます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
