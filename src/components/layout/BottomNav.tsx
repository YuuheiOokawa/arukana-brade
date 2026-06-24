import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '../../stores/missionStore';

const MAIN_NAV = [
  { path: '/',       label: 'ホーム',   icon: '🏠' },
  { path: '/quests', label: 'クエスト', icon: '⚔️' },
  { path: '/units',  label: 'ユニット', icon: '👥' },
  { path: '/summon', label: '召喚',     icon: '✨' },
];

const MENU_ITEMS = [
  { path: '/missions',  label: 'ミッション', icon: '🎯', badge: true },
  { path: '/equipment', label: '装備',       icon: '🗡️' },
  { path: '/items',     label: 'アイテム',   icon: '📦' },
  { path: '/enhance',   label: '強化',       icon: '⬆️' },
  { path: '/party',     label: '編成',       icon: '🛡️' },
  { path: '/raid',      label: 'レイド',     icon: '🐲' },
  { path: '/pvp',       label: 'アリーナ',   icon: '🏆' },
  { path: '/guild',     label: 'ギルド',     icon: '🏰' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { getCompletedCount, getClaimedCount } = useMissionStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const missionBadge = getCompletedCount() > getClaimedCount();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const handleNav = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* メニュードロワー */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute bottom-[64px] left-0 right-0 max-w-lg mx-auto px-4 pb-2"
            onClick={e => e.stopPropagation()}>
            <div className="bottom-sheet animate-slide-bottom pt-4 px-4 pb-safe pb-4">
              {/* ドラッグハンドル */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-gray-600 rounded-full" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {MENU_ITEMS.map(item => (
                  <button key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 relative ${
                      isActive(item.path)
                        ? 'bg-purple-800/40 border border-purple-700/50'
                        : 'bg-gray-800/40 border border-gray-700/30'
                    }`}>
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`text-[10px] font-bold ${isActive(item.path) ? 'text-purple-300' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    {item.badge && missionBadge && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインナビゲーションバー */}
      <nav className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,28,0.97) 0%, rgba(8,8,20,0.99) 100%)',
          borderTop: '1px solid rgba(139,92,246,0.18)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
        <div className="max-w-lg mx-auto flex pb-safe">
          {MAIN_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button key={item.path} onClick={() => { setMenuOpen(false); navigate(item.path); }}
                className={`flex-1 flex flex-col items-center pt-2 pb-3 transition-all duration-200 active:scale-95 ${
                  active ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                }`}>
                <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${active ? 'text-yellow-400' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {active && <div className="w-4 h-0.5 bg-yellow-400 rounded-full mt-1" style={{ boxShadow: '0 0 6px rgba(250,204,21,0.6)' }} />}
              </button>
            );
          })}

          {/* メニューボタン */}
          <button onClick={() => setMenuOpen(p => !p)}
            className={`flex-1 flex flex-col items-center pt-2 pb-3 transition-all duration-200 active:scale-95 relative ${
              menuOpen ? 'text-yellow-400' : 'text-gray-600'
            }`}>
            <span className={`text-xl transition-transform ${menuOpen ? 'rotate-45' : ''}`}>☰</span>
            <span className="text-[10px] mt-0.5 font-medium">メニュー</span>
            {missionBadge && !menuOpen && (
              <span className="absolute top-1.5 right-[15%] w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
