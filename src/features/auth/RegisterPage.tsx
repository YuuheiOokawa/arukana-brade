import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): string => {
    if (!email) return 'メールアドレスを入力してください';
    if (!EMAIL_RE.test(email)) return 'メールアドレスの形式が正しくありません';
    if (!password) return 'パスワードを入力してください';
    if (password.length < 8) return 'パスワードは8文字以上で入力してください';
    if (password !== confirmPassword) return 'パスワードが一致しません';
    if (!agreed) return '利用規約に同意してください';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password }),
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
        setError(data.error ?? '登録に失敗しました');
        return;
      }

      if (data.user && data.player) {
        setAuth(data.user, data.player, data.gameData);
        navigate('/tutorial/intro', { replace: true });
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 overflow-y-auto"
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

      <div className="relative z-10 w-full max-w-sm py-8">
        {/* タイトル */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.5em] text-yellow-400 mb-3 opacity-70">✦ ARCANA BRAVE ✦</div>
          <h1 className="text-2xl font-black text-white mb-1">新規登録</h1>
          <p className="text-sm text-gray-500">アカウントを作成する</p>
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
              autoComplete="new-password"
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(18,18,42,0.8)',
                border: '1.5px solid rgba(75,85,99,0.5)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(75,85,99,0.5)')}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">パスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              autoComplete="new-password"
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(18,18,42,0.8)',
                border: `1.5px solid ${
                  confirmPassword && confirmPassword !== password
                    ? 'rgba(239,68,68,0.6)'
                    : 'rgba(75,85,99,0.5)'
                }`,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)')}
              onBlur={e => {
                e.currentTarget.style.borderColor =
                  confirmPassword && confirmPassword !== password
                    ? 'rgba(239,68,68,0.6)'
                    : 'rgba(75,85,99,0.5)';
              }}
            />
          </div>

          {/* 利用規約 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className="w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  background: agreed ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(18,18,42,0.8)',
                  border: `1.5px solid ${agreed ? 'rgba(139,92,246,0.8)' : 'rgba(75,85,99,0.5)'}`,
                }}>
                {agreed && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </div>
            <span className="text-xs text-gray-400 leading-relaxed">
              <span className="text-purple-400 underline cursor-pointer">利用規約</span>
              および
              <span className="text-purple-400 underline cursor-pointer">プライバシーポリシー</span>
              に同意する
            </span>
          </label>

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
            {isLoading ? '登録中...' : '新規登録'}
          </button>
        </form>

        {/* ログインリンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">既にアカウントをお持ちの方</p>
          <Link to="/login"
            className="block w-full py-3.5 rounded-2xl font-bold text-sm text-purple-300 transition-all active:scale-95"
            style={{
              border: '1.5px solid rgba(139,92,246,0.4)',
              background: 'rgba(139,92,246,0.08)',
            }}>
            ログインはこちら
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/title" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
            ← タイトルに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};
