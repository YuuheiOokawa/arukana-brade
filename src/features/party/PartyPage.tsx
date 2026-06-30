import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { UNIT_MASTER } from '../../data/units';
import { RARITY_TYPE_TO_STAR } from '../../data/rarityConfig';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { UnitIcon } from '../../components/ui/UnitCard';
import { TopBar } from '../../components/layout/TopBar';
import { resolveUnitImage } from '../../lib/unitImage';
import type { OwnedUnit } from '../../types';

const MAX_SLOTS = 5;

const elementGradient = (element: string): string => {
  const map: Record<string, string> = {
    fire: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
    water: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    wind: 'linear-gradient(135deg, #064e3b, #10b981)',
    earth: 'linear-gradient(135deg, #451a03, #92400e)',
    light: 'linear-gradient(135deg, #713f12, #ca8a04)',
    dark: 'linear-gradient(135deg, #2e1065, #7c3aed)',
    thunder: 'linear-gradient(135deg, #3b1a00, #eab308)',
  };
  return map[element] ?? 'linear-gradient(135deg,#1a1a35,#2a2a4a)';
};

export const PartyPage = () => {
  const navigate = useNavigate();
  const { setSlot, setLeader, getActiveParty } = usePartyStore();
  const { ownedUnits } = useUnitStore();

  const party = getActiveParty();

  // 存在しないユニットIDを参照している古いスロットを起動時にクリア
  useEffect(() => {
    party.slots.forEach((id, idx) => {
      if (id && !ownedUnits.find(u => u.instanceId === id)) {
        setSlot(party.id, idx, null);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filledSlots = party.slots.filter(id => id && ownedUnits.find(u => u.instanceId === id)).length;

  const getUnitInSlot = (instanceId: string | null) =>
    instanceId ? ownedUnits.find(u => u.instanceId === instanceId) : null;

  /** ユニットの現在のスロット番号（0-indexed）、未所属なら -1 */
  const getSlotIndex = (instanceId: string) =>
    party.slots.findIndex(s => s === instanceId);

  /** タップ: パーティにいれば外す、空きスロットがあれば追加 */
  const handleUnitTap = (unit: OwnedUnit) => {
    const currentSlot = getSlotIndex(unit.instanceId);
    if (currentSlot !== -1) {
      // 外す
      setSlot(party.id, currentSlot, null);
    } else {
      // 次の空きスロットに追加
      const emptySlot = party.slots.findIndex(s => s === null);
      if (emptySlot === -1) return; // 満員
      setSlot(party.id, emptySlot, unit.instanceId);
    }
  };

  // 攻撃力降順でソートして表示
  const sortedUnits = [...ownedUnits].sort((a, b) => {
    const aInParty = getSlotIndex(a.instanceId) !== -1;
    const bInParty = getSlotIndex(b.instanceId) !== -1;
    if (aInParty && !bInParty) return -1;
    if (!aInParty && bInParty) return 1;
    return b.currentStats.atk - a.currentStats.atk;
  });

  return (
    <div className="min-h-screen pb-36" style={{ background: 'radial-gradient(ellipse at top, #0a0a28 0%, #08081a 60%)' }}>
      <TopBar title="パーティ編成" />

      {/* ── パーティスロット ── */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider" style={{ color: '#8b5cf6' }}>PARTY SLOTS</span>
          <span className="text-xs" style={{ color: filledSlots === MAX_SLOTS ? '#fde68a' : '#6b7280' }}>
            {filledSlots} / {MAX_SLOTS} 体
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {party.slots.map((instanceId, idx) => {
            const unit = getUnitInSlot(instanceId);
            const master = unit ? UNIT_MASTER.find(m => m.id === unit.masterId) : null;
            const isLeader = instanceId === party.leaderId;

            return (
              <div key={idx} className="relative">
                {/* リーダーバッジ */}
                {isLeader && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-xs px-1 rounded font-black"
                    style={{ background: '#d97706', color: '#fff', fontSize: '9px' }}>
                    LEAD
                  </div>
                )}
                {/* スロット番号バッジ */}
                {!isLeader && (
                  <div className="absolute -top-1 -left-1 z-10 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: unit ? 'rgba(124,58,237,0.9)' : 'rgba(55,65,81,0.7)', fontSize: '8px', color: '#fff', fontWeight: 900 }}>
                    {idx + 1}
                  </div>
                )}

                <button
                  onClick={() => instanceId && unit && handleUnitTap(unit)}
                  disabled={!instanceId || !unit}
                  className="w-full rounded-xl overflow-hidden transition-all active:scale-90 relative"
                  style={{
                    aspectRatio: '1 / 1.3',
                    background: master ? elementGradient(master.element) : 'rgba(26,26,53,0.8)',
                    border: isLeader
                      ? '2px solid #d97706'
                      : unit
                      ? '2px solid rgba(139,92,246,0.7)'
                      : '2px dashed rgba(75,85,99,0.5)',
                    boxShadow: unit ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
                  }}>
                  {unit && master ? (
                    <>
                      <img
                        src={resolveUnitImage(unit.masterId, unit.currentRarity ?? 1)}
                        alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', position: 'absolute', inset: 0 }}
                      />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '4px 2px 2px' }}>
                        <span className="text-white text-[9px] font-bold block text-center">Lv{unit.level}</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span style={{ color: 'rgba(107,114,128,0.6)', fontSize: '22px' }}>＋</span>
                    </div>
                  )}
                </button>

                {/* リーダー設定ボタン */}
                {unit && (
                  <button
                    onClick={() => setLeader(party.id, instanceId)}
                    className="w-full text-center mt-0.5 text-xs leading-none py-0.5 transition-all active:scale-95"
                    style={{ color: isLeader ? '#d97706' : 'rgba(107,114,128,0.6)', fontSize: '10px' }}>
                    {isLeader ? '👑' : '☆'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filledSlots === 0 && (
          <p className="text-center text-xs mt-3" style={{ color: '#6b7280' }}>
            下のリストからユニットをタップして追加
          </p>
        )}
        {filledSlots > 0 && (
          <p className="text-center text-xs mt-2" style={{ color: '#6b7280' }}>
            スロットタップで外す　☆タップでリーダー設定
          </p>
        )}
      </div>

      {/* ── ユニット一覧 ── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider" style={{ color: '#6b7280' }}>
            ALL UNITS ({ownedUnits.length})
          </span>
          <span className="text-xs" style={{ color: '#4b5563' }}>ATK 降順</span>
        </div>

        {ownedUnits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-40">⚔️</div>
            <p className="text-sm" style={{ color: '#6b7280' }}>ユニットがいません</p>
            <button onClick={() => navigate('/summon')}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(124,58,237,0.6)' }}>
              召喚する
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedUnits.map(unit => {
              const master = UNIT_MASTER.find(m => m.id === unit.masterId);
              if (!master) return null;
              const slotIdx = getSlotIndex(unit.instanceId);
              const inParty = slotIdx !== -1;
              const isLeader = unit.instanceId === party.leaderId;
              const isPartyFull = filledSlots >= MAX_SLOTS;

              return (
                <button
                  key={unit.instanceId}
                  onClick={() => handleUnitTap(unit)}
                  disabled={!inParty && isPartyFull}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-98 text-left"
                  style={{
                    background: inParty
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))'
                      : 'rgba(18,18,42,0.7)',
                    border: inParty
                      ? '1.5px solid rgba(139,92,246,0.6)'
                      : '1.5px solid rgba(55,65,81,0.4)',
                    opacity: (!inParty && isPartyFull) ? 0.4 : 1,
                    boxShadow: inParty ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
                  }}>
                  {/* アイコン */}
                  <UnitIcon
                    src={resolveUnitImage(unit.masterId, unit.currentRarity ?? RARITY_TYPE_TO_STAR[master.rarity] ?? 1)}
                    fallbackEmoji={master.emoji}
                    element={master.element}
                    size={44}
                    height={64}
                  />

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <RarityBadge rarity={unit.currentRarity ?? RARITY_TYPE_TO_STAR[master.rarity] ?? 1} size="sm" />
                      <ElementBadge element={master.element} size="sm" />
                      {isLeader && (
                        <span className="text-[9px] font-black px-1 rounded"
                          style={{ background: '#d97706', color: '#fff' }}>LEAD</span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm truncate">{master.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      Lv.{unit.level} · ATK {unit.currentStats.atk.toLocaleString()}
                    </p>
                  </div>

                  {/* スロット番号 or 追加アイコン */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{
                      background: inParty ? 'rgba(124,58,237,0.6)' : 'rgba(55,65,81,0.4)',
                      color: inParty ? '#fff' : 'rgba(156,163,175,0.6)',
                      border: inParty ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(75,85,99,0.3)',
                    }}>
                    {inParty ? slotIdx + 1 : '＋'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 固定フッター：クエストへ出発 ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20"
        style={{
          background: 'linear-gradient(to top, rgba(8,8,26,0.98) 60%, transparent)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        }}>
        <div className="max-w-lg mx-auto px-4 pt-4 pb-2">

          {/* 編成サマリー（コンパクト） */}
          {filledSlots > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-1">
              {party.slots.map((id, i) => {
                const u = getUnitInSlot(id);
                const m = u ? UNIT_MASTER.find(mm => mm.id === u.masterId) : null;
                return (
                  <div key={i} className="flex-1 rounded-lg overflow-hidden relative"
                    style={{
                      height: '44px',
                      background: m ? elementGradient(m.element) : 'rgba(30,30,60,0.5)',
                      border: id === party.leaderId ? '1.5px solid #d97706' : '1px solid rgba(75,85,99,0.3)',
                    }}>
                    {u && m ? (
                      <img
                        src={resolveUnitImage(u.masterId, u.currentRarity ?? 1)}
                        alt=""
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ color: 'rgba(107,114,128,0.3)', fontSize: '12px' }}>—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/quests')}
            disabled={filledSlots === 0}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
            style={{
              background: filledSlots > 0
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'rgba(55,65,81,0.5)',
              boxShadow: filledSlots > 0 ? '0 4px 24px rgba(124,58,237,0.5)' : 'none',
              opacity: filledSlots === 0 ? 0.5 : 1,
            }}>
            {filledSlots === 0
              ? 'ユニットを選んでください'
              : `⚔️ クエストへ出発！（${filledSlots}体）`}
          </button>
        </div>
      </div>
    </div>
  );
};
