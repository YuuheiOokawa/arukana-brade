import { useCallback, useEffect, useRef, useState } from 'react';
import { SUMMON_POOLS } from '../../data/summons';
import { UNIT_MASTER } from '../../data/units';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { ELEMENT_NAMES } from '../../types';
import type { SummonPool, RarityType, UnitMaster } from '../../types';
import type { GachaStar } from '../../types';
import { RARITY_TO_STAR, STAR_COLORS, STAR_LABELS } from '../../types';

/* ============================================================
   パーティクル
============================================================ */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
  color: string; shape: 'circle' | 'diamond';
}

/* ============================================================
   ガチャロジック（既存流用）
============================================================ */
const performSummon = (pool: SummonPool, count: number): UnitMaster[] => {
  const results: UnitMaster[] = [];
  for (let i = 0; i < count; i++) {
    let rand = Math.random();
    let rarity: RarityType = 'N';
    const sortedRates = [...pool.rates].sort((a, b) => a.rate - b.rate);
    const forceHighRarity = count === 10 && i === 9;
    if (forceHighRarity) {
      const srRates = pool.rates.filter(r => r.rarity === 'SSR' || r.rarity === 'SR');
      const totalSR = srRates.reduce((acc, r) => acc + r.rate, 0);
      rand = Math.random() * totalSR;
      let cum = 0;
      for (const rate of srRates) {
        cum += rate.rate;
        if (rand <= cum && rate.unitIds.length > 0) { rarity = rate.rarity; break; }
      }
    } else {
      let cum = 0;
      for (const rate of [...sortedRates].reverse()) {
        cum += rate.rate;
        if (rand <= cum) { rarity = rate.rarity; break; }
      }
    }
    const rarityPool = pool.rates.find(r => r.rarity === rarity);
    if (!rarityPool || rarityPool.unitIds.length === 0) {
      const fallback = UNIT_MASTER.filter(u => u.rarity === 'N');
      results.push(fallback[Math.floor(Math.random() * fallback.length)]);
      continue;
    }
    const unitId = rarityPool.unitIds[Math.floor(Math.random() * rarityPool.unitIds.length)];
    const unit = UNIT_MASTER.find(u => u.id === unitId);
    if (unit) results.push(unit);
  }
  return results;
};

/* ============================================================
   ユーティリティ
============================================================ */
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

/* ============================================================
   MagicCircle SVG
============================================================ */
const MagicCircle = ({ active, star }: { active: boolean; star: GachaStar }) => {
  const color = star === 3 ? '#ffe48d' : star === 2 ? '#d698ff' : '#7bc8ff';
  const glow = star === 3
    ? 'drop-shadow(0 0 16px rgba(255,228,141,.95)) drop-shadow(0 0 40px rgba(255,180,60,.5))'
    : star === 2
    ? 'drop-shadow(0 0 12px rgba(183,115,255,.9)) drop-shadow(0 0 30px rgba(150,60,255,.4))'
    : 'drop-shadow(0 0 10px rgba(123,200,255,.9))';
  return (
    <div className={`summon-magic-circle ${active ? 'active' : ''}`}
      style={{ filter: active ? glow : 'none', transition: 'filter 0.8s, opacity 0.8s', opacity: active ? 1 : 0.4 }}>
      <svg viewBox="0 0 500 500" className="summon-circle-svg" style={{ stroke: color }}>
        <defs>
          <filter id="mg">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="250" cy="250" r="224" filter="url(#mg)" />
        <circle cx="250" cy="250" r="185" />
        <circle cx="250" cy="250" r="136" />
        <circle cx="250" cy="250" r="72" />
        <polygon points="250,46 417,393 83,393" opacity="0.6" />
        <polygon points="250,454 83,107 417,107" opacity="0.6" />
        <path opacity="0.5" d="M250 24 L276 118 L370 94 L318 176 L402 230 L306 238 L326 334 L250 274 L174 334 L194 238 L98 230 L182 176 L130 94 L224 118 Z" />
      </svg>
    </div>
  );
};

/* ============================================================
   Crystal
============================================================ */
const Crystal = ({ phase }: { phase: CrystalPhase }) => (
  <div className={`summon-crystal-wrap ${phase === 'appear' ? 'appear' : ''} ${phase === 'shatter' ? 'shatter' : ''}`}>
    <div className="summon-crystal">
      <div className="facet f1" /><div className="facet f2" /><div className="facet f3" />
      <div className="facet f4" /><div className="facet f5" />
    </div>
  </div>
);

