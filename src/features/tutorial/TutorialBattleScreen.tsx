import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../stores/tutorialStore';
import { getHerosByGenderAndRace, HERO_UNIT_MASTERS } from '../../data/heroes';
import { ELEMENT_NAMES } from '../../types';

const HINT_STEPS = [
  { title: '通常攻撃', text: '「⚔️ 攻撃」ボタンをタップして敵を攻撃しよう！', phase: 'wave1' },
  { title: 'スキル攻撃', text: 'BBゲージが溜まった！「💥 スキル」でBBを使おう！', phase: 'skill' },
  { title: 'Wave 2', text: '敵が出現！引き続き攻撃しよう！', phase: 'wave2' },
];

interface Enemy { id: string; name: string; emoji: string; hp: number; maxHp: number; }

const WAVE_1: Enemy[] = [
  { id: 'slime', name: '影のスライム', emoji: '🫧', hp: 300, maxHp: 300 },
];
const WAVE_2: Enemy[] = [
  { id: 'goblin1', name: '影のゴブリン', emoji: '👺', hp: 500, maxHp: 500 },
  { id: 'goblin2', name: '影のコウモリ', emoji: '🦇', hp: 200, maxHp: 200 },
];

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
  const heroMaxHp = hero?.baseStats.hp ?? 4800;

  const [heroHp, setHeroHp] = useState(heroMaxHp);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>(WAVE_1.map(e => ({ ...e })));
  const [bbGauge, setBbGauge] = useState(0);
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<'battle' | 'wave_transition' | 'victory'>('battle');
  const [hintIndex, setHintIndex] = useState(0);

  const isLogAnimatingRef = useRef(false);

  // メインBattlePageと同じ80msログ表示
  useEffect(() => {
    if (logQueue.length === 0 || isLogAnimatingRef.current) return;
    isLogAnimatingRef.current = true;
    const timer = setTimeout(() => {
      setLogQueue(prev => {
        const [first, ...rest] = prev;
        if (first !== undefined) setLogs(prev2 => [first, ...prev2].slice(0, 20));
        return rest;
      });
      isLogAnimatingRef.current = false;
    }, 80);
    return () => {
      clearTimeout(timer);
      isLogAnimatingRef.current = false;
    };
  }, [logQueue]);

  const addLogs = useCallback((msgs: string[]) => {
    setLogQueue(prev => [...prev, ...msgs]);
  }, []);

  const handleAttack = () => {
    if (phase !== 'battle' || logQueue.length > 0) return;

    const atk = hero?.baseStats.atk ?? 1500;
    const newEnemies = [...enemies];
    const newLogs: string[] = [];

    // 全体攻撃（メインシステムと同じ）
    for (const enemy of newEnemies) {
      if (enemy.hp <= 0) continue;
      const dmg = Math.floor(atk * (0.8 + Math.random() * 0.4));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      newLogs.push(`⚔️ ${heroName} → ${enemy.name} に ${dmg.toLocaleString()} ダメージ！`);
      if (enemy.hp <= 0) {
        newLogs.push(`💀 ${enemy.name} を撃破！`);
      }
    }

    // 被ダメージ（生存している敵から）
    const liveEnemies = newEnemies.filter(e => e.hp > 0);
    if (liveEnemies.length > 0) {
      const counterDmg = Math.floor(80 + Math.random() * 60);
      setHeroHp(prev => Math.max(0, prev - counterDmg));
      newLogs.push(`🔴 ${liveEnemies[0].name} の反撃！${heroName} に ${counterDmg} ダメージ`);
    }

    const bbGain = bbGauge < 100 ? Math.min(100, bbGauge + 35) : bbGauge;
    setBbGauge(bbGain);
    if (bbGain >= 100 && bbGauge < 100) {
      newLogs.push(`💥 BBゲージ満タン！スキルが使える！`);
      setHintIndex(1);
    }

    const allDead = newEnemies.every(e => e.hp <= 0);
    if (allDead) {
      if (wave === 1) {
        newLogs.push(`━━ Wave 1 クリア！ ━━`);
        newLogs.push(`━━ Wave 2 開始！ ━━`);
        setEnemies(newEnemies);
        setPhase('wave_transition');
        addLogs(newLogs);
        setTimeout(() => {
          setWave(2);
          setEnemies(WAVE_2.map(e => ({ ...e })));
          setPhase('battle');
          setHintIndex(2);
        }, newLogs.length * 90 + 500);
      } else {
        newLogs.push(`✨ 全敵撃破！勝利！`);
        setEnemies(newEnemies);
        addLogs(newLogs);
        setTimeout(() => setPhase('victory'), newLogs.length * 90 + 600);
      }
    } else {
      setEnemies(newEnemies);
      addLogs(newLogs);
    }
  };

  const handleSkill = () => {
    if (phase !== 'battle' || logQueue.length > 0 || bbGauge < 100) return;

    const atk = hero?.baseStats.atk ?? 1500;
    const newEnemies = [...enemies];
    const newLogs: string[] = [];

    newLogs.push(`💥 ${heroName} のBB発動！`);

    for (const enemy of newEnemies) {
      if (enemy.hp <= 0) continue;
      const dmg = Math.floor(atk * 2.5 * (0.9 + Math.random() * 0.2));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      newLogs.push(`💥 ${enemy.name} に ${dmg.toLocaleString()} ダメージ！`);
      if (enemy.hp <= 0) newLogs.push(`💀 ${enemy.name} を撃破！`);
    }

    setBbGauge(0);
    const allDead = newEnemies.every(e => e.hp <= 0);

    if (allDead) {
      if (wave === 1) {
        newLogs.push(`━━ Wave 1 クリア！ ━━`);
        newLogs.push(`━━ Wave 2 開始！ ━━`);
        setEnemies(newEnemies);
        setPhase('wave_transition');
        addLogs(newLogs);
        setTimeout(() => {
          setWave(2);
          setEnemies(WAVE_2.map(e => ({ ...e })));
          setPhase('battle');
          setHintIndex(2);
        }, newLogs.length * 90 + 500);
      } else {
        newLogs.push(`✨ 全敵撃破！勝利！`);
        setEnemies(newEnemies);
        addLogs(newLogs);
        setTimeout(() => setPhase('victory'), newLogs.length * 90 + 600);
      }
    } else {
      setEnemies(newEnemies);
      addLogs(newLogs);
    }
  };

  useEffect(() => {
    if (phase === 'victory') {
      const t = setTimeout(() => navigate('/tutorial/complete'), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, navigate]);

  const liveEnemies = enemies.filter(e => e.hp > 0);
  const isAttackDisabled = phase !== 'battle' || liveEnemies.length === 0 || logQueue.length > 0;
  const isSkillDisabled = phase !== 'battle' || bbGauge < 100 || liveEnemies.length === 0 || logQueue.length > 0;
  const hint = HINT_STEPS[hintIndex];

  return (
    <div className="fixed inset-0 flex flex-col battle-bg overflow-hidden select-none text-sm">

      {/* ヘッダー（BattlePageと同じスタイル）*/}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-purple-900/30">
        <div>
          <p className="text-purple-400 text-xs font-medium tracking-wide">チュートリアルバトル</p>
          <p className="text-white text-xs font-bold">
            Wave <span className="text-purple-300">{wave}</span>
            <span className="text-gray-500">/2</span>
          </p>
        </div>
        <div className="text-xs text-yellow-400 font-bold px-3 py-1 rounded-lg"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)' }}>
          💡 チュートリアル
        </div>
      </div>

      {/* 敵HP（BattlePageと同じレイアウト）*/}
      <div className="px-3 py-2 border-b border-gray-800/50">
        <p className="text-gray-500 text-xs mb-1.5 font-bold tracking-wide">━━ 敵 ━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <div className="flex flex-col gap-1.5">
          {enemies.map(e => {
            const pct = Math.max(0, e.hp / e.maxHp);
            const isDead = e.hp <= 0;
            return (
              <div key={e.id} className={`flex items-center gap-2 ${isDead ? 'opacity-30' : ''}`}>
                <span className="text-base w-6 text-center">{e.emoji}</span>
                <span className="text-xs text-gray-300 w-24 truncate">{e.name}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct * 100}%`,
                      background: pct > 0.5 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : pct > 0.25 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    }} />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right">{isDead ? 'DEFEAT' : `${e.hp}/${e.maxHp}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ヒントパネル */}
      {hint && (
        <div className="mx-3 mt-2 rounded-xl p-3 animate-fade-in"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-sm">💡</span>
            <div>
              <div className="text-xs font-bold text-yellow-300 mb-0.5">{hint.title}</div>
              <div className="text-xs text-gray-200 leading-5">{hint.text}</div>
            </div>
          </div>
        </div>
      )}

      {/* バトルログ（BattlePageと同じ）*/}
      <div className="flex-1 px-3 py-2 overflow-hidden">
        <div className="h-full rounded-xl p-3 overflow-y-auto flex flex-col-reverse gap-0.5"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(75,85,99,0.2)' }}>
          {logs.map((line, i) => (
            <p key={i} className={`text-xs leading-relaxed ${
              line.startsWith('⚔️') ? 'text-blue-300' :
              line.startsWith('🔴') ? 'text-red-400' :
              line.startsWith('💀') ? 'text-yellow-400' :
              line.startsWith('━━') ? 'text-purple-400 font-bold' :
              line.startsWith('💥') ? 'text-orange-400' :
              line.startsWith('✨') ? 'text-yellow-300 font-bold' :
              'text-gray-300'
            }`}>{line}</p>
          ))}
          {logs.length === 0 && <p className="text-gray-700 text-xs">バトル開始</p>}
        </div>
      </div>

      {/* 味方カード（BattlePageと同じ）*/}
      <div className="px-3 py-2 border-t border-purple-900/20">
        <p className="text-gray-500 text-xs mb-1.5 font-bold tracking-wide">━━ 味方 ━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(20,10,40,0.6)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <span className="text-3xl">{heroEmoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold text-xs">{heroName}</span>
              <span className="text-xs text-gray-400">{ELEMENT_NAMES[heroElement]}属性</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(heroHp / heroMaxHp) * 100}%`,
                    background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  }} />
              </div>
              <span className="text-xs text-gray-400">{heroHp}/{heroMaxHp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* コマンドボタン（BattlePageと同じ2ボタンレイアウト）*/}
      <div className="px-3 pb-6 pt-2 border-t border-purple-900/30">
        <div className="flex gap-2">
          <button
            onClick={handleAttack}
            disabled={isAttackDisabled}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-500/40 active:scale-95 transition-all disabled:opacity-40">
            ⚔️ 攻撃
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <button
              onClick={handleSkill}
              disabled={isSkillDisabled}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white border active:scale-95 transition-all disabled:opacity-40 ${
                bbGauge >= 100
                  ? 'bg-gradient-to-b from-orange-600 to-red-800 border-orange-400/60'
                  : 'bg-gradient-to-b from-gray-700 to-gray-900 border-gray-600/40'
              }`}
            >
              💥 スキル BB:{bbGauge}%
            </button>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${bbGauge}%`,
                  background: bbGauge >= 100
                    ? 'linear-gradient(90deg, #f97316, #ef4444)'
                    : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
