import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERO_MASTER } from '../../data/heroes';
import { RACE_MASTER } from '../../data/races';
import { useTutorialStore } from '../../stores/tutorialStore';
import { ELEMENT_NAMES } from '../../types';
import type { GenderType, RaceType } from '../../types';
import { resolveUnitImage } from '../../lib/unitImage';

const GENDER_OPTIONS: { id: GenderType; label: string; emoji: string }[] = [
  { id: 'male', label: '男', emoji: '⚔️' },
  { id: 'female', label: '女', emoji: '✨' },
];

const ELEMENT_COLOR: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

const ELEMENT_GRADIENT: Record<string, string> = {
  fire:    'linear-gradient(135deg, #7f1d1d, #ef4444)',
  water:   'linear-gradient(135deg, #1e3a5f, #3b82f6)',
  wind:    'linear-gradient(135deg, #064e3b, #10b981)',
  earth:   'linear-gradient(135deg, #451a03, #d97706)',
  light:   'linear-gradient(135deg, #713f12, #fde68a)',
  dark:    'linear-gradient(135deg, #1e1b4b, #7c3aed)',
  thunder: 'linear-gradient(135deg, #1c1917, #eab308)',
};

export const HeroSelectScreen = () => {
  const navigate = useNavigate();
  const { playerName, selectedGender, selectedRace, selectGender, selectRace, selectHero, setPhase } = useTutorialStore();

  const [gender, setGenderState] = useState<GenderType | null>(selectedGender);
  const [race, setRaceState] = useState<RaceType | null>(selectedRace);
  const [confirmed] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const selectedHero = gender && race ? HERO_MASTER.find(h => h.gender === gender && h.race === race) : null;

  const handleGender = (g: GenderType) => { setGenderState(g); selectGender(g); setRaceState(null); selectRace(null as unknown as RaceType); };
  const handleRace = (r: RaceType) => { setRaceState(r); selectRace(r); };

  const handleConfirm = () => {
    if (!selectedHero) return;
    selectHero(selectedHero.heroId);
    setPhase('tutorial_battle');
    navigate('/tutorial/battle');
  };

  // 種族ごとの小プレビュー画像（現在の性別に対応するヒーロー）
  const getRaceHero = (raceId: string) =>
    gender ? HERO_MASTER.find(h => h.gender === gender && h.race === raceId) : null;

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
              {RACE_MASTER.map(r => {
                const raceHero = getRaceHero(r.id);
                const imgKey = `${gender}_${r.id}`;
                const imgSrc = raceHero ? resolveUnitImage(raceHero.unitMasterId, 3) : '';
                const isSelected = race === r.id;
                return (
                  <button key={r.id} onClick={() => handleRace(r.id as RaceType)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-98 transition-all duration-150 text-left"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.2)' : 'rgba(18,18,42,0.5)',
                      border: `1.5px solid ${isSelected ? 'rgba(167,139,250,0.6)' : 'rgba(75,85,99,0.3)'}`,
                    }}>
                    {/* キャラクター画像サムネイル */}
                    <div className="flex-shrink-0 rounded-xl overflow-hidden"
                      style={{
                        width: 52, height: 64,
                        background: raceHero ? ELEMENT_GRADIENT[raceHero.element] : '#1a1a35',
                      }}>
                      {raceHero && imgSrc && !imgErrors[imgKey] ? (
                        <img
                          src={imgSrc}
                          alt={raceHero.name}
                          onError={() => setImgErrors(prev => ({ ...prev, [imgKey]: true }))}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {r.emoji}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white">{r.name}</div>
                      <div className="text-xs text-gray-400 truncate">{r.statFocus}</div>
                      {raceHero && (
                        <div className="text-xs mt-0.5 font-medium" style={{ color: ELEMENT_COLOR[raceHero.element] }}>
                          {raceHero.name} / {ELEMENT_NAMES[raceHero.element]}属性
                        </div>
                      )}
                    </div>
                    {isSelected && <span className="text-purple-400 text-sm flex-shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 主人公プレビュー */}
        {selectedHero && (
          <div className="mb-5 animate-fade-in">
            <p className="text-xs text-gray-400 mb-2 font-medium tracking-wider">STEP 3 ── 主人公確認</p>
            <div className="card-glass rounded-2xl overflow-hidden">
              {/* キャラクター画像（大） */}
              <div className="relative"
                style={{
                  height: 220,
                  background: ELEMENT_GRADIENT[selectedHero.element],
                }}>
                {!imgErrors[`preview_${selectedHero.heroId}`] ? (
                  <img
                    src={resolveUnitImage(selectedHero.unitMasterId, 3)}
                    alt={selectedHero.name}
                    onError={() => setImgErrors(prev => ({ ...prev, [`preview_${selectedHero.heroId}`]: true }))}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'top center',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {selectedHero.emoji}
                  </div>
                )}
                {/* 属性バッジ */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    color: ELEMENT_COLOR[selectedHero.element],
                    border: `1px solid ${ELEMENT_COLOR[selectedHero.element]}66`,
                  }}>
                  {ELEMENT_NAMES[selectedHero.element]}属性
                </div>
                {/* レアリティバッジ */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(240,192,64,0.25)', color: '#f0c040', border: '1px solid rgba(240,192,64,0.4)' }}>
                  ★3 SSR
                </div>
                {/* 下グラデ */}
                <div className="absolute bottom-0 left-0 right-0 h-16"
                  style={{ background: 'linear-gradient(transparent, rgba(10,8,20,0.85))' }} />
              </div>
              {/* テキスト情報 */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold text-white">{selectedHero.name}</span>
                  <span className="text-2xl">{selectedHero.emoji}</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">{selectedHero.title}</div>
                <p className="text-xs text-gray-300 leading-5 mb-3">{selectedHero.description}</p>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-yellow-300 italic text-center">{selectedHero.catchphrase}</p>
                </div>
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
