import { House, Swords, Users, Diamond, Backpack, Shield, Sparkles, BookOpen, Crown, Store, Gift, Settings, Flame, Droplets, Wind, Mountain, Sun, Moon, Zap, ChevronRight, ArrowLeft, Search, LockKeyhole, LockKeyholeOpen, Menu, X, LogOut, Trophy, Castle, UserRound, ScrollText, CircleHelp } from 'lucide-react';
const icons = { home: House, quest: Swords, units: Users, summon: Diamond, items: Backpack, party: Shield, enhance: Sparkles, collection: BookOpen, crown: Crown, shop: Store, gifts: Gift, equipment: Settings, fire: Flame, water: Droplets, wind: Wind, earth: Mountain, light: Sun, dark: Moon, thunder: Zap, next: ChevronRight, back: ArrowLeft, search: Search, lock: LockKeyhole, unlock: LockKeyholeOpen, menu: Menu, close: X, logout: LogOut, pvp: Trophy, guild: Castle, profile: UserRound, missions: ScrollText, raid: Swords, social: Users, unknown: CircleHelp };
export type IconName = keyof typeof icons;
export function Icon({ name, size = 22, className = '' }: { name: IconName; size?: number; className?: string }) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.6} aria-hidden="true" className={`arcana-icon ${className}`} />;
}
