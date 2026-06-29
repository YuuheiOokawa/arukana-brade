import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERO_MASTER } from '../../data/heroes';
import { RACE_MASTER } from '../../data/races';
import { useTutorialStore } from '../../stores/tutorialStore';
import { ELEMENT_NAMES } from '../../types';
import type { GenderType, RaceType } from '../../types';

const GENDER_OPTIONS: { id: GenderType; label: string; emoji: string }[] = [
  { id: 'male', label: '男', emoji: '⚔️' },
  { id: 'female', label: '女', emoji: '✨' },
];

const ELEMENT_COLOR: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

export const HeroSelectScreen = () => {
  const navigate = useNavigate();
  const { playerName, selectedGender, selectedRace, selectGender, selectRace, selectHero, setPhase } = useTutorialStore();

  const [gender, setGenderState] = useState<GenderType | null>(selectedGender);
  const [race, setRaceState] = useState<RaceType | null>(selectedRace);
  const [confirmed] = useState(false);

  const selectedHero = gender && race ? HERO_MASTER.find(h => h.gender === gender && h.race === race) : null;

  const handleGender = (g: GenderType) => { setGenderState(g); selectGender(g); setRaceState(null); selectRace(null as unknown as RaceType); };
  const handleRace = (r: RaceType) => { setRaceState(r); selectRace(r); };

  const handleConfirm = () => {
    if (!selectedHero) return;
    selectHero(selectedHero.heroId);
    setPhase('tutorial_battle');
    navigate('/tutorial/battle');
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #150530 0%, #08081a 70%)' }}>

      {/* ヘッダー */}
      <div className="px-4 pt-safe pt-6 pb-4 text-center">
        <p className="text-xs text-purple-400 mb-1">{playerName} さん、</p>
        <h1 className="text-lg font-bold text-yellow-300">主人公を選んでください</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">

        {/* 性別選択 */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2 font-medium tracking-wider">STEP 1 ── 性別</p>
          <div className="grid grid-cols-2 gap-3">
            {GENDER_OPTIONS.map(g => (
              <button key={g.id} onClick={() => handleGender(g.id)}
                className="py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-all duration-150"
                style={{
                  background: gender === g.id ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(18,18,42,0.6)',
                  border: `1.5px solid ${gender === g.id ? 'rgba(167,139,250,0.6)' : 'rgba(75,85,99,0.4)'}`,
                  color: gender === g.id ? 'white' : '#9ca3af',
                  boxShadow: gender === g.id ? '0 0 16px rgba(124,58,237,0.35)' : 'none',
                }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 種族選択 */}
        {gender && (
          <div className="mb-5 animate-fade-in">
            <p className="text-xs text-gray-400 mb-2 font-medium tracking-wider">STEP 2 ── 種族</p>
            <div className="grid grid-cols-1 gap-2">
              {RACE_MASTER.map(r => (
                <button key={r.id} onClick={() => handleRace(r.id as RaceType)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-98 transition-all duration-150 text-left"
                  style={{
                    background: race === r.id ? 'rgba(124,58,237,0.2)' : 'rgba(18,18,42,0.5)',
                    border: `1.5px solid ${race === r.id ? 'rgba(167,139,250,0.6)' : 'rgba(75,85,99,0.3)'}`,
                  }}>
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white">{r.name}</div>
                    <div className="text-xs text-gray-400 truncate">{r.statFocus}</div>
                  </div>
                  {race === r.id && <span className="text-purple-400 text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 主人公プレビュー */}
        {selectedHero && (
          <div className="mb-5 animate-fade-in">
            <p className="text-xs text-gray-400 mb-2 font-medium tracking-wider">STEP 3 ── 主人公確認</p>
            <div className="card-glass rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="text-6xl">{selectedHero.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">{selectedHero.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{selectedHero.title}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: 'rgba(240,192,64,0.2)', color: '#f0c040', border: '1px solid rgba(240,192,64,0.3)' }}>
                      ★3
                    </span>
                    <span className="text-xs font-medium" style={{ color: ELEMENT_COLOR[selectedHero.element] }}>
                      {ELEMENT_NAMES[selectedHero.element]}属性
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-5">{selectedHero.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-yellow-300 italic text-center">
                  {selectedHero.catchphrase}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 決定ボタン */}
      <div className="absolute bottom-0 left-0 right-0 p-4"
        style={{ background: 'linear-gradient(to top, #08081a 60%, transparent)' }}>
        <button onClick={handleConfirm} disabled={!selectedHero || confirmed}
          className="w-full py-4 rounded-2xl font-bold text-white text-base cursor-pointer active:scale-95 transition-all duration-200"
          style={{
            background: selectedHero ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(75,85,99,0.4)',
            boxShadow: selectedHero ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
            opacity: selectedHero ? 1 : 0.5,
          }}>
          {selectedHero ? `${selectedHero.name} で冒険へ！⚔️` : '主人公を選んでください'}
        </button>
      </div>
    </div>
  );
};
