import { useState } from 'react';
import type { OwnedUnit } from '../../types';
import { getUnitMaster } from '../../data/units';
import { UNIT_MASTER } from '../../data/units';
import { ElementBadge } from './ElementBadge';
import { RarityBadge } from './RarityBadge';
import { getStarColor, getLevelCap, AWAKENING_CONFIG } from '../../data/rarityConfig';
import { resolveUnitImage } from '../../lib/unitImage';

interface Props {
  unit: OwnedUnit;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const UnitCard = ({ unit, selected, onClick, compact = false }: Props) => {
  const master = getUnitMaster(unit.masterId) ?? UNIT_MASTER.find(u => u.id === unit.masterId);
  if (!master) return null;

  const rarity = unit.currentRarity ?? 1;
  const starColor = getStarColor(rarity);
  const awakeningCount = unit.awakeningCount ?? 0;
  const imgSrc = resolveUnitImage(unit.masterId, rarity);

  const isMaxed =
    unit.level >= getLevelCap(rarity) &&
    awakeningCount >= AWAKENING_CONFIG.maxAwakeningCount &&
    unit.awakenRank >= (master.maxAwaken ?? 5);

  const cardInner = (
    <div
      onClick={onClick}
      className={`unit-card card-base cursor-pointer relative ${
        selected ? 'ring-2 ring-yellow-400 animate-pulse-gold' : 'hover:border-purple-500'
      } ${compact ? 'p-2' : 'p-3'} ${isMaxed ? '!border-transparent' : ''}`}
      style={selected || isMaxed ? {} : { borderColor: `${starColor}44` }}
    >
      {unit.isLocked && (
        <div className="absolute top-1 right-1 text-yellow-400 text-xs">🔒</div>
      )}
      {awakeningCount > 0 && (
        <div
          className="absolute top-1 left-1 text-xs font-bold px-1 rounded"
          style={{ color: starColor, background: `${starColor}22`, fontSize: '10px' }}
        >
          覚{awakeningCount}
        </div>
      )}
      {isMaxed && (
        <div className="absolute top-1 right-6 text-xs font-bold px-1 rounded"
          style={{ fontSize: '9px', background: 'rgba(0,0,0,0.4)', color: '#fff', letterSpacing: '0.05em' }}>
          MAX
        </div>
      )}
      <div className="flex items-center gap-2">
        <UnitIcon
          src={imgSrc}
          fallbackEmoji={master.emoji}
          element={master.element}
          size={compact ? 40 : 52}
          height={compact ? 60 : 78}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <RarityBadge rarity={rarity} size="sm" />
            <ElementBadge element={master.element} size="sm" />
          </div>
          <p className={`font-bold text-white truncate ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{master.name}</p>
          {!compact && <p className="text-xs text-gray-400 truncate">{master.title}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-300 text-xs">Lv.{unit.level}</span>
            {unit.awakenRank > 0 && (
              <span className="text-yellow-400 text-xs">{'★'.repeat(unit.awakenRank)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMaxed) {
    return (
      <div className="p-0.5 rounded-xl" style={{
        background: 'linear-gradient(90deg, #ff4444, #ff9900, #ffee00, #44ff88, #00ccff, #8844ff, #ff44cc, #ff4444)',
        backgroundSize: '200% 100%',
      }}>
        {cardInner}
      </div>
    );
  }
  return cardInner;
};

// キャラ画像アイコン（エラー時はemoji fallback）
// 画像は 256×512 (1:2 縦長) → height を指定して縦長表示推奨
export const UnitIcon = ({
  src,
  fallbackEmoji,
  element,
  size = 56,
  height,
  className = '',
}: {
  src: string | null;
  fallbackEmoji: string;
  element: string;
  size?: number;
  height?: number;
  className?: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const h = height ?? size;

  if (!src || imgError) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: h, background: elementGradient(element), fontSize: size * 0.5 }}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: h, background: elementGradient(element) }}
    >
      <img
        src={src}
        alt=""
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: 'scale(1.5)', transformOrigin: 'top center' }}
      />
    </div>
  );
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
