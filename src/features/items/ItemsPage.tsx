import { useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { getUnitMaster } from '../../data/units';
import { ITEM_MASTER, getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import { getLevelCap } from '../../data/rarityConfig';
import type { ItemMaster } from '../../types';

const EXP_MAP: Record<string, number> = {
  item_exp_s: 500,
  item_exp_m: 2000,
  item_exp_l: 8000,
  item_exp_xl: 30000,
  item_exp_medal: 10000,
  item_star_of_wisdom: 50000,
  item_exp_xxl: 100000,
  item_exp_tome: 20000,
};

type Category = 'all' | 'stamina' | 'exp_potion' | 'material' | 'awaken_material' | 'summon_ticket';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',             label: 'すべて',   emoji: '📦' },
  { id: 'stamina',         label: 'スタミナ', emoji: '⚡' },
  { id: 'exp_potion',      label: '経験値',   emoji: '💧' },
  { id: 'awaken_material', label: '覚醒',     emoji: '✨' },
  { id: 'material',        label: '素材',     emoji: '🦷' },
  { id: 'summon_ticket',   label: 'チケット', emoji: '🎫' },
];

export const ItemsPage = () => {
  const { player, items, useItem, addGold } = usePlayerStore();
  const { ownedUnits, levelUpUnit } = useUnitStore();
  const { addDailyProgress, addWeeklyProgress } = useMissionStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [expModal, setExpModal] = useState<{ itemId: string; exp: number; name: string } | null>(null);
  const [sellModal, setSellModal] = useState<{ master: ItemMaster; owned: number } | null>(null);
  const [sellQty, setSellQty] = useState(1);

  const ownedItems = items
    .filter(i => i.quantity > 0)
    .map(i => ({ ownedItem: i, master: getItemMaster(i.itemId) }))
    .filter(x => x.master !== undefined) as { ownedItem: { itemId: string; quantity: number }; master: ItemMaster }[];

  const filtered = ownedItems.filter(({ master }) =>
    activeCategory === 'all' || master.category === activeCategory
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleUseItem = (itemId: string) => {
    const master = getItemMaster(itemId);
    if (!master) return;

    if (master.category === 'stamina') {
      if (player.stamina >= player.maxStamina) {
        showToast('スタミナは満タンです');
        return;
      }
      const ok = useItem(itemId, 1);
      if (!ok) return;
      if (itemId === 'item_stamina_full') {
        usePlayerStore.setState(s => ({
          player: { ...s.player, stamina: s.player.maxStamina },
        }));
        showToast(`${master.emoji} スタミナ全回復！`);
      } else if (itemId === 'item_stamina_potion') {
        usePlayerStore.setState(s => ({
          player: { ...s.player, stamina: Math.min(s.player.stamina + 30, s.player.maxStamina) },
        }));
        showToast(`${master.emoji} スタミナ +30 回復！`);
      } else if (itemId === 'item_stamina_plus') {
        usePlayerStore.setState(s => ({
          player: { ...s.player, stamina: Math.min(s.player.stamina + 50, s.player.maxStamina) },
        }));
        showToast(`${master.emoji} スタミナ +50 回復！`);
      }
    } else if (master.category === 'exp_potion') {
      const exp = EXP_MAP[itemId];
      if (exp && ownedUnits.length > 0) {
        setExpModal({ itemId, exp, name: master.name });
      } else if (ownedUnits.length === 0) {
        showToast('ユニットを召喚してから使用してください');
      } else {
        showToast(`${master.emoji} このアイテムはここでは使用できません`);
      }
    } else {
      showToast(`${master.emoji} このアイテムはここでは使用できません`);
    }
  };

  const handleApplyExp = (unitInstanceId: string) => {
    if (!expModal) return;
    const unit = ownedUnits.find(u => u.instanceId === unitInstanceId);
    if (!unit) return;
    const cap = getLevelCap(unit.currentRarity);
    if (unit.level >= cap) {
      showToast('このユニットはレベルが上限です。進化させましょう');
      return;
    }
    const ok = useItem(expModal.itemId, 1);
    if (!ok) { showToast('アイテムが足りません'); setExpModal(null); return; }
    levelUpUnit(unitInstanceId, expModal.exp);
    addDailyProgress('enhance');
    addWeeklyProgress('enhance');
    const m = getUnitMaster(unit.masterId);
    showToast(`${m?.emoji ?? '✨'} ${m?.name ?? 'ユニット'} に EXP +${expModal.exp.toLocaleString()}！`);
    setExpModal(null);
  };

  const canUseHere = (category: string) => category === 'stamina' || (category === 'exp_potion' && ownedUnits.length > 0);

  const openSellModal = (master: ItemMaster, owned: number) => {
    setSellQty(1);
    setSellModal({ master, owned });
  };

  const handleSell = () => {
    if (!sellModal) return;
    const { master } = sellModal;
    const ok = useItem(master.id, sellQty);
    if (!ok) { showToast('アイテムが足りません'); setSellModal(null); return; }
    const gold = (master.sellPrice ?? 0) * sellQty;
    addGold(gold);
    showToast(`🪙 ${master.name} ×${sellQty} を ${gold.toLocaleString()} G で売却！`);
    setSellModal(null);
  };

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="アイテム" />

      {/* スタミナ表示 */}
      <div className="mx-4 mb-4 card-base p-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs font-medium">スタミナ</span>
              <span className="text-yellow-400 text-sm font-bold tabular-nums">
                {player.stamina} / {player.maxStamina}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-gradient-to-r from-yellow-600 to-yellow-400"
                style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* アイテム数 */}
      <div className="px-4 mb-3">
        <p className="text-gray-600 text-xs">{filtered.length} 種類</p>
      </div>

      {/* アイテム一覧 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 font-bold">アイテムがありません</p>
          <p className="text-gray-600 text-sm mt-1">クエストをクリアして集めよう</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(({ ownedItem, master }) => (
            <div key={ownedItem.itemId} className="card-base p-3.5 flex items-center gap-3">
              {/* アイコン */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-black/30 border border-white/5">
                {master.emoji}
              </div>

              {/* 情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-bold text-sm">{master.name}</p>
                  <CategoryBadge category={master.category} />
                </div>
                <p className="text-gray-500 text-xs truncate">{master.description}</p>
              </div>

              {/* 数量 + 使用/売却ボタン */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-white font-black text-lg tabular-nums">
                  ×{ownedItem.quantity}
                </span>
                <div className="flex gap-1.5">
                  {(master.sellPrice ?? 0) > 0 && (
                    <button
                      onClick={() => openSellModal(master, ownedItem.quantity)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95"
                      style={{
                        background: 'rgba(245,158,11,0.12)',
                        border: '1px solid rgba(245,158,11,0.35)',
                        color: '#fbbf24',
                      }}
                    >
                      売却
                    </button>
                  )}
                  {canUseHere(master.category) && (
                    <button
                      onClick={() => handleUseItem(ownedItem.itemId)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                        border: '1px solid rgba(124,58,237,0.5)',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                        color: 'white',
                      }}
                    >
                      使用
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 未所持アイテム（グレーアウト表示） */}
      {activeCategory !== 'all' && (
        <UnownedItems category={activeCategory} ownedIds={ownedItems.map(i => i.ownedItem.itemId)} />
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="card-glass px-5 py-3 border-purple-700/40 whitespace-nowrap">
            <p className="text-white text-sm font-medium">{toast}</p>
          </div>
        </div>
      )}

      {/* 売却モーダル */}
      {sellModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setSellModal(null); }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{
            background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
            border: '1px solid rgba(245,158,11,0.4)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{sellModal.master.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{sellModal.master.name}</p>
                <p className="text-gray-500 text-xs">所持 ×{sellModal.owned} · 単価 🪙 {(sellModal.master.sellPrice ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {/* 数量セレクタ */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={() => setSellQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl text-white font-black text-lg active:scale-95 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>−</button>
              <span className="text-white font-black text-2xl w-16 text-center tabular-nums">{sellQty}</span>
              <button onClick={() => setSellQty(q => Math.min(sellModal.owned, q + 1))}
                className="w-10 h-10 rounded-xl text-white font-black text-lg active:scale-95 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>＋</button>
              <button onClick={() => setSellQty(sellModal.owned)}
                className="px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                MAX
              </button>
            </div>

            <div className="rounded-xl p-3 mb-4 text-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-gray-500 text-xs mb-0.5">売却額</p>
              <p className="text-yellow-400 font-black text-xl">🪙 {((sellModal.master.sellPrice ?? 0) * sellQty).toLocaleString()} G</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSellModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400"
                style={{ background: 'rgba(40,30,60,0.6)', border: '1px solid rgba(100,80,140,0.3)' }}>
                キャンセル
              </button>
              <button onClick={handleSell}
                className="flex-1 py-3 rounded-xl text-sm font-black text-white active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                売却する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 経験値使用：ユニット選択モーダル */}
      {expModal && (
        <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) setExpModal(null); }}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{
            background: 'linear-gradient(180deg, #1a0838 0%, #0d0620 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            maxHeight: '80vh',
          }}>
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <p className="text-white font-bold text-base">{expModal.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">EXP +{expModal.exp.toLocaleString()} を与えるユニットを選択</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
              {ownedUnits.map(u => {
                const m = getUnitMaster(u.masterId);
                if (!m) return null;
                const cap = getLevelCap(u.currentRarity);
                const isMax = u.level >= cap;
                return (
                  <button key={u.instanceId} onClick={() => handleApplyExp(u.instanceId)}
                    disabled={isMax}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isMax ? 'opacity-40' : 'active:scale-98'}`}
                    style={{ background: 'rgba(40,20,80,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <span className="text-2xl flex-shrink-0">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{m.name}</p>
                      <p className="text-gray-500 text-xs">Lv.{u.level} / {cap}{isMax ? ' (MAX)' : ''}</p>
                    </div>
                    {!isMax && <span className="text-purple-400 text-xs font-bold flex-shrink-0">+{expModal.exp.toLocaleString()} EXP</span>}
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(100,80,140,0.2)' }}>
              <button onClick={() => setExpModal(null)}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-400"
                style={{ background: 'rgba(40,30,60,0.6)', border: '1px solid rgba(100,80,140,0.3)' }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// カテゴリバッジ
const CategoryBadge = ({ category }: { category: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    stamina:         { label: 'スタミナ', color: '#ca8a04' },
    exp_potion:      { label: '経験値',   color: '#3b82f6' },
    material:        { label: '素材',     color: '#6b7280' },
    awaken_material: { label: '覚醒素材', color: '#7c3aed' },
    summon_ticket:   { label: 'チケット', color: '#059669' },
  };
  const info = map[category];
  if (!info) return null;
  return (
    <span className="text-[9px] font-bold rounded px-1.5 py-0.5"
      style={{ background: `${info.color}22`, color: info.color, border: `1px solid ${info.color}44` }}>
      {info.label}
    </span>
  );
};

// 未所持アイテム一覧
const UnownedItems = ({ category, ownedIds }: { category: Category; ownedIds: string[] }) => {
  const unowned = ITEM_MASTER.filter(m =>
    (category === 'all' || m.category === category) && !ownedIds.includes(m.id)
  );
  if (unowned.length === 0) return null;
  return (
    <div className="px-4 mt-4">
      <p className="text-gray-700 text-xs mb-2 font-bold uppercase tracking-wider">未所持</p>
      <div className="space-y-1.5">
        {unowned.map(master => (
          <div key={master.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl opacity-30"
            style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-xl grayscale">{master.emoji}</span>
            <span className="text-gray-500 text-sm">{master.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
