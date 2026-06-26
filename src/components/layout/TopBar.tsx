import { usePlayerStore } from '../../stores/playerStore';
import { formatNumber } from '../../utils/format';
import { CurrencyIcon } from '../ui/game/GameIcons';

interface Props {
  title?: string;
  onBack?: () => void;
}

export const TopBar = ({ title, onBack }: Props) => {
  const { player } = usePlayerStore();

  return (
    <header className="sticky top-0 z-40 px-4 py-2 flex items-center justify-between"
      style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, transparent 100%)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-2">
        {onBack ? (
          <button onClick={onBack} className="text-gray-400 hover:text-white text-xl mr-1">←</button>
        ) : (
          <span className="text-yellow-400 font-black text-sm tracking-wider">ARCANA</span>
        )}
        {title && <h1 className="text-white font-bold text-base">{title}</h1>}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <CurrencyIcon type="diamond" size={22} />
          <span className="text-blue-300 font-bold">{formatNumber(player.diamond)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CurrencyIcon type="gold" size={22} />
          <span className="text-yellow-400 font-bold">{formatNumber(player.gold)}</span>
        </div>
      </div>
    </header>
  );
};
