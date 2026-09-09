import { useId, useState } from 'react';
import type { OwnedUnit } from '../../types';
import { getUnitMaster } from '../../data/units';
import { UNIT_MASTER } from '../../data/units';
import { ElementBadge } from './ElementBadge';
import { RarityBadge } from './RarityBadge';
import { getStarColor, getLevelCap, AWAKENING_CONFIG } from '../../data/rarityConfig';
import { resolveUnitImage, getCharacterArt, getUnitImagePath, UNIT_IMAGE_FALLBACK } from '../../lib/unitImage';
import { Icon } from './Icon';
import type { IconName } from './Icon';

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
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${master.name} Lv.${unit.level}` : undefined}
      aria-pressed={selected}
      onKeyDown={e => { if(onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      className={`unit-card card-base cursor-pointer relative ${
        selected ? 'ring-2 ring-yellow-400 animate-pulse-gold' : 'hover:border-purple-500'
      } ${compact ? 'p-2' : 'p-3'} ${isMaxed ? '!border-transparent' : ''}`}
      style={selected || isMaxed ? {} : { borderColor: `${starColor}44` }}
    >
      {unit.isLocked && (
        <div className="absolute top-2 right-2 text-yellow-400" aria-label="ロック中"><Icon name="lock" size={13}/></div>
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
          masterId={unit.masterId}
          unitRarity={rarity}
          fallbackEmoji={master.emoji}
          element={master.element}
          size={compact ? 44 : 72}
          height={compact ? 56 : 84}
          variant="portrait"
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

export type PortraitVariant = 'full' | 'portrait';
interface UnitIconProps {
  src: string | null; masterId?: string; unitRarity?: number | string;
  fallbackEmoji: string; element: string; size?: number; height?: number;
  className?: string; variant?: PortraitVariant; alt?: string;
}
/** Crop the source image, not the character: bounds come from the asset catalog. */
export const UnitIcon = ({ src, masterId, unitRarity=1, element, size=56, height, className='', variant, alt }: UnitIconProps) => {
  const [failed, setFailed] = useState<Set<string>>(()=>new Set());
  const clipId = useId();
  const h = height ?? size;
  const mode = variant ?? (h/size>=1.5 ? 'full' : 'portrait');
  const label = alt ?? (masterId ? getUnitMaster(masterId)?.name : undefined) ?? 'キャラクター';
  const staticSource = masterId ? getUnitImagePath(masterId,unitRarity) : null;
  const source = [src,staticSource].find((s):s is string=>!!s && s!==UNIT_IMAGE_FALLBACK && !failed.has(s));
  const art = source ? getCharacterArt(source,masterId) : null;
  const onError = () => { if(source) setFailed(prev=>new Set([...prev,source])); };
  if(!source) return <div role="img" aria-label={`${label}（画像未登録）`} className={`unit-portrait unit-portrait-fallback ${className}`} style={{width:size,maxWidth:'100%',aspectRatio:`${size} / ${h}`}}><Icon name={element in {fire:1,water:1,wind:1,earth:1,light:1,dark:1,thunder:1} ? element as IconName : 'unknown'} size={Math.min(size*.4,40)}/><small>{label.slice(0,6)}</small></div>;
  if(!art) return <div className={`unit-portrait ${className}`} style={{width:size,maxWidth:'100%',aspectRatio:`${size} / ${h}`}}><img src={source} alt={label} loading="lazy" decoding="async" onError={onError} style={{objectFit:mode==='full'?'contain':'cover',objectPosition:'50% 20%'}}/></div>;
  const [x,y,w,fullHeight]=art.crop;
  const cropHeight=mode==='portrait' ? Math.min(fullHeight,w*1.15) : fullHeight;
  return <div className={`unit-portrait ${className}`} style={{width:size,maxWidth:'100%',aspectRatio:`${size} / ${h}`}}>
    <svg className="unit-art" role="img" aria-label={label} viewBox={`0 0 ${w} ${cropHeight}`} preserveAspectRatio={mode==='full'?'xMidYMid meet':'xMidYMin slice'}>
      <defs><clipPath id={clipId}><rect width={w} height={cropHeight}/></clipPath></defs>
      <image href={source} x={-x} y={-y} width={art.width} height={art.height} clipPath={`url(#${clipId})`} onError={onError}/>
    </svg>
  </div>;
};

export const UnitSlotImg = ({masterId,rarity}:{masterId:string;rarity:number|string}) => {
  const master=getUnitMaster(masterId);
  return <UnitIcon masterId={masterId} unitRarity={rarity} src={resolveUnitImage(masterId,rarity)} fallbackEmoji={master?.emoji ?? ''} element={master?.element ?? 'dark'} variant="portrait" className="unit-slot-art"/>;
};
