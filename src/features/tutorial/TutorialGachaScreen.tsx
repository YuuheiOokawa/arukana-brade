import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNIT_MASTER } from '../../data/units';
import { useUnitStore } from '../../stores/unitStore';
import { useTutorialStore } from '../../stores/tutorialStore';
import { useAuthStore } from '../../stores/authStore';
import { ELEMENT_NAMES, RARITY_TO_STAR, STAR_COLORS, STAR_LABELS } from '../../types';
import type { UnitMaster, GachaStar, RarityType, GachaApplyResult } from '../../types';

/* 初回チュートリアルガチャ: ★1〜★3 10連固定・無料 */
const TUTORIAL_POOL_RATES: { rarity: RarityType; rate: number }[] = [
  { rarity: 'SSR', rate: 0.03 },
  { rarity: 'SR',  rate: 0.15 },
  { rarity: 'R',   rate: 0.40 },
  { rarity: 'N',   rate: 0.42 },
];

const performTutorialSummon = (): UnitMaster[] => {
  const results: UnitMaster[] = [];
  for (let i = 0; i < 10; i++) {
    let rand = Math.random();
    let rarity: RarityType = 'N';

    // 10連目は★2（SR）以上保証
    if (i === 9) {
      const srRates = TUTORIAL_POOL_RATES.filter(r => r.rarity === 'SSR' || r.rarity === 'SR');
      const total = srRates.reduce((s, r) => s + r.rate, 0);
      rand = Math.random() * total;
      let cum = 0;
      for (const r of srRates) {
        cum += r.rate;
        if (rand <= cum) { rarity = r.rarity; break; }
      }
    } else {
      let cum = 0;
      const sorted = [...TUTORIAL_POOL_RATES].sort((a, b) => b.rate - a.rate);
      for (const r of sorted) {
        cum += r.rate;
        if (rand <= cum) { rarity = r.rarity; break; }
      }
    }

    const pool = UNIT_MASTER.filter(u => u.rarity === rarity);
    if (pool.length > 0) {
      results.push(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      const fallback = UNIT_MASTER.filter(u => u.rarity === 'N');
      results.push(fallback[Math.floor(Math.random() * fallback.length)]);
    }
  }
  return results;
};

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const starBorder = (star: GachaStar) => {
  if (star === 3) return 'rgba(255,228,141,.88)';
  if (star === 2) return 'rgba(183,115,255,.72)';
  return 'rgba(123,200,255,.6)';
};

const ELEMENT_COLOR: Record<string, string> = {
  fire: '#f87171', water: '#60a5fa', wind: '#34d399',
  earth: '#fbbf24', light: '#fde68a', dark: '#c4b5fd', thunder: '#facc15',
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; size: number; color: string;
}

type Phase = 'pre' | 'summon' | 'reveal' | 'results';

export const TutorialGachaScreen = () => {
  const navigate = useNavigate();
  const { completeTutorial } = useTutorialStore();
  const { processSummonResults } = useUnitStore();
  const { syncSummonResult } = useAuthStore();

  const [phase, setPhase] = useState<Phase>('pre');
  const [results, setResults] = useState<UnitMaster[]>([]);
  const [resultTypes, setResultTypes] = useState<GachaApplyResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [currentStar, setCurrentStar] = useState<GachaStar>(1);
  const skipRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const spawnBurst = useCallback((count: number, color: string, power = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / (2 * devicePixelRatio);
    const cy = canvas.height * 0.46 / devicePixelRatio;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (Math.random() * 5 + 1.5) * power;
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - Math.random() * 2,
        life: Math.random() * 55 + 45,
        size: Math.random() * 2.5 + 0.6,
        color,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.018; p.life--;
        ctx.globalAlpha = Math.max(p.life / 80, 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const startGacha = async () => {
    skipRef.current = false;
    const summonedMasters = performTutorialSummon();
    const maxStar = Math.max(...summonedMasters.map(u => RARITY_TO_STAR[u.rarity])) as GachaStar;
    setCurrentStar(maxStar);
    setResults(summonedMasters);
    setRevealIndex(0);
    setOpened(new Set());

    // [localStorage SAVE] ユニット追加・被り処理
    const gachaResults = processSummonResults(summonedMasters.map(m => m.id));
    setResultTypes(gachaResults);

    // [DB SAVE] 初回ガチャ結果を DB に保存（無料なのでダイヤ消費は 0）
    void syncSummonResult(
      'tutorial_free',
      summonedMasters.map((m, i) => ({
        masterId: m.id,
        rarity: m.rarity,
        resultType: gachaResults[i]?.type ?? 'new',
      })),
      0,
    );

    setPhase('summon');
    const pColor = maxStar === 3 ? 'rgba(255,228,141,.8)' : maxStar === 2 ? 'rgba(183,115,255,.8)' : 'rgba(123,200,255,.8)';
    spawnBurst(100, pColor, 0.4);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(800);

    if (skipRef.current) { setPhase('results'); return; }
    spawnBurst(200, 'rgba(255,244,190,.85)', 0.55);
    await sleep(700);

    if (skipRef.current) { setPhase('results'); return; }
    setShake(true);
    spawnBurst(240, pColor, 0.9);
    await sleep(400);
    setShake(false);

    if (skipRef.current) { setPhase('results'); return; }
    spawnBurst(260, 'rgba(190,249,255,.9)', 1.0);
    setWhiteFlash(true);
    await sleep(180);
    setWhiteFlash(false);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(600);

    setPhase('reveal');
  };

  const handleSkip = () => {
    skipRef.current = true;
    setShake(false);
    setWhiteFlash(false);
    if (phase === 'reveal') {
      setOpened(new Set(results.map((_, i) => i)));
      setTimeout(() => setPhase('results'), 80);
    } else {
      setPhase('results');
    }
  };

  const openCard = async () => {
    if (opened.has(revealIndex)) return;
    const star = RARITY_TO_STAR[results[revealIndex].rarity];
    const color = STAR_COLORS[star];

    setOpened(prev => new Set([...prev, revealIndex]));

    if (star === 3) {
      spawnBurst(280, color, 1.1);
      setShake(true);
      setWhiteFlash(true);
      await sleep(180);
      setShake(false);
      setWhiteFlash(false);
    } else if (star === 2) {
      spawnBurst(160, color, 0.8);
    } else {
      spawnBurst(90, color, 0.5);
    }

    await sleep(1000);
    if (revealIndex + 1 >= results.length) {
      setPhase('results');
    } else {
      setRevealIndex(i => i + 1);
    }
  };

  const handleToHome = () => {
    // [DB SAVE] チュートリアル完了フラグを DB に保存
    completeTutorial();
    navigate('/');
  };

  const starForCurrent = results[revealIndex] ? RARITY_TO_STAR[results[revealIndex].rarity] : 1;
  const effectiveStar = phase === 'summon' ? currentStar : starForCurrent;

  return (
    <div
      className={`fixed inset-0 overflow-hidden flex flex-col ${shake ? 'animate-shake' : ''}`}
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a0535 0%, #08081a 70%)' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      {whiteFlash && (
        <div className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.85)', animation: 'none' }} />
      )}

      {/* ヘッダー */}
      <div className="relative z-10 pt-8 pb-4 px-6 flex items-start justify-between">
        <div className="text-center flex-1">
          <p className="text-xs tracking-[0.4em] mb-1" style={{ color: '#8b5cf6' }}>TUTORIAL</p>
          <h1 className="text-xl font-black text-white">初回無料召喚</h1>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>★2以上 1体確定！</p>
        </div>
        {/* スキップボタン: アニメーション中のみ表示 */}
        {(phase === 'summon' || phase === 'reveal') && (
          <button
            onClick={handleSkip}
            className="text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all flex-shrink-0"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(4px)',
            }}>
            SKIP ▶▶
          </button>
        )}
      </div>

      {/* 魔法陣エリア */}
      {phase !== 'results' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          {/* 魔法陣 */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full"
              style={{
                stroke: effectiveStar === 3 ? '#ffe48d' : effectiveStar === 2 ? '#d698ff' : '#7bc8ff',
                filter: phase === 'summon'
                  ? `drop-shadow(0 0 20px ${effectiveStar === 3 ? 'rgba(255,228,141,.9)' : effectiveStar === 2 ? 'rgba(183,115,255,.9)' : 'rgba(123,200,255,.8)'})`
                  : 'none',
                opacity: phase === 'pre' ? 0.3 : 1,
                transition: 'opacity 0.6s, filter 0.6s',
                animation: phase === 'summon' ? 'spin 3s linear infinite' : 'none',
              }}>
              <circle cx="250" cy="250" r="224" />
              <circle cx="250" cy="250" r="185" />
              <circle cx="250" cy="250" r="136" />
              <polygon points="250,46 417,393 83,393" opacity="0.5" />
              <polygon points="250,454 83,107 417,107" opacity="0.5" />
            </svg>

            {/* 中央コンテンツ */}
            {phase === 'pre' && (
              <div className="text-center z-10">
                <img src="/assets/images/effects/summon/effect_summon_crown.webp"
                  alt="" width={64} height={64} className="mx-auto mb-3" style={{ objectFit: 'contain' }} />
                <p className="text-sm text-purple-200">タップして召喚！</p>
              </div>
            )}
            {phase === 'summon' && (
              <div className="text-center z-10 animate-pulse">
                <img src="/assets/images/effects/magic/effect_magic_circle_001.webp"
                  alt="" width={64} height={64} className="mx-auto" style={{ objectFit: 'contain' }} />
              </div>
            )}
            {phase === 'reveal' && results[revealIndex] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                {/* カード */}
                <div
                  className="w-48 rounded-2xl p-4 text-center cursor-pointer active:scale-95 transition-all duration-200"
                  onClick={openCard}
                  style={{
                    background: opened.has(revealIndex)
                      ? `linear-gradient(145deg, rgba(20,10,40,0.95), rgba(10,5,20,0.98))`
                      : 'rgba(10,5,25,0.9)',
                    border: `2px solid ${starBorder(RARITY_TO_STAR[results[revealIndex].rarity])}`,
                    boxShadow: opened.has(revealIndex)
                      ? `0 0 30px ${STAR_COLORS[RARITY_TO_STAR[results[revealIndex].rarity]]}`
                      : '0 4px 20px rgba(0,0,0,0.8)',
                    transform: opened.has(revealIndex) ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease',
                  }}>
                  {opened.has(revealIndex) ? (
                    <>
                      <div className="text-5xl mb-2">{results[revealIndex].emoji}</div>
                      <div className="font-black text-white text-base mb-1">{results[revealIndex].name}</div>
                      <div className="text-sm mb-1 font-bold"
                        style={{ color: STAR_COLORS[RARITY_TO_STAR[results[revealIndex].rarity]] }}>
                        {'★'.repeat(RARITY_TO_STAR[results[revealIndex].rarity])}
                        {' '}{STAR_LABELS[RARITY_TO_STAR[results[revealIndex].rarity]]}
                      </div>
                      <div className="text-xs font-bold"
                        style={{ color: ELEMENT_COLOR[results[revealIndex].element] }}>
                        {ELEMENT_NAMES[results[revealIndex].element]}属性
                      </div>
                      {resultTypes[revealIndex]?.type === 'awakening' && (
                        <div className="mt-2 text-xs font-bold" style={{ color: '#ffe48d' }}>
                          💠 覚醒 +1
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* 魔法陣デザイン（画像不依存のCSSカード裏面）*/}
                      <div className="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full animate-spin"
                          style={{
                            background: 'conic-gradient(from 0deg, rgba(124,58,237,0.8), rgba(79,70,229,0.4), rgba(124,58,237,0.8))',
                            animationDuration: '3s',
                          }} />
                        <div className="absolute inset-2 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(8,8,26,0.9)' }}>
                          <span className="text-2xl">✨</span>
                        </div>
                      </div>
                      <div className="text-xs text-purple-300 font-bold">タップして開く</div>
                      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {revealIndex + 1} / {results.length}
                      </div>
                    </>
                  )}
                </div>

                {!opened.has(revealIndex) && (
                  <button
                    onClick={openCard}
                    className="mt-4 px-8 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: 'white',
                      boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                    }}>
                    OPEN
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 召喚ボタン */}
          {phase === 'pre' && (
            <div className="mt-8 px-8 w-full max-w-sm animate-fade-in">
              <button
                onClick={startGacha}
                className="w-full py-5 rounded-2xl font-black text-white text-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #f0c040, #d97706)',
                  boxShadow: '0 0 32px rgba(240,192,64,0.5), 0 4px 20px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,220,80,0.5)',
                }}>
                <img src="/assets/images/items/currency/item_ticket_summon.webp"
                  alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
                10連召喚（無料）
              </button>
              <p className="text-center text-xs mt-3" style={{ color: '#6b7280' }}>
                ★2（RARE）以上 1体確定　★3（ARCANA）排出あり
              </p>
            </div>
          )}
        </div>
      )}

      {/* 結果グリッド */}
      {phase === 'results' && (
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-2 pb-4">
          <h2 className="text-center font-black text-white text-base mb-3">召喚結果</h2>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {results.map((u, i) => {
              const star = RARITY_TO_STAR[u.rarity];
              const rt = resultTypes[i];
              return (
                <div key={i}
                  className="rounded-xl p-2 text-center"
                  style={{
                    background: `linear-gradient(145deg, rgba(20,10,40,0.9), rgba(10,5,20,0.95))`,
                    border: `1.5px solid ${STAR_COLORS[star]}`,
                    boxShadow: `0 0 8px ${STAR_COLORS[star]}44`,
                    animationDelay: `${i * 0.05}s`,
                  }}>
                  <div className="text-2xl mb-1">{u.emoji}</div>
                  <div className="text-white font-bold text-[9px] leading-tight mb-0.5 truncate">{u.name}</div>
                  <div style={{ color: STAR_COLORS[star], fontSize: '9px', fontWeight: 'bold' }}>
                    {'★'.repeat(star)}
                  </div>
                  {rt?.type === 'awakening' && (
                    <div style={{ fontSize: '8px', color: '#ffe48d', fontWeight: 'bold' }}>覚醒+1</div>
                  )}
                  {rt?.type === 'crystal' && (
                    <div style={{ fontSize: '8px', color: '#7bc8ff', fontWeight: 'bold' }}>結晶</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ★3獲得祝福メッセージ */}
          {results.some(u => RARITY_TO_STAR[u.rarity] === 3) && (
            <div className="rounded-2xl p-3 mb-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(240,192,64,0.15), rgba(253,230,138,0.1))',
                border: '1px solid rgba(240,192,64,0.4)',
              }}>
              <p className="text-yellow-300 font-black text-sm">🎉 ★★★ ARCANA 獲得！</p>
              <p className="text-yellow-400 text-xs mt-0.5">最高レアリティのユニットを引き当てました！</p>
            </div>
          )}

          {/* 覚醒結晶獲得通知 */}
          {resultTypes.filter(r => r.type === 'crystal').length > 0 && (
            <div className="rounded-xl p-2 mb-4 text-center"
              style={{ background: 'rgba(80,180,255,0.1)', border: '1px solid rgba(80,180,255,0.3)' }}>
              <p className="text-xs" style={{ color: '#7bc8ff' }}>
                💎 覚醒結晶 ×{resultTypes.filter(r => r.type === 'crystal').length} 獲得
              </p>
            </div>
          )}

          <button
            onClick={handleToHome}
            className="w-full py-4 rounded-2xl font-black text-white text-base active:scale-95 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
              border: '1px solid rgba(167,139,250,0.4)',
            }}>
            ⚔️ 冒険へ出発！
          </button>
        </div>
      )}
    </div>
  );
};