/* ============================================================
   CardReveal
============================================================ */
interface CardRevealProps {
  unit: UnitMaster;
  star: GachaStar;
  index: number;
  total: number;
  onOpen: () => void;
  opened: boolean;
}
const CardReveal = ({ unit, star, index, total, onOpen, opened }: CardRevealProps) => {
  const color = STAR_COLORS[star];
  const elemColor = ELEMENT_COLOR[unit.element] ?? '#fff';
  return (
    <div className="summon-reveal-area">
      {/* オーラ */}
      <div className="summon-rarity-aura" style={{
        background: `radial-gradient(circle, ${color}, transparent 65%)`,
        opacity: opened ? 0.7 : 0.25,
        transition: 'opacity 0.6s',
      }} />
      {/* カード */}
      <div className={`summon-unit-card star-${star} ${opened ? 'open' : ''}`}>
        {/* 裏面 */}
        <div className="card-face card-back">
          <div className="card-orbit orbit-a" />
          <div className="card-orbit orbit-b" />
          <div className="card-emblem" />
        </div>
        {/* 表面 */}
        <div className="card-face card-front" style={{ borderColor: starBorder(star) }}>
          <div className="card-front-bg" />
          <div className="card-front-glass" />
          <div className="card-front-bottom" />
          <div className="card-unit-info">
            <div className="card-unit-name">{unit.name}</div>
            <div className="card-unit-stars" style={{ color: STAR_COLORS[star] }}>
              {'★'.repeat(star)}{'☆'.repeat(3 - star)}
            </div>
            <div className="card-unit-class" style={{ color: color }}>{STAR_LABELS[star]}</div>
            <div className="card-unit-element" style={{ color: elemColor }}>
              {ELEMENT_NAMES[unit.element]}属性 · {unit.title}
            </div>
          </div>
        </div>
      </div>
      {/* OPENボタン */}
      {!opened && (
        <button className="summon-open-btn" onClick={onOpen}>
          <span className="btn-main-text">
            {total === 1 ? 'OPEN' : `${index + 1} / ${total} OPEN`}
          </span>
        </button>
      )}
    </div>
  );
};

