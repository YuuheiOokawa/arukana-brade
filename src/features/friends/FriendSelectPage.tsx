import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameButton } from '../../components/ui/game/GameButton';
import { FRIEND_CANDIDATES } from '../../data/friends';
import { UNIT_MASTER } from '../../data/units';
import { useQuestStore } from '../../stores/questStore';
import { usePlayerStore } from '../../stores/playerStore';
import { getStage } from '../../data/quests';
import { getEventStage, getRaidStage } from '../../data/events';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { TopBar } from '../../components/layout/TopBar';
import type { FriendCandidate } from '../../types';

interface DbFriendRaw {
  friendPlayerId: string;
  arcanaPlayerId: string;
  playerName: string;
  playerRank: number;
  leaderUnitMasterId: string | null;
  leaderUnitLevel: number;
  leaderUnitAwakenRank: number;
  lastLogin: string;
}

export const FriendSelectPage = () => {
  const navigate = useNavigate();
  const { pendingStageId, setPendingFriend } = useQuestStore();
  const { lastUsedFriendId } = usePlayerStore();
  const [selected, setSelected] = useState<string | null>(lastUsedFriendId);
  const [noSelectionError, setNoSelectionError] = useState(false);
  const [dbFriends, setDbFriends] = useState<FriendCandidate[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // 通常クエストに加え、イベントクエスト/レイドのステージIDも解決する
  // (以前は getStage のみだったため、イベントクエストを選ぶと該当ステージが
  //  見つからず即座にクエスト画面へ戻されてしまっていた)
  const stage = pendingStageId
    ? getStage(pendingStageId) ?? getEventStage(pendingStageId) ?? getRaidStage(pendingStageId)
    : null;

  // DBフレンドを取得してFriendCandidate形式に変換
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/actions?action=friends', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json() as { friends: DbFriendRaw[] };
        const converted: FriendCandidate[] = (data.friends ?? []).map(f => ({
          friendId: f.arcanaPlayerId,
          playerName: f.playerName,
          playerRank: f.playerRank,
          leaderUnitMasterId: f.leaderUnitMasterId ?? 'unit_001',
          leaderUnitLevel: f.leaderUnitLevel,
          leaderUnitAwakenRank: f.leaderUnitAwakenRank,
          leaderSkillDescription: 'フレンド参戦中',
          lastLogin: f.lastLogin,
        }));
        setDbFriends(converted);
      } catch { /* offline: use static only */ } finally {
        setLoadingDb(false);
      }
    };
    void load();
  }, []);

  // レンダー中に navigate() を呼ぶとReactの警告や不安定な挙動の原因になるため、
  // 副作用として useEffect 内で行う
  useEffect(() => {
    if (!stage) navigate('/quests', { replace: true });
  }, [stage, navigate]);

  const handleConfirm = () => {
    if (!selected) {
      setNoSelectionError(true);
      setTimeout(() => setNoSelectionError(false), 2500);
      return;
    }
    // DBフレンドかどうかで候補データを検索
    const dbCandidate = dbFriends.find(f => f.friendId === selected);
    const staticCandidate = FRIEND_CANDIDATES.find(f => f.friendId === selected);
    const candidate = dbCandidate ?? staticCandidate ?? null;

    setPendingFriend(selected, candidate);
    usePlayerStore.getState().setLastUsedFriend(selected);
    navigate('/battle');
  };

  const handleSkip = () => {
    setPendingFriend(null, null);
    navigate('/battle');
  };

  if (!stage) {
    // 実際の遷移は上の useEffect が行う。ここでは何も描画しないだけ。
    return null;
  }

  // DBフレンドを上位に、静的フレンドをその下に表示（重複IDは除外）
  const dbFriendIds = new Set(dbFriends.map(f => f.friendId));
  const allFriends = [
    ...dbFriends.map(f => ({ ...f, isDbFriend: true })),
    ...FRIEND_CANDIDATES.filter(f => !dbFriendIds.has(f.friendId)).map(f => ({ ...f, isDbFriend: false })),
  ];

  return (
    <div className="min-h-screen pb-24">
      <TopBar onBack={() => navigate('/quests')} title="フレンド選択" />

      {/* クエスト情報 */}
      <div className="px-4 mb-4">
        <div className="card-base p-3 border-purple-700/40">
          <p className="text-gray-400 text-xs mb-1">選択中のクエスト</p>
          <p className="text-white font-bold">{stage.name}</p>
          <div className="flex gap-3 text-xs text-gray-400 mt-1">
            <span>⚡ {stage.staminaCost}</span>
            <span>🪙 {stage.rewardGold.toLocaleString()}</span>
            <span>✨ EXP {stage.rewardExp}</span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-300 font-bold text-sm">フレンドを選択</h3>
          <p className="text-gray-500 text-xs">{loadingDb ? '読込中...' : `${allFriends.length}人`}</p>
        </div>

        {dbFriends.length > 0 && (
          <p className="text-purple-400 text-xs font-bold mb-2 uppercase tracking-wider">👥 フレンド</p>
        )}

        <div className="space-y-3">
          {allFriends.map((friend, idx) => {
            const leaderMaster = UNIT_MASTER.find(u => u.id === friend.leaderUnitMasterId);
            const isSelected = selected === friend.friendId;
            const isLastUsed = lastUsedFriendId === friend.friendId;
            const showSeparator = !friend.isDbFriend && dbFriends.length > 0 && idx === dbFriends.length;

            return (
              <div key={friend.friendId}>
                {showSeparator && (
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mt-4 mb-2">おすすめ</p>
                )}
                <button
                  onClick={() => setSelected(friend.friendId)}
                  className={`w-full card-base p-3 text-left transition-all active:scale-98 ${
                    isSelected ? 'ring-2 ring-yellow-400 border-yellow-700/60' : 'hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
                      style={{ background: leaderMaster ? elementGradient(leaderMaster.element) : '#1a1a35' }}>
                      {leaderMaster?.emoji ?? '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-sm truncate">{friend.playerName}</p>
                        {friend.isDbFriend && (
                          <span className="text-xs bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded flex-shrink-0">フレンド</span>
                        )}
                        {isLastUsed && (
                          <span className="text-xs bg-blue-800 text-blue-300 px-1.5 py-0.5 rounded flex-shrink-0">前回</span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto flex-shrink-0">Rank {friend.playerRank}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {leaderMaster && <ElementBadge element={leaderMaster.element} size="sm" />}
                        <p className="text-gray-200 text-sm font-medium">{leaderMaster?.name ?? '不明'}</p>
                      </div>

                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>Lv.{friend.leaderUnitLevel}</span>
                        {friend.leaderUnitAwakenRank > 0 && (
                          <span className="text-yellow-400">{'★'.repeat(friend.leaderUnitAwakenRank)}</span>
                        )}
                      </div>

                      <div className="mt-1 bg-gray-800/50 rounded px-2 py-1">
                        <p className="text-xs text-purple-300">👑 {friend.leaderSkillDescription}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                    <p className="text-xs text-gray-500">🕐 {friend.lastLogin}</p>
                    {isSelected && <span className="text-yellow-400 text-sm font-bold">✓ 選択中</span>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 決定ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 space-y-2"
        style={{ background: 'linear-gradient(to top, #0a0a1a 60%, transparent)' }}>
        {noSelectionError && (
          <div className="rounded-xl px-3 py-2 text-sm text-red-400 font-bold text-center"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            ⚠️ フレンドを選択してください
          </div>
        )}
        <GameButton variant="gold" fullWidth onClick={handleConfirm}>
          ⚔️ バトル開始
        </GameButton>
        <button onClick={handleSkip} className="w-full text-gray-500 text-sm py-2">
          フレンドなしで始める
        </button>
      </div>
    </div>
  );
};

const elementGradient = (element: string): string => {
  const map: Record<string, string> = {
    fire: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
    water: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    wind: 'linear-gradient(135deg, #064e3b, #10b981)',
    earth: 'linear-gradient(135deg, #451a03, #92400e)',
    light: 'linear-gradient(135deg, #713f12, #ca8a04)',
    dark: 'linear-gradient(135deg, #2e1065, #7c3aed)',
  };
  return map[element] ?? '';
};
