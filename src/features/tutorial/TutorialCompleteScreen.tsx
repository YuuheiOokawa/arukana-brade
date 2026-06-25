import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../stores/tutorialStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { HERO_MASTER } from '../../data/heroes';
import { ELEMENT_NAMES } from '../../types';

const TUTORIAL_REWARDS = [
  { emoji: '💰', label: 'ゴールド', value: '+5,000G' },
  { emoji: '💎', label: 'ダイヤ', value: '+500個' },
  { emoji: '🎫', label: '召喚チケット', value: '+3枚' },
  { emoji: '⭐', label: '強化素材セット', value: '各種×3' },
];

export const TutorialCompleteScreen = () => {
  const navigate = useNavigate();
  const { playerName, selectedHeroId, selectedGender, selectedRace, setPhase: setTutorialPhase } = useTutorialStore();
  const { setupFromTutorial } = usePlayerStore();
  const { addUnit } = useUnitStore();

  const [screenPhase, setScreenPhase] = useState<'rewards' | 'hero' | 'ready'>('rewards');
  const [rewardIndex, setRewardIndex] = useState(0);
  const [done, setDone] = useState(false);

  const heroMaster = HERO_MASTER.find(h =>
    selectedHeroId
      ? h.heroId === selectedHeroId
      : h.gender === selectedGender && h.race === selectedRace
  ) ?? null;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TUTORIAL_REWARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setRewardIndex(i + 1), 400 + i * 600));
    });
    timers.push(setTimeout(() => setScreenPhase('hero'), 400 + TUTORIAL_REWARDS.length * 600 + 200));
    timers.push(setTimeout(() => setScreenPhase('ready'), 400 + TUTORIAL_REWARDS.length * 600 + 1400));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleComplete = () => {
    if (done) return;
    setDone(true);

    setupFromTutorial(playerName || '勇者');

    if (heroMaster?.unitMasterId) {
      try { addUnit(heroMaster.unitMasterId); } catch { /* ignore */ }
    }

    // 初回ガチャへ遷移（completeTutorial はガチャ後に呼ばれる）
    setTutorialPhase('initial_gacha');
    navigate('/tutorial/gacha');
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #1a0a30 0%, #08081a 60%)' }}
    >
      {/* キラキラエフェクト */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-400 animate-float-up"
            style={{
              left: `${5 + Math.random() * 90}%`,
              bottom: `${Math.random() * 30}%`,
              fontSize: `${10 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.6,
            }}
          >
            {(['✨', '⭐', '💫', '🌟'] as const)[Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">

        {/* タイトル */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-black text-white mb-1">チュートリアル完了！</h1>
          <p className="text-sm text-purple-300">{playerName || '勇者'} さん、ようこそ！</p>
        </div>

        {/* 報酬パネル */}
        <div className="w-full card-glass rounded-2xl p-4 mb-4">
          <div className="text-xs text-yellow-400 font-bold tracking-widest mb-3 text-center">
            ── 初回報酬 ──
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TUTORIAL_REWARDS.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-xl transition-all duration-500"
                style={{
                  background: i < rewardIndex ? 'rgba(124,58,237,0.2)' : 'rgba(18,18,42,0.4)',
                  border: `1px solid ${i < rewardIndex ? 'rgba(167,139,250,0.4)' : 'rgba(75,85,99,0.2)'}`,
                  opacity: i < rewardIndex ? 1 : 0.3,
                  transform: i < rewardIndex ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <span className="text-xl">{r.emoji}</span>
                <div>
                  <div className="text-xs text-gray-400">{r.label}</div>
                  <div className="text-xs font-bold text-yellow-300">{r.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 主人公カード */}
        {screenPhase !== 'rewards' && heroMaster && (
          <div className="w-full card-glass rounded-2xl p-4 mb-6 animate-slide-up">
            <div className="text-xs text-yellow-400 font-bold tracking-widest mb-3 text-center">
              ── 主人公ユニット獲得！ ──
            </div>
            <div className="flex items-center gap-3">
              <div className="text-5xl">{heroMaster.emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-black"
                    style={{ background: 'linear-gradient(135deg, #d97706, #ef4444, #7c3aed)', color: 'white' }}
                  >
                    SSR
                  </span>
                  <span className="text-sm font-bold text-white">{heroMaster.name}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{heroMaster.title}</div>
                <div className="text-xs" style={{ color: '#facc15' }}>
                  {ELEMENT_NAMES[heroMaster.element]}属性
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ホームへボタン */}
        {screenPhase === 'ready' && (
          <button
            onClick={handleComplete}
            disabled={done}
            className="w-full py-4 rounded-2xl font-black text-white text-base cursor-pointer active:scale-95 transition-all duration-200 animate-slide-up animate-pulse-gold"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 30px rgba(124,58,237,0.6)',
              border: '1px solid rgba(167,139,250,0.5)',
            }}
          >
            ⚔️ 冒険を始める！
          </button>
        )}
      </div>
    </div>
  );
};
