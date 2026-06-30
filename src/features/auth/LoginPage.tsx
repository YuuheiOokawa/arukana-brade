import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTutorialStore } from '../../stores/tutorialStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { completeTutorial } = useTutorialStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as {
        user?: { id: string; email: string };
        player?: {
          playerId: string; playerName: string; tutorialCompleted: boolean;
          playerRank: number; stamina: number; maxStamina: number;
          gold: number; diamond: number; exp: number;
          title: string | null; bio: string | null;
          favoriteUnitId: string | null; loginDays: number; lastLoginAt: string;
          staminaRecoveryTime: number; arcanaPlayerId: string; miscData: Record<string, unknown>;
        };
        gameData?: import('../../stores/authStore').GameDataResponse | null;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? 'ログインに失敗しました');
        return;
      }

      if (data.user && data.player) {
        setAuth(data.user, data.player, data.gameData);
        if (data.player.tutorialCompleted) {
          completeTutorial();
          navigate('/', { replace: true });
        } else {
          navigate('/tutorial/intro', { replace: true });
        }
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0535 0%, #08081a 60%, #000 100%)' }}>

      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* タイトル */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.5em] text-yellow-400 mb-3 opacity-70">✦ ARCANA BRAVE ✦</div>
          <h1 className="text-2xl font-black text-white mb-1">ログイン</h1>
          <p className="text-sm text-gray-500">アカウントにサインイン</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(18,18,42,0.8)',
                border: '1.5px solid rgba(75,85,99,0.5)',
                boxShadow: email ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(75,85,99,0.5)')}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8文字以上"
              autoComplete="current-password"
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(18,18,42,0.8)',
                border: '1.5px solid rgba(75,85,99,0.5)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(75,85,99,0.5)')}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200 mt-2"
            style={{
              background: isLoading
                ? 'rgba(75,85,99,0.4)'
                : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: isLoading ? 'none' : '0 0 24px rgba(124,58,237,0.4)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}>
            {isLoading ? '確認中...' : 'ログイン'}
          </button>
        </form>

        {/* 区切り */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(75,85,99,0.4)' }} />
          <span className="text-xs text-gray-600">または</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(75,85,99,0.4)' }} />
        </div>

        {/* 新規登録リンク */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">アカウントをお持ちでない方</p>
          <Link to="/register"
            className="block w-full py-3.5 rounded-2xl font-bold text-sm text-purple-300 transition-all active:scale-95"
            style={{
              border: '1.5px solid rgba(139,92,246,0.4)',
              background: 'rgba(139,92,246,0.08)',
            }}>
            新規登録はこちら
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link to="/title" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ← タイトルに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};
