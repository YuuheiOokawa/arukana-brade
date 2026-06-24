import type { RarityType } from '../../types';
import { RARITY_COLORS } from '../../types';

interface Props {
  rarity: RarityType;
  size?: 'sm' | 'md';
}

export const RarityBadge = ({ rarity, size = 'md' }: Props) => (
  <span className={`inline-block rounded font-black text-white ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-0.5'} ${RARITY_COLORS[rarity]}`}>
    {rarity}
  </span>
);