/* ============================================================
   ResultGrid
============================================================ */
const ResultGrid = ({ units, onClose, onAgain }: {
  units: UnitMaster[];
  onClose: () => void;
  onAgain: () => void;
}) => (
  <div className="summon-result-panel animate-fade-in">
    <h2 className="summon-result-title">召喚結果</h2>
    <div className="summon-result-grid">
      {units.map((u, i) => {
        const star = RARITY_TO_STAR[u.rarity];
        const elemColor = ELEMENT_COLOR[u.element] ?? '#fff';
        return (
          <div key={i} className={`summon-mini-card star-${star}`}
            style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="mini-card-inner">
              <div className="mini-card-stars" style={{ color: STAR_COLORS[star] }}>
                {'★'.repeat(star)}
              </div>
              <div className="mini-card-name">{u.name}</div>
              <div className="mini-card-elem" style={{ color: elemColor }}>
                {ELEMENT_NAMES[u.element]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
    <div className="summon-result-actions">
      <button className="arcana-btn arcana-btn-gold" onClick={onAgain}>
        <span className="btn-main-text">もう一度召喚</span>
      </button>
      <button className="arcana-btn arcana-btn-blue" onClick={onClose}>
        <span className="btn-main-text">閉じる</span>
      </button>
    </div>
  </div>
);

/* ============================================================
   メインコンポーネント
============================================================ */
type Phase = 'idle' | 'summon' | 'crystal' | 'shatter' | 'reveal' | 'results';
type CrystalPhase = 'idle' | 'appear' | 'shatter';

export const SummonPage = () => {
  const { player, spendDiamond, useItem, items } = usePlayerStore();
  const { addUnit } = useUnitStore();
  const { addDailyProgress } = useMissionStore();

  const [selectedPool, setSelectedPool] = useState(SUMMON_POOLS[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [summonResults, setSummonResults] = useState<UnitMaster[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [openedCards, setOpenedCards] = useState<Set<number>>(new Set());
  const [shakePage, setShakePage] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [currentStar, setCurrentStar] = useState<GachaStar>(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const ticketCount = items.find(i => i.itemId === 'item_summon_ticket')?.quantity ?? 0;

  /* ---- パーティクルループ ---- */
  const spawnBurst = useCallback((count: number, color: string, power = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / (2 * devicePixelRatio);
    const cy = canvas.height * 0.46 / devicePixelRatio;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (Math.random() * 6 + 1.5) * power;
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 100,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - Math.random() * 2,
        life: Math.random() * 55 + 45, maxLife: 100,
        size: Math.random() * 2.5 + 0.6,
        color, shape: Math.random() < 0.25 ? 'diamond' : 'circle',
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
        p.x += p.vx; p.y += p.vy; p.vy += 0.016; p.life--;
        ctx.globalAlpha = Math.max(p.life / 90, 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.shape === 'diamond' ? 24 : 14;
        ctx.beginPath();
        if (p.shape === 'diamond') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((90 - p.life) * 0.04);
          ctx.moveTo(0, -p.size * 2.2); ctx.lineTo(p.size * 1.2, 0);
          ctx.lineTo(0, p.size * 2.2); ctx.lineTo(-p.size * 1.2, 0);
          ctx.closePath(); ctx.fill(); ctx.restore();
        } else { ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    // アイドル時の微粒子
    const idleInterval = setInterval(() => {
      if (phase === 'idle') spawnBurst(4, 'rgba(148,200,255,.3)', 0.18);
    }, 280);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(idleInterval);
    };
  }, [spawnBurst, phase]);

  /* ---- 召喚アニメーション ---- */
  const startSummon = async (count: number, useTicket = false) => {
    if (phase !== 'idle') return;
    if (useTicket) {
      if (ticketCount < count) { alert('チケットが足りません'); return; }
      useItem('item_summon_ticket', count);
    } else {
      const cost = count === 1 ? selectedPool.cost1 : selectedPool.cost10;
      if (!spendDiamond(cost)) { alert('ダイヤが足りません'); return; }
    }

    const summonedMasters = performSummon(selectedPool, count);
    const maxStar = Math.max(...summonedMasters.map(u => RARITY_TO_STAR[u.rarity])) as GachaStar;
    setCurrentStar(maxStar);
    setSummonResults(summonedMasters);
    setRevealIndex(0);
    setOpenedCards(new Set());

    // Phase: summon
    setPhase('summon');
    const pColor = maxStar === 3 ? 'rgba(255,228,141,.8)' : maxStar === 2 ? 'rgba(183,115,255,.8)' : 'rgba(123,200,255,.8)';
    spawnBurst(120, pColor, 0.45);
    await sleep(1000);

    // Phase: crystal
    setPhase('crystal');
    spawnBurst(160, 'rgba(255,244,190,.85)', 0.6);
    await sleep(900);

    // Shake
    setShakePage(true);
    spawnBurst(220, pColor, 1.0);
    await sleep(500);
    setShakePage(false);

    // Shatter + flash
    setPhase('shatter');
    spawnBurst(260, 'rgba(190,249,255,.9)', 1.1);
    setWhiteFlash(true);
    await sleep(200);
    setWhiteFlash(false);
    await sleep(700);

    // Phase: reveal (card flip)
    summonedMasters.forEach(m => addUnit(m.id));
    addDailyProgress('summon');
    setPhase('reveal');
  };

  const openCard = async () => {
    if (openedCards.has(revealIndex)) return;
    const star = RARITY_TO_STAR[summonResults[revealIndex].rarity];
    const color = STAR_COLORS[star];

    setOpenedCards(prev => new Set([...prev, revealIndex]));

    if (star === 3) {
      spawnBurst(300, color, 1.15);
      setShakePage(true);
      setWhiteFlash(true);
      await sleep(200);
      setShakePage(false);
      setWhiteFlash(false);
    } else if (star === 2) {
      spawnBurst(180, color, 0.85);
    } else {
      spawnBurst(100, color, 0.55);
    }

    await sleep(1100);
    if (revealIndex + 1 >= summonResults.length) {
      setPhase('results');
    } else {
      setRevealIndex(i => i + 1);
    }
  };

  const reset = () => {
    setPhase('idle');
    setSummonResults([]);
    setRevealIndex(0);
    setOpenedCards(new Set());
    setCurrentStar(1);
    particlesRef.current = [];
  };

  /* ---- レンダー ---- */
  const isAnimating = phase !== 'idle' && phase !== 'results';
  const showButtons = phase === 'idle';
  const showReveal  = phase === 'reveal';
  const showResults = phase === 'results';
  const showStage   = phase !== 'results';

  return (
    <div className={`summon-page ${shakePage ? 'summon-shake' : ''}`}>
      {/* Canvas パーティクル */}
      <canvas ref={canvasRef} className="summon-particle-canvas" />

      {/* 神殿背景 */}
      <div className="summon-temple-bg">
        <div className="summon-aurora aurora-a" />
        <div className="summon-aurora aurora-b" />
        <div className="summon-moon-gate" />
        <div className="summon-glass-veil veil-a" />
        <div className="summon-glass-veil veil-b" />
        <div className="summon-pillar pillar-left" />
        <div className="summon-pillar pillar-right" />
        <div className="summon-mist mist-a" />
        <div className="summon-mist mist-b" />
        <div className="summon-floor" />
      </div>

      {/* 白フラッシュ */}
      {whiteFlash && <div className="summon-white-flash active" />}
      <div className="summon-vignette" />

      {/* ヘッダー */}
      <header className="summon-header">
        <h1 className="summon-title">召喚神殿</h1>
        <div className="summon-currency">
          <div className="currency-gem" />
          <span className="font-black text-sm text-yellow-200">{player.diamond}</span>
        </div>
      </header>

      {/* メインステージ (idle / summon / crystal / shatter) */}
      {showStage && (
        <div className="summon-stage" style={{ opacity: showReveal ? 0 : 1, transition: 'opacity 0.6s' }}>
          {/* 光柱 */}
          <div className={`summon-light-column ${isAnimating ? 'active' : ''}`} />

          {/* 魔法陣 */}
          <MagicCircle active={isAnimating} star={currentStar} />

          {/* クリスタル */}
          <Crystal phase={
            phase === 'shatter' ? 'shatter' :
            phase === 'crystal' ? 'appear' : 'idle'
          } />

          {/* 召喚台の選択 + ボタン */}
          {showButtons && (
            <div className="summon-controls animate-fade-in">
              {/* 台座タブ */}
              <div className="summon-pool-tabs">
                {SUMMON_POOLS.map(pool => (
                  <button key={pool.id} onClick={() => setSelectedPool(pool)}
                    className={`summon-pool-tab ${selectedPool.id === pool.id ? 'active' : ''}`}>
                    {pool.name}
                  </button>
                ))}
              </div>

              {/* 排出率 */}
              <div className="summon-rates">
                <div className="summon-rate-item star3">
                  <span className="rate-star">★★★</span>
                  <span className="rate-val">
                    {((selectedPool.rates.find(r => r.rarity === 'SSR')?.rate ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="summon-rate-item star2">
                  <span className="rate-star">★★</span>
                  <span className="rate-val">
                    {((selectedPool.rates.find(r => r.rarity === 'SR')?.rate ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="summon-rate-item star1">
                  <span className="rate-star">★</span>
                  <span className="rate-val">
                    {(((selectedPool.rates.find(r => r.rarity === 'R')?.rate ?? 0) +
                       (selectedPool.rates.find(r => r.rarity === 'N')?.rate ?? 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 召喚ボタン */}
              <div className="summon-btn-row">
                <button className="arcana-btn arcana-btn-blue" onClick={() => startSummon(1)}>
                  <span className="btn-main-text">1回召喚</span>
                  <span className="btn-sub-text">ダイヤ {selectedPool.cost1}</span>
                </button>
                <button className="arcana-btn arcana-btn-gold" onClick={() => startSummon(10)}>
                  <span className="btn-main-text">10連召喚</span>
                  <span className="btn-sub-text">ダイヤ {selectedPool.cost10} · ★★保証</span>
                </button>
              </div>
              {ticketCount > 0 && (
                <button className="arcana-btn arcana-btn-ticket" onClick={() => startSummon(1, true)}>
                  <span className="btn-main-text">チケット召喚</span>
                  <span className="btn-sub-text">残り {ticketCount} 枚</span>
                </button>
              )}
              <p className="summon-diamond-count">所持ダイヤ：{player.diamond}</p>
            </div>
          )}
        </div>
      )}

      {/* カード開封フェーズ */}
      {showReveal && summonResults[revealIndex] && (
        <CardReveal
          unit={summonResults[revealIndex]}
          star={RARITY_TO_STAR[summonResults[revealIndex].rarity]}
          index={revealIndex}
          total={summonResults.length}
          onOpen={openCard}
          opened={openedCards.has(revealIndex)}
        />
      )}

      {/* 結果一覧 */}
      {showResults && (
        <ResultGrid
          units={summonResults}
          onClose={reset}
          onAgain={reset}
        />
      )}
    </div>
  );
};
