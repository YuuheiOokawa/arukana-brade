import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../stores/tutorialStore';

const INTRO_SCENES = [
  {
    bg: 'radial-gradient(ellipse at top, #0a1530 0%, #08081a 70%)',
    emoji: '🌑',
    title: 'アルカナの力が失われた世界',
    text: '古来より、世界は「アルカナ」と呼ばれる神秘の力によって守られてきた。しかしある日、その力は突然世界から失われ——闇の魔物たちが溢れ出した。',
  },
  {
    bg: 'radial-gradient(ellipse at top, #1a0535 0%, #08081a 70%)',
    emoji: '⚡',
    title: '目覚めた召喚者',
    text: 'その混乱の中、一人の若者がアルカナの力に目覚めた。それがあなたの物語の始まり。仲間を召喚し、世界の謎に挑む使命が今始まる。',
  },
  {
    bg: 'radial-gradient(ellipse at top, #0a2030 0%, #08081a 70%)',
    emoji: '✨',
    title: '最初の仲間との出会い',
    text: '目覚めた召喚者の前に最初の仲間が現れた。彼女／彼らとともに、失われたアルカナの真実を追い求めよう。',
  },
  {
    bg: 'radial-gradient(ellipse at top, #1a0a00 0%, #08081a 70%)',
    emoji: '⚔️',
    title: '最初の試練へ',
    text: '旅の始まりに、目の前に魔物が現れた！まずはバトルで戦い方を覚えよう。アルカナブレイドの冒険が今、幕を開ける——！',
  },
];

export const TutorialIntroScreen = () => {
  const navigate = useNavigate();
  const { setPhase } = useTutorialStore();
  const [scene, setScene] = useState(0);
  const [fading, setFading] = useState(false);

  const goNext = () => {
    if (scene < INTRO_SCENES.length - 1) {
      setFading(true);
      setTimeout(() => {
        setScene(s => s + 1);
        setFading(false);
      }, 300);
    } else {
      setPhase('name_input');
      navigate('/tutorial/name');
    }
  };

  const skip = () => {
    setPhase('name_input');
    navigate('/tutorial/name');
  };

  const current = INTRO_SCENES[scene];

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: current.bg, transition: 'background 0.5s ease' }}>

      {/* スキップ */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={skip} className="text-xs text-gray-500 border border-gray-700 rounded-lg px-3 py-1 cursor-pointer">
          スキップ →
        </button>
      </div>

      {/* シーン番号 */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-20">
        {INTRO_SCENES.map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all duration-300"
            style={{ width: i === scene ? '24px' : '8px', background: i <= scene ? '#8b5cf6' : 'rgba(139,92,246,0.2)' }}
          />
        ))}
      </div>

      {/* コンテンツ */}
      <div className={`flex-1 flex flex-col items-center justify-center px-8 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-7xl mb-8 animate-pulse-gold">{current.emoji}</div>

        <div className="card-glass rounded-2xl p-6 w-full max-w-sm mb-6">
          <h2 className="text-lg font-bold text-yellow-300 mb-3 text-center">{current.title}</h2>
          <p className="text-gray-200 text-sm leading-7 text-center">{current.text}</p>
        </div>
      </div>

      {/* 次へボタン */}
      <div className="p-6">
        <button onClick={goNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}>
          {scene < INTRO_SCENES.length - 1 ? 'つぎへ →' : '冒険を始める ⚔️'}
        </button>
      </div>
    </div>
  );
};
