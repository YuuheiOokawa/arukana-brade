import { usePlayerStore } from '../../stores/playerStore';
import { formatCompact } from '../../utils/format';
import { CurrencyIcon } from '../ui/game/GameIcons';

interface Props {
  title?: string;
  onBack?: () => void;
}

const StaminaDisplay = () => {
  const { player } = usePlayerStore();
  const { stamina, maxStamina, staminaRecoveryTime } = player;
  const isFull = stamina >= maxStamina;

  const pct = Math.min(1, stamina / maxStamina);
  const barColor = pct > 0.5 ? '#34d399' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  let recoveryLabel = '';
  if (!isFull && staminaRecoveryTime) {
    const msLeft = Math.max(0, staminaRecoveryTime - Date.now());
    const mins = Math.floor(msLeft / 60000);
    const secs = Math.floor((msLeft % 60000) / 1000);
    recoveryLabel = `${mins}:${String(secs).padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-1" style={{ minWidth: 0 }}>
      <span style={{ fontSize: 12, color: '#34d399', fontWeight: 700, lineHeight: 1 }}>⚡</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{stamina}</span>
          <span style={{ fontSize: 9, color: '#6b7280' }}>/{maxStamina}</span>
        </div>
        <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct * 100}%`, height: '100%', background: barColor, transition: 'width 0.3s' }} />
        </div>
      </div>
      {!isFull && recoveryLabel && (
        <span style={{ fontSize: 8, color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>{recoveryLabel}</span>
      )}
    </div>
  );
};

export const TopBar = ({ title, onBack }: Props) => {
  const { player } = usePlayerStore();

  return (
    <header className="sticky top-0 z-40 px-3 py-2 flex items-center gap-2"
      style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, transparent 100%)', backdropFilter: 'blur(8px)' }}>
      {/* 左: 戻るボタン or ブランド名 */}
      <div className="flex items-center gap-1 flex-shrink-0" style={{ maxWidth: '45%' }}>
        {onBack ? (
          <button onClick={onBack} className="text-gray-400 hover:text-white text-xl flex-shrink-0">←</button>
        ) : (
          <span className="text-yellow-400 font-black text-sm tracking-wider flex-shrink-0">ARCANA</span>
        )}
        {title && <h1 className="text-white font-bold truncate" style={{ fontSize: 13 }}>{title}</h1>}
      </div>

      {/* 中央: スタミナ */}
      <div className="flex-1 flex justify-center">
        <StaminaDisplay />
      </div>

      {/* 右: 通貨 */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-0.5">
          <CurrencyIcon type="diamond" size={15} />
          <span className="text-blue-300 font-bold" style={{ fontSize: 11 }}>{formatCompact(player.diamond)}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <CurrencyIcon type="gold" size={15} />
          <span className="text-yellow-400 font-bold" style={{ fontSize: 11 }}>{formatCompact(player.gold)}</span>
        </div>
      </div>
    </header>
  );
};
