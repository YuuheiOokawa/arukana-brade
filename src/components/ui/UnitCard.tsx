import type { OwnedUnit } from '../../types';
import { UNIT_MASTER } from '../../data/units';
import { ElementBadge } from './ElementBadge';
import { RarityBadge } from './RarityBadge';

interface Props {
  unit: OwnedUnit;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const UnitCard = ({ unit, selected, onClick, compact = false }: Props) => {
  const master = UNIT_MASTER.find(u => u.id === unit.masterId);
  if (!master) return null;

  return (
    <div
      onClick={onClick}
      className={`unit-card card-base cursor-pointer relative ${
        selected ? 'ring-2 ring-yellow-400 animate-pulse-gold' : 'hover:border-purple-500'
      } ${compact ? 'p-2' : 'p-3'}`}
    >
      {unit.isLocked && (
        <div className="absolute top-1 right-1 text-yellow-400 text-xs">🔒</div>
      )}
      <div className="flex items-center gap-2">
        <div className={`${ELEMENT_BG_MAP[master.element]} rounded-lg flex items-center justify-center flex-shrink-0 ${compact ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-3xl'}`}
          style={{ background: elementGradient(master.element) }}>
          {master.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <RarityBadge rarity={master.rarity} size="sm" />
            <ElementBadge element={master.element} size="sm" />
          </div>
          <p className={`font-bold text-white truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{master.name}</p>
          {!compact && <p className="text-xs text-gray-400 truncate">{master.title}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-gray-300 ${compact ? 'text-xs' : 'text-xs'}`}>Lv.{unit.level}</span>
            {unit.awakenRank > 0 && (
              <span className="text-yellow-400 text-xs">{'★'.repeat(unit.awakenRank)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ELEMENT_BG_MAP: Record<string, string> = {
  fire: 'bg-element-fire',
  water: 'bg-element-water',
  wind: 'bg-element-wind',
  earth: 'bg-element-earth',
  light: 'bg-element-light',
  dark: 'bg-element-dark',
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
