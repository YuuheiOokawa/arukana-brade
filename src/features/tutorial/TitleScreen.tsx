import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTutorialStore } from '../../stores/tutorialStore';

type TitlePhase = 'loading' | 'tap' | 'menu';

export const TitleScreen = () => {
  const navigate = useNavigate();
  const { user, isChecked, checkAuth } = useAuthStore();
  const { completed } = useTutorialStore();
  const [phase, setPhase] = useState<TitlePhase>('loading');
  const [menuVisible, setMenuVisible] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // 認証済みならゲームへ自動遷移
  useEffect(() => {
    if (!isChecked) return;
    if (user) {
      navigate(completed ? '/' : '/tutorial/intro', { replace: true });
      return;
    }
    // 認証未済ならロゴ表示後にタップ待ち画面へ
    const t = setTimeout(() => setPhase('tap'), 1200);
    return () => clearTimeout(t);
  }, [isChecked, user, completed, navigate]);

  const handleTap = () => {
    if (phase !== 'tap') return;
    setPhase('menu');
    setTimeout(() => setMenuVisible(true), 60);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0535 0%, #08081a 60%, #000 100%)' }}
      onClick={handleTap}
    >
      {/* 星エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2.5 + 0.5}px`,
              height: `${Math.random() * 2.5 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
              animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* 魔法陣リング */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full"
          style={{
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 0 80px rgba(139,92,246,0.18), inset 0 0 80px rgba(139,92,246,0.06)',
            animation: 'glow-pulse 4s ease-in-out infinite',
          }} />
        <div className="absolute w-56 h-56 rounded-full"
          style={{ border: '1px solid rgba(240,192,64,0.2)', animation: 'glow-pulse 3s ease-in-out infinite reverse' }} />
        <div className="absolute w-36 h-36 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.15)', animation: 'glow-pulse 2s ease-in-out infinite' }} />
        {/* 六角形の魔法陣ライン */}
        <svg viewBox="0 0 400 400" className="absolute w-80 h-80 opacity-10"
          style={{ animation: 'spin 20s linear infinite' }}>
          <polygon points="200,40 346,120 346,280 200,360 54,280 54,120" fill="none" stroke="rgba(240,192,64,0.8)" strokeWidth="1" />
          <polygon points="200,80 316,140 316,260 200,320 84,260 84,140" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* ロゴエリア */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 px-8 w-full max-w-sm
        ${phase === 'loading' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

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

        <div className="my-4 w-40 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(240,192,64,0.5), transparent)' }} />

        {/* タップして開始 (menuフェーズ以外) */}
        {phase === 'tap' && (
          <div className="mt-4 text-center animate-pulse">
            <p className="text-sm tracking-[0.3em] text-yellow-300 opacity-80">
              ─ TAP TO START ─
            </p>
            <p className="mt-1 text-xs text-purple-300 opacity-50 tracking-[0.2em]">
              画面をタップして開始
            </p>
          </div>
        )}

        {/* メニューボタン */}
        {phase === 'menu' && (
          <div className={`flex flex-col items-center gap-3 w-full transition-all duration-500
            ${menuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            onClick={e => e.stopPropagation()}>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 0 28px rgba(124,58,237,0.45), 0 4px 16px rgba(0,0,0,0.5)',
                border: '1px solid rgba(167,139,250,0.35)',
              }}>
              ⚔️ ログイン
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

            <button
              onClick={() => setNewsOpen(true)}
              className="w-full py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9ca3af',
              }}>
              📢 お知らせ
            </button>
          </div>
        )}
      </div>

      {/* フッターリンク */}
      {phase !== 'loading' && (
        <div className="absolute bottom-safe bottom-6 flex gap-5 z-10" onClick={e => e.stopPropagation()}>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            onClick={e => { e.preventDefault(); alert('利用規約（準備中）'); }}>
            利用規約
          </a>
          <span className="text-gray-700">|</span>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            onClick={e => { e.preventDefault(); alert('プライバシーポリシー（準備中）'); }}>
            プライバシーポリシー
          </a>
          <span className="text-gray-700">|</span>
          <span className="text-xs text-gray-700">Ver 2.0.0</span>
        </div>
      )}

      {/* お知らせモーダル */}
      {newsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          onClick={() => setNewsOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'rgba(12,8,30,0.97)', border: '1px solid rgba(139,92,246,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white text-sm">📢 お知らせ</h3>
              <button onClick={() => setNewsOpen(false)} className="text-gray-500 text-lg leading-none">×</button>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { date: '2026/06/25', title: 'アルカナブレイドサービス開始！', tag: 'INFO' },
                { date: '2026/06/25', title: 'チュートリアル完了で初回報酬プレゼント', tag: 'EVENT' },
                { date: '2026/06/25', title: '初心者向けガイドを公開しました', tag: 'INFO' },
              ].map((n, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: n.tag === 'EVENT' ? 'rgba(240,192,64,0.2)' : 'rgba(100,100,200,0.2)',
                        color: n.tag === 'EVENT' ? '#fde68a' : '#a5b4fc',
                      }}>{n.tag}</span>
                    <span className="text-xs text-gray-500">{n.date}</span>
                  </div>
                  <p className="text-xs text-gray-300">{n.title}</p>
                </div>
              ))}
            </div>
            <div className="p-4">
              <button onClick={() => setNewsOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(124,58,237,0.4)' }}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
