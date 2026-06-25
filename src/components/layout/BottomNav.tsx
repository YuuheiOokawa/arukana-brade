import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '../../stores/missionStore';
import {
  IconHome, IconSword, IconCrystal, IconTeam,
  IconMenu, IconScroll, IconGear, IconBag,
  IconArrowUp, IconShield, IconDragon, IconTrophy, IconCastle,
} from '../ui/FantasyIcon';

const MAIN_NAV = [
  { path: '/',       label: 'ホーム',   Icon: IconHome },
  { path: '/quests', label: 'クエスト', Icon: IconSword },
  { path: '/units',  label: 'ユニット', Icon: IconTeam },
  { path: '/summon', label: '召喚',     Icon: IconCrystal },
];

const MENU_ITEMS = [
  { path: '/missions',  label: 'ミッション', Icon: IconScroll,   badge: true },
  { path: '/equipment', label: '装備',       Icon: IconGear },
  { path: '/items',     label: 'アイテム',   Icon: IconBag },
  { path: '/enhance',   label: '強化',       Icon: IconArrowUp },
  { path: '/party',     label: '編成',       Icon: IconShield },
  { path: '/raid',      label: 'レイド',     Icon: IconDragon },
  { path: '/pvp',       label: 'アリーナ',   Icon: IconTrophy },
  { path: '/guild',     label: 'ギルド',     Icon: IconCastle },
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
              <div className="grid grid-cols-4 gap-3">
                {MENU_ITEMS.map(item => {
                  const active = isActive(item.path);
                  const IconComp = item.Icon;
                  return (
                    <button key={item.path} onClick={() => handleNav(item.path)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 relative"
                      style={{
                        background: active
                          ? 'linear-gradient(180deg, rgba(139,92,246,0.25), rgba(79,70,229,0.2))'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        boxShadow: active ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
                      }}>
                      <IconComp size={22} color={active ? '#c4b5fd' : '#4b5563'} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#c4b5fd' : '#4b5563' }}>
                        {item.label}
                      </span>
                      {item.badge && missionBadge && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
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
            const IconComp = item.Icon;
            return (
              <button key={item.path} onClick={() => { setMenuOpen(false); navigate(item.path); }}
                className="flex-1 flex flex-col items-center pt-2 pb-3 transition-all duration-200 active:scale-95">
                <div className="relative">
                  <IconComp size={22} color={active ? '#f0c040' : '#4b5563'} />
                  {active && (
                    <div className="absolute -inset-2 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(240,192,64,0.15), transparent 70%)' }} />
                  )}
                </div>
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 700,
                  color: active ? '#f0c040' : '#4b5563' }}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-4 h-0.5 rounded-full mt-1"
                    style={{ background: '#f0c040', boxShadow: '0 0 6px rgba(240,192,64,0.6)' }} />
                )}
              </button>
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
