import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTutorialStore } from '../../stores/tutorialStore';

export const TitleScreen = () => {
  const navigate = useNavigate();
  const { user, isChecked } = useAuthStore();
  const { completed } = useTutorialStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // 認証済みならゲームへ自動遷移
  useEffect(() => {
    if (!isChecked) return;
    if (user) {
      navigate(completed ? '/' : '/tutorial/intro', { replace: true });
    }
  }, [isChecked, user, completed, navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0535 0%, #08081a 60%, #000 100%)' }}>

      {/* 星エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2.5 + 0.5}px`,
              height: `${Math.random() * 2.5 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
              animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 魔法陣リング */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full"
          style={{
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 0 60px rgba(139,92,246,0.15), inset 0 0 60px rgba(139,92,246,0.05)',
            animation: 'glow-pulse 4s ease-in-out infinite',
          }} />
        <div className="absolute w-56 h-56 rounded-full"
          style={{ border: '1px solid rgba(240,192,64,0.2)', animation: 'glow-pulse 3s ease-in-out infinite reverse' }} />
        <div className="absolute w-36 h-36 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.15)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
      </div>

      {/* メインコンテンツ */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 px-8 w-full max-w-sm
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        <div className="text-xs tracking-[0.5em] text-yellow-400 mb-6 font-medium opacity-70">
          ✦ ARCANA BRAVE ✦
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl font-black leading-tight mb-1"
            style={{
              fontFamily: "'Cinzel Decorative', 'Hiragino Kaku Gothic ProN', serif",
              background: 'linear-gradient(160deg, #fde68a 0%, #f0c040 40%, #f59e0b 70%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.5))',
            }}>
            アルカナ
          </div>
          <div className="text-5xl font-black leading-tight"
            style={{
              fontFamily: "'Cinzel Decorative', 'Hiragino Kaku Gothic ProN', serif",
              background: 'linear-gradient(160deg, #fde68a 0%, #f0c040 40%, #f59e0b 70%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.5))',
            }}>
            ブレイド
          </div>
          <div className="mt-3 text-xs tracking-[0.35em] text-purple-300 opacity-60">
            ～ 剣と召喚の覇者 ～
          </div>
        </div>

        <div className="my-6 w-40 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(240,192,64,0.5), transparent)' }} />

        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: '0 0 28px rgba(124,58,237,0.45), 0 4px 16px rgba(0,0,0,0.5)',
              border: '1px solid rgba(167,139,250,0.35)',
            }}>
            ⚔️ ゲーム開始
          </button>

          <button
            onClick={() => navigate('/register')}
            className="w-full py-3.5 rounded-2xl font-bold text-sm cursor-pointer active:scale-95 transition-all duration-200"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1.5px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd',
            }}>
            ✨ 新規登録
          </button>
        </div>

        <div className="mt-16 text-xs text-gray-700 tracking-widest">Ver 2.0.0</div>
      </div>
    </div>
  );
};
