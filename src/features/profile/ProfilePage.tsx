import { useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { getUnitMaster } from '../../data/units';
import { TopBar } from '../../components/layout/TopBar';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { formatNumber, calcTotalPower } from '../../utils/format';
import { getStarColor, getStarDisplay } from '../../data/rarityConfig';
import type { StarRarity } from '../../types';
import { TitlePlate, FrameDecoration } from '../../components/ui/game/UIDecorations';

const TITLES = [
  '駆け出しの勇者', '炎の剣士', '水の守護者', '風の疾走者',
  '大地の盾', '光の聖者', '闇の覇者', '覚醒の先駆者',
  'アルカナの使者', '天上の王者', '伝説の覇者', '絶対なる支配者',
];

export const ProfilePage = () => {
  const { player, updateProfile } = usePlayerStore();
  const { ownedUnits } = useUnitStore();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [editTitle, setEditTitle] = useState(player.title ?? '駆け出しの勇者');
  const [editBio, setEditBio] = useState(player.bio ?? '');
  const [editFav, setEditFav] = useState(player.favoriteUnitInstanceId ?? '');

  // 推しユニット
  const favUnit = ownedUnits.find(u => u.instanceId === (player.favoriteUnitInstanceId ?? ''));
  const favMaster = favUnit ? getUnitMaster(favUnit.masterId) : null;
  const favRarity: StarRarity = favUnit?.currentRarity ?? 1;

  // 総戦力
  const totalPower = ownedUnits.reduce((sum, u) => sum + calcTotalPower(u.currentStats), 0);

  // プロフィール保存
  const saveProfile = () => {
    updateProfile({
      name: editName.trim() || player.name,
      title: editTitle,
      bio: editBio,
      favoriteUnitInstanceId: editFav || null,
    });
    setEditing(false);
  };

  const playerId = player.playerId ?? 'ARC-000000';
  const loginDays = player.loginDays ?? 1;
  const title = player.title ?? '駆け出しの勇者';

  return (
    <div className="min-h-screen pb-24" style={{
      background: 'radial-gradient(ellipse at 50% -10%, #1a0838 0%, #080818 55%, #020208 100%)',
    }}>
      <TopBar title="プロフィール" />

      {/* 背景デコレーション */}
      <div className="relative overflow-hidden">
        {/* 上部オーラリング */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #8b5cf6, transparent 70%)' }} />

        {/* ===== プロフィールカード ===== */}
        <div className="px-4 pt-4 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, rgba(20,8,50,0.97), rgba(8,8,24,0.98))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.15), 0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {/* カードヘッダー帯 */}
            <div className="h-20 relative" style={{
              background: 'linear-gradient(135deg, #1a0a38 0%, #3b0764 50%, #1a0a38 100%)',
            }}>
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)',
              }} />
              {/* 魔法陣デコ */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                <svg viewBox="0 0 60 60" width="56" height="56" stroke="#c4b5fd" fill="none" strokeWidth="0.8">
                  <circle cx="30" cy="30" r="28" />
                  <circle cx="30" cy="30" r="20" />
                  <polygon points="30,4 52,42 8,42" opacity="0.6" />
                  <polygon points="30,56 8,18 52,18" opacity="0.6" />
                </svg>
              </div>
              {/* ランクバッジ */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="px-3 py-1 rounded-lg text-xs font-black"
                  style={{ background: 'rgba(255,200,80,0.2)', border: '1px solid rgba(255,200,80,0.5)', color: '#ffe48d' }}>
                  RANK {player.rank}
                </div>
              </div>
              {/* ID */}
              <div className="absolute right-16 top-2 text-xs text-gray-500">{playerId}</div>
            </div>

            <div className="px-4 pb-4">
              {/* アバター + 基本情報 */}
              <div className="flex items-end gap-4 -mt-8 mb-4">
                {/* アバターフレーム */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black relative flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #2e1065, #7c3aed)',
                    border: '2px solid rgba(139,92,246,0.7)',
                    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                  }}>
                  {(player.name[0] ?? '?').toUpperCase()}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'rgba(255,200,80,0.9)', color: '#1a0a08', fontWeight: 'black' }}>
                    {player.rank}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-8">
                  <h2 className="text-white font-black text-xl leading-tight truncate">{player.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.5)', color: '#c4b5fd' }}>
                      ◆ {title}
                    </span>
                  </div>
                </div>
              </div>

              {/* 自己紹介 */}
              {player.bio ? (
                <p className="text-gray-400 text-sm leading-relaxed mb-4 px-1">{player.bio}</p>
              ) : (
                <p className="text-gray-600 text-sm mb-4 px-1 italic">自己紹介文がありません</p>
              )}

              {/* プロフィール編集ボタン */}
              <button
                onClick={() => setEditing(true)}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.3))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd',
                }}
              >
                プロフィール編集
              </button>
            </div>
          </div>
        </div>

        {/* ===== 推しユニット ===== */}
        <div className="px-4 mb-4">
          <div className="mb-2"><TitlePlate color="purple">推しユニット</TitlePlate></div>
          <FrameDecoration color="purple">
            {favMaster && favUnit ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(67,20,150,0.4))',
                    border: `1px solid ${getStarColor(favRarity)}44`,
                    boxShadow: `0 0 16px ${getStarColor(favRarity)}22`,
                  }}>
                  {favMaster.emoji}
                </div>
                <div className="flex-1">
                  <RarityBadge rarity={favRarity} size="sm" />
                  <p className="text-white font-bold mt-1">{favMaster.name}</p>
                  <p className="text-gray-400 text-xs">{favMaster.title}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>Lv.{favUnit.level}</span>
                    <span>覚醒 {favUnit.awakeningCount ?? 0}/4</span>
                    <span style={{ color: getStarColor(favRarity) }}>{getStarDisplay(favRarity)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(40,30,60,0.8)', border: '1px dashed rgba(100,80,140,0.4)' }}>
                  ?
                </div>
                <div>
                  <p className="text-gray-500 text-sm">未設定</p>
                  <p className="text-gray-600 text-xs mt-1">編集から推しユニットを設定できます</p>
                </div>
              </div>
            )}
          </FrameDecoration>
        </div>

        {/* ===== 統計グリッド ===== */}
        <div className="px-4 mb-4">
          <div className="mb-2"><TitlePlate color="gold">統計情報</TitlePlate></div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="総戦力" value={formatNumber(totalPower)} accent="#f0c040" />
            <StatCard label="ユニット数" value={`${ownedUnits.length}体`} accent="#a78bfa" />
            <StatCard label="ログイン日数" value={`${loginDays}日`} accent="#34d399" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StatCard label="プレイヤーランク" value={`Rank ${player.rank}`} accent="#f97316" />
            <StatCard label="所持ゴールド" value={formatNumber(player.gold)} accent="#eab308" />
          </div>
        </div>

        {/* ===== 所持★分布 ===== */}
        <div className="px-4 mb-4">
          <div className="mb-2"><TitlePlate color="purple">レアリティ分布</TitlePlate></div>
          <FrameDecoration color="purple">
            {([1, 2, 3, 4, 5, 6, 7, 'CROWN'] as StarRarity[]).map(r => {
              const cnt = ownedUnits.filter(u => (u.currentRarity ?? 1) === r).length;
              if (cnt === 0) return null;
              const pct = ownedUnits.length > 0 ? cnt / ownedUnits.length * 100 : 0;
              const col = getStarColor(r);
              return (
                <div key={String(r)} className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold w-12" style={{ color: col }}>{getStarDisplay(r)}</span>
                  <div className="flex-1 h-2 bg-gray-800/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{cnt}</span>
                </div>
              );
            })}
          </FrameDecoration>
        </div>
      </div>

      {/* ===== 編集モーダル ===== */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl pb-8 pt-6 px-5"
            style={{
              background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
              border: '1px solid rgba(139,92,246,0.4)',
              maxHeight: '85vh', overflowY: 'auto',
            }}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
            <h3 className="text-white font-black text-lg mb-5 text-center">プロフィール編集</h3>

            <div className="space-y-4">
              {/* プレイヤー名 */}
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5">プレイヤー名</label>
                <input
                  type="text" maxLength={16}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                  style={{ background: 'rgba(30,15,60,0.8)', border: '1px solid rgba(139,92,246,0.3)' }}
                  placeholder="プレイヤー名 (最大16文字)"
                />
              </div>

              {/* 称号 */}
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5">称号</label>
                <div className="grid grid-cols-2 gap-2">
                  {TITLES.map(t => (
                    <button
                      key={t}
                      onClick={() => setEditTitle(t)}
                      className="text-xs py-2 px-3 rounded-lg text-left transition-all"
                      style={{
                        background: editTitle === t ? 'rgba(139,92,246,0.3)' : 'rgba(20,12,40,0.8)',
                        border: editTitle === t ? '1px solid rgba(139,92,246,0.7)' : '1px solid rgba(60,40,90,0.4)',
                        color: editTitle === t ? '#c4b5fd' : '#6b7280',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 自己紹介 */}
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5">自己紹介 (最大100文字)</label>
                <textarea
                  maxLength={100} rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none"
                  style={{ background: 'rgba(30,15,60,0.8)', border: '1px solid rgba(139,92,246,0.3)' }}
                  placeholder="自己紹介を入力..."
                />
              </div>

              {/* 推しユニット */}
              <div>
                <label className="text-gray-400 text-xs font-bold block mb-1.5">推しユニット</label>
                <div className="overflow-y-auto rounded-xl" style={{
                  maxHeight: '160px',
                  background: 'rgba(20,12,40,0.8)',
                  border: '1px solid rgba(60,40,90,0.4)',
                }}>
                  <div
                    onClick={() => setEditFav('')}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-purple-900/20"
                    style={{ borderBottom: '1px solid rgba(60,40,90,0.3)' }}
                  >
                    <span className="text-gray-500 text-sm">設定なし</span>
                    {editFav === '' && <span className="ml-auto text-purple-400 text-xs">✓</span>}
                  </div>
                  {ownedUnits.map(u => {
                    const m = getUnitMaster(u.masterId);
                    if (!m) return null;
                    const r: StarRarity = u.currentRarity ?? 1;
                    return (
                      <div
                        key={u.instanceId}
                        onClick={() => setEditFav(u.instanceId)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-purple-900/20"
                        style={{ borderBottom: '1px solid rgba(60,40,90,0.2)' }}
                      >
                        <span className="text-lg">{m.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-xs font-bold truncate block">{m.name}</span>
                          <span className="text-gray-500 text-xs">Lv.{u.level}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: getStarColor(r) }}>{getStarDisplay(r)}</span>
                        {editFav === u.instanceId && <span className="text-purple-400 text-xs ml-1">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 保存 / キャンセル */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400"
                style={{ background: 'rgba(40,30,60,0.6)', border: '1px solid rgba(100,80,140,0.3)' }}
              >
                キャンセル
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                  boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-xl p-3 text-center" style={{
    background: 'rgba(12,8,28,0.9)',
    border: `1px solid ${accent}22`,
    boxShadow: `0 0 12px ${accent}11`,
  }}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-black text-base" style={{ color: accent }}>{value}</p>
  </div>
);
