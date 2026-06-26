import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '../../stores/missionStore';
import {
  IconMenu, IconScroll, IconGear, IconBag,
  IconArrowUp, IconShield, IconDragon,
} from '../ui/FantasyIcon';
import { GameNavIcon } from '../ui/game/GameIcons';

type NavIconKey = 'home' | 'quest' | 'unit' | 'summon' | 'profile' | 'guild' | 'arena';

const MAIN_NAV: { path: string; navType: NavIconKey }[] = [
  { path: '/',       navType: 'home'   },
  { path: '/quests', navType: 'quest'  },
  { path: '/units',  navType: 'unit'   },
  { path: '/summon', navType: 'summon' },
];

type MenuItem =
  | { path: string; label: string; badge?: true; type: 'fantasy'; Icon: React.ComponentType<{ size: number; color: string }> }
  | { path: string; label: string; badge?: true; type: 'game';    navType: NavIconKey };

const MENU_ITEMS: MenuItem[] = [
  { path: '/missions',  label: 'ミッション', type: 'fantasy', Icon: IconScroll,   badge: true },
  { path: '/equipment', label: '装備',       type: 'fantasy', Icon: IconGear },
  { path: '/items',     label: 'アイテム',   type: 'fantasy', Icon: IconBag },
  { path: '/enhance',   label: '強化',       type: 'fantasy', Icon: IconArrowUp },
  { path: '/party',     label: '編成',       type: 'fantasy', Icon: IconShield },
  { path: '/raid',      label: 'レイド',     type: 'fantasy', Icon: IconDragon },
  { path: '/pvp',       label: 'アリーナ',   type: 'game',    navType: 'arena' },
  { path: '/guild',     label: 'ギルド',     type: 'game',    navType: 'guild' },
  { path: '/profile',   label: 'プロフィール', type: 'game',  navType: 'profile' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { getCompletedCount, getClaimedCount } = useMissionStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const missionBadge = getCompletedCount() > getClaimedCount();
  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  const handleNav = (path: string) => { setMenuOpen(false); navigate(path); };

  return (
    <>
      {/* メニュードロワー */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute bottom-[64px] left-0 right-0 max-w-lg mx-auto px-4 pb-2"
            onClick={e => e.stopPropagation()}>
            <div className="animate-slide-bottom rounded-t-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #1a1a3a 0%, #10102a 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
                padding: '20px 16px 24px',
              }}>
              {/* ドラッグハンドル */}
              <div className="flex justify-center mb-5">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(139,92,246,0.4)' }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {MENU_ITEMS.map(item => {
                  const active = isActive(item.path);
                  return (
                    <div key={item.path} className="relative" onClick={() => handleNav(item.path)}>
                      {item.type === 'game' ? (
                        <GameNavIcon type={item.navType} active={active} showLabel size={44} />
                      ) : (
                        <button
                          className="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                          style={{
                            background: active
                              ? 'linear-gradient(180deg, rgba(139,92,246,0.25), rgba(79,70,229,0.2))'
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${active ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.07)'}`,
                            boxShadow: active ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
                          }}>
                          <item.Icon size={22} color={active ? '#c4b5fd' : '#4b5563'} />
                          <span style={{ fontSize: 9, fontWeight: 700, color: active ? '#c4b5fd' : '#4b5563', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </button>
                      )}
                      {item.badge && missionBadge && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/title'); }}
                className="w-full mt-3 py-2.5 rounded-xl text-center text-xs font-bold transition-all active:scale-98"
                style={{ color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                ← タイトルに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインナビゲーションバー */}
      <nav className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(180deg, rgba(8,8,22,0.96) 0%, rgba(6,6,16,0.99) 100%)',
          borderTop: '1px solid rgba(139,92,246,0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
        <div className="max-w-lg mx-auto flex pb-safe">
          {MAIN_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <div key={item.path} className="flex-1 flex justify-center pt-1 pb-1 active:scale-95 transition-all duration-200"
                onClick={() => { setMenuOpen(false); navigate(item.path); }}>
                <GameNavIcon type={item.navType} active={active} showLabel size={46} />
              </div>
            );
          })}

          {/* メニューボタン */}
          <button onClick={() => setMenuOpen(p => !p)}
            className="flex-1 flex flex-col items-center pt-2 pb-3 transition-all duration-200 active:scale-95 relative">
            <div style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(90deg)' : '' }}>
              <IconMenu size={22} color={menuOpen ? '#f0c040' : '#4b5563'} />
            </div>
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: 700,
              color: menuOpen ? '#f0c040' : '#4b5563' }}>
              メニュー
            </span>
            {missionBadge && !menuOpen && (
              <span className="absolute top-1.5 right-[15%] w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
