import { useState } from 'react';
import { GIFT_CATALOG } from '../../data/gifts';
import { useGiftStore } from '../../stores/giftStore';
import { getItemMaster } from '../../data/items';
import { getEquipmentMaster } from '../../data/equipments';
import { TopBar } from '../../components/layout/TopBar';

export const GiftBoxPage = () => {
  const { claimedIds, claimGift, claimAll, getUnclaimedCount } = useGiftStore();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const unclaimedCount = getUnclaimedCount();
  const now = Date.now();
  const gifts = GIFT_CATALOG.filter(g => !g.expiresAt || g.expiresAt > now);
  const unclaimed = gifts.filter(g => !claimedIds.includes(g.id));
  const claimed = gifts.filter(g => claimedIds.includes(g.id));

  const handleClaim = (id: string, title: string) => {
    if (claimGift(id)) showToast(`🎁 「${title}」を受け取りました！`);
  };

  const handleClaimAll = () => {
    const count = claimAll();
    if (count > 0) showToast(`🎁 ${count}件のプレゼントを受け取りました！`);
  };

  const rewardLabel = (g: typeof GIFT_CATALOG[0]) => {
    const parts: string[] = [];
    if (g.rewards.diamond) parts.push(`💎 ${g.rewards.diamond.toLocaleString()}`);
    if (g.rewards.gold) parts.push(`🪙 ${g.rewards.gold.toLocaleString()}`);
    if (g.rewards.stamina) parts.push(`⚡ ${g.rewards.stamina}`);
    g.rewards.items?.forEach(it => {
      const m = getItemMaster(it.itemId);
      parts.push(`${m?.emoji ?? '📦'} ${m?.name ?? it.itemId} ×${it.quantity}`);
    });
    g.rewards.equipments?.forEach(eqId => {
      const em = getEquipmentMaster(eqId);
      parts.push(`${em?.emoji ?? '⚔️'} ${em?.name ?? eqId}`);
    });
    return parts;
  };

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="プレゼントボックス" />

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl font-bold text-sm text-white max-w-[90%] text-center"
          style={{ background: 'rgba(217,119,6,0.95)', boxShadow: '0 4px 20px rgba(240,192,64,0.5)' }}>
          {toast}
        </div>
      )}

      {/* サマリー + 一括受取 */}
      <div className="mx-4 mb-4 rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(60,30,10,0.9), rgba(30,15,5,0.95))',
          border: '1px solid rgba(240,192,64,0.35)',
        }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-300 font-bold text-sm">🎁 未受取のプレゼント</p>
            <p className="text-white font-black text-2xl">{unclaimedCount}<span className="text-gray-500 text-sm ml-1">件</span></p>
          </div>
          {unclaimedCount > 0 && (
            <button onClick={handleClaimAll}
              className="px-4 py-2.5 rounded-xl text-sm font-black text-white active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                border: '1px solid rgba(240,192,64,0.5)',
                boxShadow: '0 0 16px rgba(240,192,64,0.3)',
              }}>
              まとめて受取
            </button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-2">
        {unclaimed.length === 0 && claimed.length === 0 && (
          <div className="card-base p-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 text-sm font-bold">プレゼントはありません</p>
          </div>
        )}

        {/* 未受取 */}
        {unclaimed.map(g => (
          <div key={g.id} className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(145deg, rgba(22,12,55,0.96), rgba(14,8,36,0.98))',
              border: '1px solid rgba(240,192,64,0.4)',
              boxShadow: '0 0 12px rgba(240,192,64,0.12)',
            }}>
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{g.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 mb-2">{g.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rewardLabel(g).map((label, i) => (
                    <span key={i} className="text-xs bg-gray-800/60 rounded px-2 py-0.5 text-gray-300 border border-gray-700/40">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleClaim(g.id, g.title)}
                className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-black text-white active:scale-95 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  border: '1px solid rgba(240,192,64,0.5)',
                }}>
                受取
              </button>
            </div>
          </div>
        ))}

        {/* 受取済み */}
        {claimed.length > 0 && (
          <>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider pt-3">受取済み</p>
            {claimed.map(g => (
              <div key={g.id} className="rounded-2xl p-4 opacity-45"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl grayscale flex-shrink-0">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 font-bold text-sm truncate">{g.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {rewardLabel(g).map((label, i) => (
                        <span key={i} className="text-[10px] text-gray-600">{label}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-emerald-600 text-xs font-bold flex-shrink-0">✓ 受取済</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
