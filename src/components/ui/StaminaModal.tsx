import { usePlayerStore } from '../../stores/playerStore';
import { getItemMaster } from '../../data/items';

interface Props {
  requiredStamina: number;
  onClose: () => void;
  onUsed: () => void;
}

export const StaminaModal = ({ requiredStamina, onClose, onUsed }: Props) => {
  const { player, items, useItem } = usePlayerStore();

  const staminaItems = items.filter(i => {
    const m = getItemMaster(i.itemId);
    return m?.category === 'stamina' && i.quantity > 0;
  });

  const handleUse = (itemId: string) => {
    const master = getItemMaster(itemId);
    if (!master) return;
    const ok = useItem(itemId, 1);
    if (!ok) return;

    if (itemId === 'item_stamina_full') {
      usePlayerStore.setState(s => ({
        player: { ...s.player, stamina: s.player.maxStamina },
      }));
    } else if (itemId === 'item_stamina_potion') {
      usePlayerStore.setState(s => ({
        player: { ...s.player, stamina: Math.min(s.player.stamina + 30, s.player.maxStamina) },
      }));
    }

    onUsed();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end modal-overlay" onClick={onClose}>
      <div className="w-full bottom-sheet animate-slide-bottom" onClick={e => e.stopPropagation()}>
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        <div className="px-5 pb-safe pb-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">スタミナ回復</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                必要 <span className="text-red-400 font-bold">{requiredStamina}</span>
                {' / '}現在 <span className="text-yellow-400 font-bold">{player.stamina}</span>/{player.maxStamina}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-lg">
              ×
            </button>
          </div>

          {/* スタミナバー */}
          <div className="h-2 bg-gray-800 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all"
              style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }} />
          </div>

          {staminaItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 text-sm">スタミナ回復アイテムがありません</p>
              <p className="text-gray-600 text-xs mt-1">クエストでドロップするか、ショップで購入できます</p>
            </div>
          ) : (
            <div className="space-y-2">
              {staminaItems.map(oi => {
                const master = getItemMaster(oi.itemId);
                if (!master) return null;
                const isPotion = oi.itemId === 'item_stamina_potion';
                const recovered = isPotion ? 30 : player.maxStamina - player.stamina;
                const newStamina = Math.min(player.stamina + (isPotion ? 30 : player.maxStamina), player.maxStamina);
                const willSuffice = newStamina >= requiredStamina;

                return (
                  <button
                    key={oi.itemId}
                    onClick={() => handleUse(oi.itemId)}
                    className="w-full card-base p-3.5 flex items-center gap-3 hover:border-purple-500/50 active:scale-98 transition-all text-left"
                  >
                    <span className="text-3xl">{master.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{master.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{master.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 text-xs font-medium">
                          +{recovered} スタミナ
                        </span>
                        {willSuffice && (
                          <span className="text-xs bg-emerald-900/60 text-emerald-400 rounded px-1.5 py-0.5">
                            ✓ 十分
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-400 text-xs mb-0.5">所持</p>
                      <p className="text-white font-bold">{oi.quantity}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
