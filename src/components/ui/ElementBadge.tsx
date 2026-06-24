import type { ElementType } from '../../types';
import { ELEMENT_NAMES, ELEMENT_BG } from '../../types';

interface Props {
  element: ElementType;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = { sm: 'text-xs px-1.5 py-0.5', md: 'text-sm px-2 py-1', lg: 'text-base px-3 py-1.5' };

export const ElementBadge = ({ element, size = 'md' }: Props) => (
  <span className={`inline-block rounded-full font-bold text-white ${SIZE[size]} ${ELEMENT_BG[element]}`}>
    {ELEMENT_NAMES[element]}
  </span>
);
