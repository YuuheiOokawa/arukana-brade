import { useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { TopBar } from '../../components/layout/TopBar';

type ShopTab = 'stamina' | 'items' | 'diamond';

const STAMINA_PACKS = [
  { id: 'sp1', label: 'スタミナ回復(小)', amount: 20,  diamondCost: 10,  emoji: '⚡' },
  { id: 'sp2', label: 'スタミナ回復(中)', amount: 50,  diamondCost: 20,  emoji: '⚡' },
  { id: 'sp3', label: 'スタミナ全回復',   amount: -1,  diamondCost: 50,  emoji: '✨' },
];

const ITEM_SHOP = [
  { id: 'is1', label: '経験値の雫(小)',  itemId: 'item_exp_s',  quantity: 10, diamondCost: 30,  goldCost: 0,      emoji: '💧' },
  { id: 'is2', label: '経験値の雫(中)',  itemId: 'item_exp_m',  quantity: 5,  diamondCost: 50,  goldCost: 0,      emoji: '💦' },
  { id: 'is3', label: '経験値の雫(大)',  itemId: 'item_exp_l',  quantity: 3,  diamondCost: 100, goldCost: 0,      emoji: '🌊' },
  { id: 'is4', label: 'スタミナポーション', itemId: 'item_stamina_potion', quantity: 3, diamondCost: 80, goldCost: 0, emoji: '🧪' },
  { id: 'is5', label: '召喚チケット',    itemId: 'item_summon_ticket', quantity: 1, diamondCost: 150, goldCost: 0, emoji: '🎟️' },
  { id: 'is6', label: '覚醒結晶',       itemId: 'item_awakening_crystal', quantity: 1, diamondCost: 200, goldCost: 0, emoji: '💎' },
  { id: 'is7', label: '強化素材セット', itemId: 'item_stone_core', quantity: 10, diamondCost: 0, goldCost: 50000, emoji: '🪨' },
  { id: 'is8', label: '魔法結晶',       itemId: 'item_magic_crystal', quantity: 5, diamondCost: 0, goldCost: 30000, emoji: '🔮' },
];

const DIAMOND_PACKS = [
  { id: 'dp1', label: 'お試しパック',    amount: 60,   price: '¥120',   emoji: '💎', bonus: '' },
  { id: 'dp2', label: 'スタートパック',  amount: 330,  price: '¥490',   emoji: '💎', bonus: '+30 bonus' },
  { id: 'dp3', label: 'スタンダード',    amount: 980,  price: '¥1,490', emoji: '💎', bonus: '+80 bonus' },
  { id: 'dp4', label: 'バリューパック',  amount: 1980, price: '¥2,980', emoji: '💎', bonus: '+200 bonus' },
];

export const ShopPage = () => {
  const { player, addItem } = usePlayerStore();
  const [tab, setTab] = useState<ShopTab>('stamina');
  const [message, setMessage] = useState('');
  const [buying, setBuying] = useState(false);
  const [goldQty, setGoldQty] = useState<1 | 5 | 10>(1);

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 2500); };

  const buyStamina = async (pack: typeof STAMINA_PACKS[0]) => {
    if (buying) return;
    if (player.diamond < pack.diamondCost) { showMsg('ダイヤが不足しています'); return; }
    setBuying(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shop_stamina', packId: pack.id }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; diamond?: number; stamina?: number; staminaAdded?: number };
      if (!res.ok || !data.ok) { showMsg(data.error ?? '購入に失敗しました'); return; }
      usePlayerStore.setState(s => ({
        player: { ...s.player, diamond: data.diamond ?? s.player.diamond, stamina: data.stamina ?? s.player.stamina },
      }));
      showMsg(`⚡ スタミナ +${data.staminaAdded} 回復！`);
    } catch {
      showMsg('通信エラーが発生しました');
    } finally {
      setBuying(false);
    }
  };

  const buyItem = async (shop: typeof ITEM_SHOP[0], qty = 1) => {
    if (buying) return;
    const totalCost = shop.diamondCost > 0 ? shop.diamondCost * qty : shop.goldCost * qty;
    const hasEnough = shop.diamondCost > 0 ? player.diamond >= totalCost : player.gold >= totalCost;
    if (!hasEnough) { showMsg(shop.diamondCost > 0 ? 'ダイヤが不足しています' : 'ゴールドが不足しています'); return; }
    setBuying(true);
    let totalQty = 0;
    try {
      for (let i = 0; i < qty; i++) {
        const res = await fetch('/api/actions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'shop_item', packId: shop.id }),
        });
        const data = await res.json() as { ok?: boolean; error?: string; diamond?: number; gold?: number; itemId?: string; quantityAdded?: number };
        if (!res.ok || !data.ok) { showMsg(data.error ?? '購入に失敗しました'); return; }
        usePlayerStore.setState(s => ({
          player: { ...s.player, diamond: data.diamond ?? s.player.diamond, gold: data.gold ?? s.player.gold },
        }));
        if (data.itemId && data.quantityAdded) { addItem(data.itemId, data.quantityAdded); totalQty += data.quantityAdded; }
      }
      showMsg(`${shop.emoji} ${shop.label} ×${totalQty} 獲得！`);
    } catch {
      showMsg('通信エラーが発生しました');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0820 0%, #080818 60%)' }}>
      <TopBar title="ショップ" />

      {/* トースト */}
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl font-bold text-sm text-white"
          style={{ background: 'rgba(139,92,246,0.9)', boxShadow: '0 4px 20px rgba(139,92,246,0.5)' }}>
          {message}
        </div>
      )}

      {/* タブ */}
      <div className="flex px-4 gap-1 py-3">
        {([['stamina', '⚡ スタミナ'], ['items', '🛍️ アイテム'], ['diamond', '💎 ダイヤ']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tab === t ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.05)',
              color: tab === t ? '#fff' : '#6b7280',
              border: tab === t ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.07)',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {/* スタミナタブ */}
        {tab === 'stamina' && (
          <>
            <div className="rounded-xl p-3 text-center mb-2"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <p className="text-emerald-400 font-bold text-sm">⚡ 現在のスタミナ</p>
              <p className="text-white font-black text-2xl">{player.stamina} <span className="text-gray-500 text-base">/ {player.maxStamina}</span></p>
            </div>
            {STAMINA_PACKS.map(pack => {
              const canAfford = player.diamond >= pack.diamondCost;
              return (
                <button key={pack.id} onClick={() => buyStamina(pack)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${canAfford ? 'active:scale-98' : 'opacity-50'}`}
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}` }}>
                  <span className="text-2xl">{pack.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{pack.label}</p>
                    <p className="text-emerald-400 text-xs">{pack.amount === -1 ? '全回復' : `+${pack.amount} スタミナ`}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)' }}>
                    <span className="text-blue-300 text-xs font-black">💎 {pack.diamondCost}</span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* アイテムタブ */}
        {tab === 'items' && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-1">
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <span className="text-base">💎</span>
                <div><p className="text-[9px] text-gray-500 font-bold">所持ダイヤ</p>
                  <p className="text-sm font-black text-blue-300">{player.diamond.toLocaleString()}</p></div>
              </div>
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.2)' }}>
                <span className="text-base">🪙</span>
                <div><p className="text-[9px] text-gray-500 font-bold">所持ゴールド</p>
                  <p className="text-sm font-black text-yellow-400">{player.gold.toLocaleString()}</p></div>
              </div>
            </div>
            {/* ゴールドアイテム用：数量選択 */}
            {ITEM_SHOP.some(s => s.goldCost > 0) && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500 text-xs">数量:</span>
                {([1, 5, 10] as const).map(q => (
                  <button key={q} onClick={() => setGoldQty(q)}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: goldQty === q ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.05)',
                      color: goldQty === q ? '#fff' : '#6b7280',
                      border: goldQty === q ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    }}>
                    ×{q}
                  </button>
                ))}
                <span className="text-gray-600 text-[10px] ml-1">※ゴールド購入のみ対応</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {ITEM_SHOP.map(shop => {
                const qty = shop.goldCost > 0 ? goldQty : 1;
                const totalCost = shop.diamondCost > 0 ? shop.diamondCost : shop.goldCost * qty;
                const canAfford = shop.diamondCost > 0 ? player.diamond >= shop.diamondCost : player.gold >= totalCost;
                return (
                  <button key={shop.id} onClick={() => buyItem(shop, qty)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${canAfford ? 'active:scale-95' : 'opacity-50'}`}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}` }}>
                    <span className="text-3xl">{shop.emoji}</span>
                    <div className="text-center">
                      <p className="text-white text-xs font-bold leading-tight">{shop.label}</p>
                      <p className="text-gray-500 text-[10px]">×{shop.goldCost > 0 && qty > 1 ? `${shop.quantity * qty} (×${qty})` : shop.quantity}</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg text-xs font-black"
                      style={{
                        background: shop.diamondCost > 0 ? 'rgba(96,165,250,0.2)' : 'rgba(245,158,11,0.2)',
                        border: shop.diamondCost > 0 ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(245,158,11,0.4)',
                        color: shop.diamondCost > 0 ? '#93c5fd' : '#fbbf24',
                      }}>
                      {shop.diamondCost > 0 ? `💎 ${shop.diamondCost}` : `🪙 ${((shop.goldCost * qty) / 1000).toFixed(0)}K`}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ダイヤタブ */}
        {tab === 'diamond' && (
          <>
            <div className="rounded-xl p-3 text-center mb-2"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
              <p className="text-blue-400 font-bold text-sm">💎 所持ダイヤ</p>
              <p className="text-white font-black text-2xl">{player.diamond.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4 mb-2 text-center"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <p className="text-purple-300 font-bold text-sm mb-1">🔒 近日公開予定</p>
              <p className="text-gray-500 text-xs">課金機能は現在準備中です。<br />リリース後にお使いいただけます。</p>
            </div>
            {DIAMOND_PACKS.map(pack => (
              <div key={pack.id} className="flex items-center gap-3 p-4 rounded-xl opacity-50 pointer-events-none select-none"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(96,165,250,0.1)' }}>
                <span className="text-3xl grayscale">{pack.emoji}</span>
                <div className="flex-1">
                  <p className="text-gray-400 font-bold text-sm">{pack.label}</p>
                  <p className="text-gray-500 text-xs font-bold">💎 {pack.amount.toLocaleString()}
                    {pack.bonus && <span className="text-gray-600 ml-1">{pack.bonus}</span>}
                  </p>
                </div>
                <div className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500"
                  style={{ background: 'rgba(55,65,81,0.5)', border: '1px solid rgba(75,85,99,0.4)' }}>
                  準備中
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
