import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../stores/tutorialStore';

const FORBIDDEN_PATTERN = /[<>'"&\\\/]/;

export const PlayerNameInputScreen = () => {
  const navigate = useNavigate();
  const { setPlayerName, setPhase } = useTutorialStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validate = (value: string): string => {
    if (!value.trim()) return 'プレイヤー名を入力してください';
    if (value.length > 12) return '12文字以内で入力してください';
    if (FORBIDDEN_PATTERN.test(value)) return '使用できない文字が含まれています';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    setError(validate(v));
  };

  const handleNext = () => {
    const err = validate(name);
    if (err) { setError(err); return; }
    setPlayerName(name.trim());
    setPhase('hero_select');
    navigate('/tutorial/hero');
  };

  const isValid = !error && name.trim().length > 0;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at top, #0a0a30 0%, #08081a 70%)' }}>

      {/* 装飾ライン */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

      <div className="w-full max-w-sm">
        {/* アイコン */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📜</div>
          <h1 className="text-xl font-bold text-yellow-300 mb-2">あなたの名前は？</h1>
          <p className="text-sm text-gray-400">召喚者として歴史に刻まれる名前を入力してください</p>
        </div>

        {/* 入力フィールド */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="プレイヤー名（最大12文字）"
              maxLength={14}
              autoFocus
              className="w-full px-4 py-4 text-center text-lg text-white rounded-xl outline-none transition-all duration-200"
              style={{
                background: 'rgba(18,18,42,0.8)',
                border: `2px solid ${error ? 'rgba(239,68,68,0.6)' : isValid ? 'rgba(139,92,246,0.8)' : 'rgba(75,85,99,0.5)'}`,
                boxShadow: isValid ? '0 0 16px rgba(139,92,246,0.3)' : 'none',
              }}
            />
            {name && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: name.length > 12 ? '#ef4444' : '#6b7280' }}>
                {name.length}/12
              </div>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}
        </div>

        {/* 候補名 */}
        <div className="mb-8">
          <p className="text-xs text-gray-500 text-center mb-3">おすすめの名前</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['アルカナ', 'ソレイユ', 'レイン', 'カイト', 'シオン', 'ルーナ'].map(n => (
              <button key={n} onClick={() => { setName(n); setError(''); }}
                className="px-3 py-1 text-xs rounded-lg border border-gray-700 text-gray-300 cursor-pointer hover:border-purple-500 hover:text-purple-300 transition-colors">
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 次へボタン */}
        <button onClick={handleNext} disabled={!isValid}
          className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200"
          style={{
            background: isValid
              ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
              : 'rgba(75,85,99,0.4)',
            boxShadow: isValid ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
            opacity: isValid ? 1 : 0.5,
          }}>
          主人公を選ぶ →
        </button>
      </div>
    </div>
  );
};
