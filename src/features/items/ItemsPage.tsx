import { useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { ITEM_MASTER, getItemMaster } from '../../data/items';
import { TopBar } from '../../components/layout/TopBar';
import type { ItemMaster } from '../../types';

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
  const { player, items, useItem } = usePlayerStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [toast, setToast] = useState<string | null>(null);

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
      }
    } else {
      showToast(`${master.emoji} このアイテムはここでは使用できません`);
    }
  };

  const canUseHere = (category: string) => category === 'stamina';

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

              {/* 数量 + 使用ボタン */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-white font-black text-lg tabular-nums">
                  ×{ownedItem.quantity}
                </span>
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
