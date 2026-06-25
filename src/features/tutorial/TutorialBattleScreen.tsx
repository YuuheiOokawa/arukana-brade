import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../stores/tutorialStore';
import { getHerosByGenderAndRace, HERO_UNIT_MASTERS } from '../../data/heroes';
import { ELEMENT_NAMES } from '../../types';

const HINT_STEPS = [
  { title: '通常攻撃', text: '「⚔️攻撃」ボタンをタップして、スライムを攻撃してみよう！', allowedAction: 'attack' },
  { title: 'スキル攻撃', text: '「🔥スキル」ボタンをタップして特殊な技を使おう！BBゲージが溜まるよ！', allowedAction: 'skill' },
  { title: 'ブレイブバースト！', text: 'BBゲージが満タンになった！「💥BB」ボタンで必殺技を放て！', allowedAction: 'bb' },
];

type ActionType = 'attack' | 'skill' | 'bb';

export const TutorialBattleScreen = () => {
  const navigate = useNavigate();
  const { selectedHeroId, selectedGender, selectedRace } = useTutorialStore();

  const hero = selectedHeroId
    ? HERO_UNIT_MASTERS.find(u => u.id === selectedHeroId)
    : selectedGender && selectedRace
    ? (() => { const h = getHerosByGenderAndRace(selectedGender, selectedRace); return h ? HERO_UNIT_MASTERS.find(u => u.id === h.unitMasterId) : null; })()
    : null;

  const heroName = hero?.name ?? 'アルカナード';
  const heroEmoji = hero?.emoji ?? '⚔️';
  const heroElement = hero?.element ?? 'fire';
  const heroHp = hero?.baseStats.hp ?? 4800;

  const [step, setStep] = useState(0);
  const [slimeHp, setSlimeHp] = useState(300);
  const [goblinHp, setGoblinHp] = useState(500);
  const [bbGauge, setBbGauge] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [shaking, setShaking] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 4));

  const shake = (target: string, ms = 400) => {
    setShaking(target);
    setTimeout(() => setShaking(null), ms);
  };

  const doAttack = (type: ActionType) => {
    if (done) return;
    const hint = HINT_STEPS[step];
    if (hint && hint.allowedAction !== type) return;

    if (type === 'attack') {
      const dmg = 320 + Math.floor(Math.random() * 60);
      setSlimeHp(prev => Math.max(0, prev - dmg));
      shake('slime');
      addLog(`${heroName} の通常攻撃！スライムに ${dmg} ダメージ！`);
      setBbGauge(prev => Math.min(100, prev + 40));
      setTimeout(() => setStep(1), 800);
    } else if (type === 'skill') {
      const dmg = 280 + Math.floor(Math.random() * 80);
      setGoblinHp(prev => Math.max(0, prev - dmg));
      shake('goblin');
      addLog(`${heroName} のスキル！ゴブリンに ${dmg} ダメージ！`);
      setBbGauge(100);
      setTimeout(() => setStep(2), 800);
    } else if (type === 'bb') {
      const dmg = 620 + Math.floor(Math.random() * 120);
      setGoblinHp(0);
      shake('goblin');
      addLog(`💥 ブレイブバースト！ゴブリンに ${dmg} ダメージ！必殺！`);
      setBbGauge(0);
      setTimeout(() => { setDone(true); navigate('/tutorial/complete'); }, 1800);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 200);
    return () => clearTimeout(t);
  }, [step]);

  const hint = HINT_STEPS[step];

  return (
    <div className="fixed inset-0 flex flex-col battle-bg overflow-hidden">

      {/* ヘッダー */}
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="text-xs text-purple-300 tracking-widest">⚔ チュートリアルバトル ⚔</div>
      </div>

      {/* 敵エリア */}
      <div className="flex-1 flex items-center justify-around px-6 py-4">

        {/* スライム */}
        <div className={`flex flex-col items-center gap-2 transition-all ${shaking === 'slime' ? 'animate-shake' : ''}`}>
          <div className="text-5xl" style={{ opacity: slimeHp <= 0 ? 0.2 : 1, filter: slimeHp <= 0 ? 'grayscale(1)' : 'none' }}>🫧</div>
          <div className="text-xs text-gray-400 font-medium">影のスライム</div>
          <div className="text-xs" style={{ color: '#34d399' }}>風属性</div>
          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 hp-bar-fill"
              style={{ width: `${(slimeHp / 300) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-400">{slimeHp}/300</div>
          {slimeHp <= 0 && <div className="text-xs text-red-400 font-bold">DEFEAT</div>}
        </div>

        <div className="text-2xl text-gray-600">VS</div>

        {/* ゴブリン */}
        <div className={`flex flex-col items-center gap-2 transition-all ${shaking === 'goblin' ? 'animate-shake' : ''}`}>
          <div className="text-5xl" style={{ opacity: goblinHp <= 0 ? 0.2 : 1, filter: goblinHp <= 0 ? 'grayscale(1)' : 'none' }}>👺</div>
          <div className="text-xs text-gray-400 font-medium">影のゴブリン</div>
          <div className="text-xs" style={{ color: '#c4b5fd' }}>闇属性</div>
          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 hp-bar-fill"
              style={{ width: `${(goblinHp / 500) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-400">{goblinHp}/500</div>
          {goblinHp <= 0 && <div className="text-xs text-red-400 font-bold">DEFEAT</div>}
        </div>
      </div>

      {/* ヒントパネル */}
      {hint && showHint && (
        <div className="mx-4 mb-3 rounded-xl p-3 animate-fade-in"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-sm mt-0.5">💡</span>
            <div>
              <div className="text-xs font-bold text-yellow-300 mb-0.5">{hint.title}</div>
              <div className="text-xs text-gray-200 leading-5">{hint.text}</div>
            </div>
          </div>
        </div>
      )}

      {/* バトルログ */}
      <div className="mx-4 mb-2 h-12 overflow-hidden">
        {log.slice(0, 2).map((l, i) => (
          <div key={i} className="text-xs text-gray-300 leading-6 truncate" style={{ opacity: 1 - i * 0.4 }}>{l}</div>
        ))}
      </div>

      {/* 味方カード */}
      <div className="mx-4 mb-3 card-base rounded-2xl p-3 flex items-center gap-3">
        <div className="text-3xl">{heroEmoji}</div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{heroName}</div>
          <div className="text-xs mb-1" style={{ color: '#facc15' }}>{ELEMENT_NAMES[heroElement]}属性</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full hp-bar-fill" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-gray-400">{heroHp}/{heroHp}</span>
          </div>
        </div>
        {/* BBゲージ */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-yellow-400 font-bold">BB</div>
          <div className="w-6 h-14 bg-gray-800 rounded-full overflow-hidden flex flex-col-reverse">
            <div className="w-full rounded-full bb-gauge-fill transition-all duration-700"
              style={{ height: `${bbGauge}%` }} />
          </div>
          <div className="text-xs text-gray-500">{bbGauge}%</div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="px-4 pb-6 grid grid-cols-3 gap-3">
        <button onClick={() => doAttack('attack')}
          disabled={step !== 0 || done}
          className="py-4 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-all duration-150"
          style={{
            background: step === 0 ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(30,30,60,0.5)',
            border: `1.5px solid ${step === 0 ? 'rgba(96,165,250,0.6)' : 'rgba(75,85,99,0.3)'}`,
            color: step === 0 ? 'white' : '#4b5563',
            boxShadow: step === 0 ? '0 0 20px rgba(37,99,235,0.35)' : 'none',
          }}>
          ⚔️<br /><span className="text-xs">攻撃</span>
        </button>

        <button onClick={() => doAttack('skill')}
          disabled={step !== 1 || done}
          className="py-4 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-all duration-150"
          style={{
            background: step === 1 ? 'linear-gradient(135deg, #b45309, #d97706)' : 'rgba(30,30,60,0.5)',
            border: `1.5px solid ${step === 1 ? 'rgba(251,191,36,0.6)' : 'rgba(75,85,99,0.3)'}`,
            color: step === 1 ? 'white' : '#4b5563',
            boxShadow: step === 1 ? '0 0 20px rgba(217,119,6,0.35)' : 'none',
          }}>
          🔥<br /><span className="text-xs">スキル</span>
        </button>

        <button onClick={() => doAttack('bb')}
          disabled={step !== 2 || bbGauge < 100 || done}
          className={`py-4 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-all duration-150 ${step === 2 && bbGauge >= 100 ? 'animate-bb-ready' : ''}`}
          style={{
            background: step === 2 && bbGauge >= 100 ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(30,30,60,0.5)',
            border: `1.5px solid ${step === 2 && bbGauge >= 100 ? 'rgba(167,139,250,0.8)' : 'rgba(75,85,99,0.3)'}`,
            color: step === 2 && bbGauge >= 100 ? 'white' : '#4b5563',
          }}>
          💥<br /><span className="text-xs">BB</span>
        </button>
      </div>
    </div>
  );
};
