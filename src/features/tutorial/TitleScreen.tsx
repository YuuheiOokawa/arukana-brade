import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTutorialStore } from '../../stores/tutorialStore';
import { usePlayerStore } from '../../stores/playerStore';

const ADMIN_EMAIL = 'yuuheiookawa@gmail.com';

type TitlePhase = 'loading' | 'tap' | 'menu';

export const TitleScreen = () => {
  const navigate = useNavigate();
  const { user, isChecked, checkAuth, player: authPlayer } = useAuthStore();
  const { completed, completeTutorial } = useTutorialStore();
  const { syncFromAuth, setAdminMode } = usePlayerStore();
  const [phase, setPhase] = useState<TitlePhase>('loading');
  const [menuVisible, setMenuVisible] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [legalOpen, setLegalOpen] = useState<'tos' | 'privacy' | null>(null);

  useEffect(() => {
    void checkAuth();
    const t = setTimeout(() => setLogoVisible(true), 200);
    return () => clearTimeout(t);
  }, [checkAuth]);

  // タイトル画面でSW更新チェック → 新版があれば自動リロード
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handleControllerChange = () => { window.location.reload(); };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.getRegistration().then(reg => { reg?.update(); });
    return () => { navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange); };
  }, []);

  useEffect(() => {
    if (!isChecked) return;
    if (user && authPlayer) {
      syncFromAuth(authPlayer);
      if (authPlayer.tutorialCompleted && !completed) completeTutorial();
      if (user.email === ADMIN_EMAIL) setAdminMode();
      const done = completed || authPlayer.tutorialCompleted;
      navigate(done ? '/' : '/tutorial/intro', { replace: true });
      return;
    }
    if (!user && isChecked) {
      const t = setTimeout(() => setPhase('tap'), 1400);
      return () => clearTimeout(t);
    }
  }, [isChecked, user, authPlayer, completed, navigate, syncFromAuth, completeTutorial, setAdminMode]);

  const handleTap = () => {
    if (phase !== 'tap') return;
    setPhase('menu');
    setTimeout(() => setMenuVisible(true), 80);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
    >
      {/* 背景画像 */}
      <img
        src="/assets/images/backgrounds/title/bg_ui_title.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />
      {/* グラデーションオーバーレイ */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(2,2,12,0.2) 0%, rgba(4,3,16,0.45) 40%, rgba(6,4,20,0.75) 70%, rgba(8,5,22,0.92) 100%)',
        }}
      />

      {/* 星エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 70}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* メインコンテンツ */}
      <div
        className="relative flex flex-col items-center w-full max-w-sm px-6"
        style={{ zIndex: 10 }}
      >
        {/* ロゴカード */}
        <div
          className="w-full text-center mb-8"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease, transform 1s ease',
          }}
        >
          {/* 上部ラベル */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(240,192,64,0.6))' }} />
            <span
              className="text-[10px] font-bold tracking-[0.5em]"
              style={{ color: '#c4a040', fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              DARK FANTASY RPG
            </span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(240,192,64,0.6))' }} />
          </div>

          {/* タイトルロゴ */}
          <div className="mb-2">
            <h1
              style={{
                fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(2.0rem, 8.5vw, 3.4rem)',
                lineHeight: 1.1,
                background: 'linear-gradient(160deg, #fff8e0 0%, #fde68a 25%, #f0c040 55%, #d97706 80%, #b45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(240,192,64,0.6)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}
            >
              アルカナブレイド
            </h1>
          </div>

          {/* サブタイトル */}
          <p
            className="text-sm mb-1"
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 500,
              color: 'rgba(200,185,255,0.75)',
              letterSpacing: '0.3em',
            }}
          >
            ～ 剣と召喚の覇者 ～
          </p>

          {/* バージョンバッジ */}
          <div className="flex justify-center mt-3">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.35)',
                color: '#a78bfa',
                letterSpacing: '0.15em',
              }}
            >
              Ver 2.0.0
            </span>
          </div>
        </div>

        {/* TAP TO START */}
        {phase === 'tap' && (
          <div
            className="mb-2 text-center"
            style={{
              animation: 'glow-pulse 1.8s ease-in-out infinite',
            }}
          >
            <p
              className="text-sm font-bold tracking-[0.4em]"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                color: 'rgba(253,230,138,0.85)',
              }}
            >
              タップして開始
            </p>
            <p className="text-xs mt-1 tracking-[0.25em]" style={{ color: 'rgba(167,139,250,0.55)' }}>
              TAP TO START
            </p>
          </div>
        )}

        {/* メニューボタン */}
        {phase === 'menu' && (
          <div
            className={`flex flex-col gap-3 w-full transition-all duration-500
              ${menuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-all duration-150"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 900,
                background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
                boxShadow: '0 0 32px rgba(109,40,217,0.5), 0 4px 20px rgba(0,0,0,0.6)',
                border: '1px solid rgba(167,139,250,0.4)',
                letterSpacing: '0.1em',
              }}
            >
              ログイン
            </button>

            <button
              onClick={() => navigate('/register')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-all duration-150"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 700,
                background: 'rgba(79,70,229,0.12)',
                border: '1.5px solid rgba(139,92,246,0.45)',
                color: '#c4b5fd',
                letterSpacing: '0.1em',
              }}
            >
              新規登録
            </button>

            <button
              onClick={() => setNewsOpen(true)}
              className="w-full py-2.5 rounded-xl text-xs active:scale-95 transition-all"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#6b7280',
                letterSpacing: '0.1em',
              }}
            >
              お知らせ
            </button>
          </div>
        )}
      </div>

      {/* フッター */}
      {phase !== 'loading' && (
        <div
          className="absolute bottom-6 flex gap-5"
          style={{ zIndex: 10 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="text-xs transition-colors"
            style={{ color: '#374151', fontFamily: "'Noto Sans JP', sans-serif" }}
            onClick={() => setLegalOpen('tos')}
          >
            利用規約
          </button>
          <span style={{ color: '#1f2937' }}>|</span>
          <button
            className="text-xs transition-colors"
            style={{ color: '#374151', fontFamily: "'Noto Sans JP', sans-serif" }}
            onClick={() => setLegalOpen('privacy')}
          >
            プライバシーポリシー
          </button>
        </div>
      )}

      {/* お知らせモーダル */}
      {newsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ zIndex: 50 }}
          onClick={() => setNewsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10,6,28,0.97)', border: '1px solid rgba(139,92,246,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3
                className="font-bold text-white text-sm"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                お知らせ
              </h3>
              <button onClick={() => setNewsOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { date: '2026/06/25', title: 'アルカナブレイドサービス開始！', tag: 'INFO' },
                { date: '2026/06/25', title: 'チュートリアル完了で初回報酬プレゼント', tag: 'EVENT' },
                { date: '2026/06/25', title: '初心者向けガイドを公開しました', tag: 'INFO' },
              ].map((n, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: n.tag === 'EVENT' ? 'rgba(240,192,64,0.2)' : 'rgba(100,100,200,0.2)',
                        color: n.tag === 'EVENT' ? '#fde68a' : '#a5b4fc',
                      }}
                    >
                      {n.tag}
                    </span>
                    <span className="text-xs text-gray-500">{n.date}</span>
                  </div>
                  <p
                    className="text-xs text-gray-300"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {n.title}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4">
              <button
                onClick={() => setNewsOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'rgba(124,58,237,0.4)',
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 利用規約/プライバシーポリシー モーダル */}
      {legalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ zIndex: 50 }}
          onClick={() => setLegalOpen(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10,6,28,0.97)', border: '1px solid rgba(139,92,246,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3
                className="font-bold text-white text-sm"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                {legalOpen === 'tos' ? '利用規約' : 'プライバシーポリシー'}
              </h3>
              <button onClick={() => setLegalOpen(null)} className="text-gray-500 text-xl leading-none">×</button>
            </div>
            <div className="px-5 py-4 space-y-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {legalOpen === 'tos' ? (
                <>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                    本サービス（以下「アルカナブレイド」）のご利用にあたっては、以下の利用規約に同意いただく必要があります。
                  </p>
                  <p className="text-gray-300 text-xs font-bold mt-3">第1条（サービスの利用）</p>
                  <p className="text-gray-400 text-xs">本サービスは個人利用を目的としています。商業目的での利用や、不正なアクセスは禁止します。</p>
                  <p className="text-gray-300 text-xs font-bold mt-2">第2条（禁止事項）</p>
                  <p className="text-gray-400 text-xs">不正ツールの使用、他ユーザーへの迷惑行為、サービスの妨害行為は禁止します。</p>
                  <p className="text-gray-300 text-xs font-bold mt-2">第3条（免責事項）</p>
                  <p className="text-gray-400 text-xs">本サービスは現状提供であり、サービスの継続性や完全性を保証するものではありません。</p>
                  <p className="text-gray-500 text-[10px] mt-3">最終更新日：2026年6月25日</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                    本サービスにおける個人情報の取り扱いについてご説明します。
                  </p>
                  <p className="text-gray-300 text-xs font-bold mt-3">収集する情報</p>
                  <p className="text-gray-400 text-xs">メールアドレス、ゲームプレイデータ（進行状況、所持ユニット等）を収集します。</p>
                  <p className="text-gray-300 text-xs font-bold mt-2">情報の利用目的</p>
                  <p className="text-gray-400 text-xs">収集した情報はサービスの提供・改善のためにのみ使用します。第三者への提供は行いません。</p>
                  <p className="text-gray-300 text-xs font-bold mt-2">データの保管</p>
                  <p className="text-gray-400 text-xs">ゲームデータはお客様のデバイスおよびサーバーに保管されます。アカウント削除時にはデータも削除されます。</p>
                  <p className="text-gray-500 text-[10px] mt-3">最終更新日：2026年6月25日</p>
                </>
              )}
            </div>
            <div className="p-4">
              <button
                onClick={() => setLegalOpen(null)}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'rgba(124,58,237,0.4)',
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
