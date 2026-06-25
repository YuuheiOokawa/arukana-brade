import type { StarRarity } from '../../types';
import { getStarDisplay, getStarColor } from '../../data/rarityConfig';

interface Props {
  rarity: StarRarity;
  size?: 'sm' | 'md' | 'lg';
}

export const RarityBadge = ({ rarity, size = 'md' }: Props) => {
  const color = getStarColor(rarity);
  const label = getStarDisplay(rarity);
  const sizeClass = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : size === 'lg'
    ? 'text-base px-3 py-1'
    : 'text-sm px-2 py-0.5';

  return (
    <span
      className={`inline-block rounded font-black ${sizeClass}`}
      style={{
        color,
        border: `1px solid ${color}`,
        background: `${color}22`,
        textShadow: `0 0 8px ${color}`,
      }}
    >
      {label}
    </span>
  );
};
