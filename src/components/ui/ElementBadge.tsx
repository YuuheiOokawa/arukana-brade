import type { ElementType } from '../../types';
import { ELEMENT_NAMES } from '../../types';
import { elementTextColor } from '../../utils/elementUtils';
import { Icon } from './Icon';
import type { CSSProperties } from 'react';
export const ElementBadge = ({element,size='md'}:{element:ElementType;size?:'sm'|'md'|'lg'}) => <span className={`element-badge element-badge-${size}`} style={{'--element-color':elementTextColor(element)} as CSSProperties}><Icon name={element} size={size==='sm'?11:14}/>{ELEMENT_NAMES[element]}</span>;
