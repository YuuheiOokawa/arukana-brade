import {
  Backpack, Badge, Bird, Bone, BookOpen, Box, Castle, CircleDot, Coins,
  Crown, Diamond, Droplets, Feather, Flame, Gem, Gift, HeartPulse, Leaf,
  Medal, Mountain, Package, PawPrint, ScrollText, Shield, Sparkles, Star,
  Sun, Sword, Ticket, Trophy, Users, Waves, Zap,
} from 'lucide-react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import type { ItemMaster } from '../../types';

type Glyph = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;

const itemGlyph = (item: Pick<ItemMaster, 'id' | 'name' | 'category'>): { Glyph: Glyph; tone: string } => {
  const key = `${item.id} ${item.name}`;
  if (/ticket|チケット/.test(key)) return { Glyph: Ticket, tone: 'violet' };
  if (/book|tome|書|ルーン/.test(key)) return { Glyph: BookOpen, tone: 'violet' };
  if (/potion|薬|雫/.test(key)) return { Glyph: item.category === 'stamina' ? HeartPulse : Droplets, tone: item.category === 'stamina' ? 'emerald' : 'azure' };
  if (/fire|炎|灰/.test(key)) return { Glyph: Flame, tone: 'fire' };
  if (/water|ice|sea|水|氷|海|真珠/.test(key)) return { Glyph: Waves, tone: 'azure' };
  if (/wind|風|羽|feather|wing/.test(key)) return { Glyph: key.includes('demon') ? Bird : Feather, tone: 'emerald' };
  if (/thunder|雷/.test(key)) return { Glyph: Zap, tone: 'gold' };
  if (/earth|stone|ore|adamant|土|石|鉱|塊/.test(key)) return { Glyph: Mountain, tone: 'earth' };
  if (/dark|shadow|lich|闇/.test(key)) return { Glyph: Crown, tone: 'violet' };
  if (/holy|angel|celestial|聖|天使|天空|光/.test(key)) return { Glyph: Sun, tone: 'gold' };
  if (/fang|tusk|bone|牙|ホネ|耳/.test(key)) return { Glyph: Bone, tone: 'earth' };
  if (/hide|bark|thread|皮|樹皮|糸|蜘蛛/.test(key)) return { Glyph: Leaf, tone: 'emerald' };
  if (/scale|dragon|heart|スケイル|ドラゴン|龍/.test(key)) return { Glyph: Shield, tone: 'fire' };
  if (/medal|勲章|coin|コイン/.test(key)) return { Glyph: Medal, tone: 'gold' };
  if (/gift|bonus|ギフト|ボーナス/.test(key)) return { Glyph: Gift, tone: 'rose' };
  if (/crystal|gem|orb|core|shard|jewel|結晶|宝玉|宝石|オーブ|核|欠片|精髄/.test(key)) return { Glyph: Gem, tone: item.category === 'awaken_material' ? 'violet' : 'azure' };
  if (/star|星/.test(key)) return { Glyph: Star, tone: 'gold' };
  return { Glyph: Package, tone: 'slate' };
};

export function ItemIcon({ item, size = 48, muted = false }: { item: Pick<ItemMaster, 'id' | 'name' | 'category'>; size?: number; muted?: boolean }) {
  const { Glyph, tone } = itemGlyph(item);
  return <span className={`item-glyph item-glyph-${tone}${muted ? ' is-muted' : ''}`} style={{ width: size, height: size }} role="img" aria-label={item.name}>
    <Glyph size={Math.round(size * .48)} strokeWidth={1.55} />
    <i aria-hidden="true" />
  </span>;
}

const achievementGlyphs: Record<string, Glyph> = {
  first_win: Sword, warrior: Sword, hero: Flame, summoner_1: Sparkles,
  summoner_2: Diamond, explorer: ScrollText, adventurer: Star, rank_10: Trophy,
  rank_50: Crown, collector: Users, collector_2: Castle, veteran: Badge,
};

export function AchievementIcon({ id, color, earned }: { id: string; color: string; earned: boolean }) {
  const Glyph = achievementGlyphs[id] ?? Medal;
  return <span className={`achievement-glyph${earned ? '' : ' is-locked'}`} style={{ '--glyph-color': color } as CSSProperties}>
    <Glyph size={24} strokeWidth={1.55} aria-hidden="true" />
  </span>;
}

const emblemGlyphs: Record<string, { Glyph: Glyph; tone: string }> = {
  '⚔️': { Glyph: Sword, tone: 'steel' }, '🛡️': { Glyph: Shield, tone: 'azure' },
  '🔥': { Glyph: Flame, tone: 'fire' }, '💧': { Glyph: Droplets, tone: 'azure' },
  '🌿': { Glyph: Leaf, tone: 'emerald' }, '⚡': { Glyph: Zap, tone: 'gold' },
  '🌑': { Glyph: CircleDot, tone: 'violet' }, '🌟': { Glyph: Star, tone: 'gold' },
  '🐉': { Glyph: PawPrint, tone: 'fire' }, '👑': { Glyph: Crown, tone: 'gold' },
};

export function GuildEmblem({ emblem, size = 54, selected = false }: { emblem: string; size?: number; selected?: boolean }) {
  const { Glyph, tone } = emblemGlyphs[emblem] ?? { Glyph: Castle, tone: 'steel' };
  return <span className={`guild-emblem guild-emblem-${tone}${selected ? ' is-selected' : ''}`} style={{ width: size, height: size }} role="img" aria-label="ギルドエンブレム">
    <Glyph size={Math.round(size * .48)} strokeWidth={1.45} />
  </span>;
}

export function CategoryIcon({ category, size = 17 }: { category: string; size?: number }) {
  const map: Record<string, Glyph> = { all: Backpack, stamina: Zap, exp_potion: Droplets, awaken_material: Sparkles, material: Box, summon_ticket: Ticket };
  const Glyph = map[category] ?? Package;
  return <Glyph size={size} strokeWidth={1.6} aria-hidden="true" />;
}

export function MemberIcon({ role, self = false }: { role: string; self?: boolean }) {
  const Glyph = role === 'master' ? Crown : role === 'officer' ? Shield : self ? Badge : Users;
  return <span className={`member-glyph${self ? ' is-self' : ''}`}><Glyph size={19} strokeWidth={1.6}/></span>;
}

export function RewardIcon({ type, size = 18 }: { type: 'gold' | 'diamond' | 'stamina'; size?: number }) {
  const Glyph = type === 'gold' ? Coins : type === 'diamond' ? Diamond : Zap;
  return <Glyph size={size} strokeWidth={1.6} aria-hidden="true" />;
}
