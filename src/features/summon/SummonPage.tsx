import { useCallback, useEffect, useRef, useState } from 'react';
import { SUMMON_POOLS } from '../../data/summons';
import { UNIT_MASTER } from '../../data/units';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { useAuthStore } from '../../stores/authStore';
import { ELEMENT_NAMES } from '../../types';
import type { SummonPool, RarityType, UnitMaster, GachaApplyResult } from '../../types';
import type { GachaStar } from '../../types';
import { RARITY_TO_STAR, STAR_COLORS, STAR_LABELS } from '../../types';
import { AWAKENING_CONFIG, RARITY_TYPE_TO_STAR } from '../../data/rarityConfig';
import { CurrencyIcon } from '../../components/ui/game/GameIcons';
import { formatCompact } from '../../utils/format';
import { UnitIcon } from '../../components/ui/UnitCard';
import { resolveUnitImage } from '../../lib/unitImage';

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
  resultType?: 'new' | 'awakening' | 'crystal';
  awakeningCount?: number;
}
const CardReveal = ({ unit, star, index, total, onOpen, opened, resultType, awakeningCount }: CardRevealProps) => {
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
          {/* ユニット画像（大） */}
          <div style={{
            position: 'absolute', top: '32%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            filter: `drop-shadow(0 0 24px ${color}) drop-shadow(0 0 48px ${color}66)`,
          }}>
            <UnitIcon
              src={resolveUnitImage(unit.id, RARITY_TYPE_TO_STAR[unit.rarity] ?? 1)}
              fallbackEmoji={unit.emoji}
              element={unit.element}
              size={108}
              height={180}
            />
          </div>
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
            {/* 被り結果バッジ */}
            {resultType === 'awakening' && awakeningCount !== undefined && (
              <div style={{
                marginTop: '6px',
                background: 'rgba(255,200,80,0.25)',
                border: '1px solid rgba(255,200,80,0.7)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '11px', fontWeight: 'bold', color: '#ffe48d',
              }}>
                覚醒 +1 ({awakeningCount}/{AWAKENING_CONFIG.maxAwakeningCount})
              </div>
            )}
            {resultType === 'crystal' && (
              <div style={{
                marginTop: '6px',
                background: 'rgba(80,180,255,0.25)',
                border: '1px solid rgba(80,180,255,0.7)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '11px', fontWeight: 'bold', color: '#7bc8ff',
              }}>
                覚醒結晶に変換
              </div>
            )}
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
// summon-mini-card (170px tall) をキャラ画像でフル充填するサブコンポーネント
const MiniCardImage = ({ src, fallbackEmoji, element }: { src: string | null; fallbackEmoji: string; element: string }) => {
  const [err, setErr] = useState(false);
  const bgMap: Record<string, string> = {
    fire: '#7f1d1d', water: '#1e3a5f', wind: '#064e3b',
    earth: '#451a03', light: '#713f12', dark: '#2e1065',
  };
  const bg = bgMap[element] ?? '#1a1a2e';
  if (!src || err) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
        {fallbackEmoji}
      </div>
    );
  }
  return (
    <img src={src} alt="" onError={() => setErr(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: 'scale(1.5)', transformOrigin: 'top center' }} />
  );
};

const ResultGrid = ({ units, resultTypes, onClose, onAgain }: {
  units: UnitMaster[];
  resultTypes: GachaApplyResult[];
  onClose: () => void;
  onAgain: () => void;
}) => (
  <div className="summon-result-panel animate-fade-in">
    <h2 className="summon-result-title">召喚結果</h2>
    <div className="summon-result-grid">
      {units.map((u, i) => {
        const star = RARITY_TO_STAR[u.rarity];
        const elemColor = ELEMENT_COLOR[u.element] ?? '#fff';
        const rt = resultTypes[i];
        return (
          <div key={i} className={`summon-mini-card star-${star}`}
            style={{ animationDelay: `${i * 0.07}s` }}>
            {/* キャラ画像 - カード全体に表示 */}
            <MiniCardImage
              src={resolveUnitImage(u.id, RARITY_TYPE_TO_STAR[u.rarity] ?? 1)}
              fallbackEmoji={u.emoji}
              element={u.element}
            />
            {/* テキスト - カード下部グラデーション上に重ね */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 8px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.92))' }}>
              <div className="mini-card-stars" style={{ color: STAR_COLORS[star] }}>
                {'★'.repeat(star)}
              </div>
              <div className="mini-card-name">{u.name}</div>
              <div className="mini-card-elem" style={{ color: elemColor }}>
                {ELEMENT_NAMES[u.element]}
              </div>
              {rt?.type === 'awakening' && (
                <div style={{ fontSize: '9px', color: '#ffe48d', fontWeight: 'bold', marginTop: '2px' }}>
                  覚醒+1 ({rt.awakeningCount}/4)
                </div>
              )}
              {rt?.type === 'crystal' && (
                <div style={{ fontSize: '9px', color: '#7bc8ff', fontWeight: 'bold', marginTop: '2px' }}>
                  覚醒結晶
                </div>
              )}
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
  const { processSummonResults, addAwakeningCrystal } = useUnitStore();
  const { addDailyProgress } = useMissionStore();
  const { syncSummonResult } = useAuthStore();

  const [selectedPool, setSelectedPool] = useState(SUMMON_POOLS[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'info' } | null>(null);
  const [summonResults, setSummonResults] = useState<UnitMaster[]>([]);
  const [summonResultTypes, setSummonResultTypes] = useState<GachaApplyResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [openedCards, setOpenedCards] = useState<Set<number>>(new Set());
  const [shakePage, setShakePage] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [currentStar, setCurrentStar] = useState<GachaStar>(1);
  // スキップフラグ: true になると演出を即座に中断してresultsへ
  const skipRef = useRef(false);

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
    skipRef.current = false;

    let diamondSpent = 0;
    if (useTicket) {
      if (ticketCount < count) {
        setToast({ msg: `チケットが足りません (所持: ${ticketCount})`, type: 'error' });
        return;
      }
      useItem('item_summon_ticket', count);
    } else {
      const cost = count === 1 ? selectedPool.cost1 : selectedPool.cost10;
      if (!spendDiamond(cost)) {
        setToast({ msg: `ダイヤが足りません (必要: ${cost})`, type: 'error' });
        return;
      }
      diamondSpent = cost;
    }

    const summonedMasters = performSummon(selectedPool, count);
    const maxStar = Math.max(...summonedMasters.map(u => RARITY_TO_STAR[u.rarity])) as GachaStar;
    setCurrentStar(maxStar);
    setSummonResults(summonedMasters);
    setSummonResultTypes([]);
    setRevealIndex(0);
    setOpenedCards(new Set());

    // [localStorage SAVE] processSummonResults を先に実行してから演出開始
    // → スキップ時も正しい結果を使えるようにする
    const gachaResults = processSummonResults(summonedMasters.map(m => m.id));
    // キャラ専用覚醒結晶を配布
    for (const r of gachaResults) {
      if (r.type === 'crystal') addAwakeningCrystal(r.masterId);
    }
    setSummonResultTypes(gachaResults);
    addDailyProgress('summon');
    useMissionStore.getState().addWeeklyProgress('summon');

    // [DB SAVE] ガチャ結果を非同期でDBに保存（演出と並行）
    void syncSummonResult(
      selectedPool.id,
      summonedMasters.map((m, i) => ({
        masterId: m.id,
        rarity: m.rarity,
        resultType: gachaResults[i]?.type ?? 'new',
      })),
      diamondSpent,
    );

    // Phase: summon
    setPhase('summon');
    const pColor = maxStar === 3 ? 'rgba(255,228,141,.8)' : maxStar === 2 ? 'rgba(183,115,255,.8)' : 'rgba(123,200,255,.8)';
    spawnBurst(120, pColor, 0.45);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(1000);

    // Phase: crystal
    if (skipRef.current) { setPhase('results'); return; }
    setPhase('crystal');
    spawnBurst(160, 'rgba(255,244,190,.85)', 0.6);
    await sleep(900);

    // Shake
    if (skipRef.current) { setPhase('results'); return; }
    setShakePage(true);
    spawnBurst(220, pColor, 1.0);
    await sleep(500);
    setShakePage(false);

    // Shatter + flash
    if (skipRef.current) { setPhase('results'); return; }
    setPhase('shatter');
    spawnBurst(260, 'rgba(190,249,255,.9)', 1.1);
    setWhiteFlash(true);
    await sleep(200);
    setWhiteFlash(false);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(700);

    setPhase('reveal');
  };

  /* スキップ: 演出中断 → 即results表示 */
  const handleSkip = () => {
    skipRef.current = true;
    setShakePage(false);
    setWhiteFlash(false);
    // reveal フェーズ中は全カードを開封状態にしてresultsへ
    if (phase === 'reveal') {
      setOpenedCards(new Set(summonResults.map((_, i) => i)));
      setTimeout(() => setPhase('results'), 80);
    } else {
      setPhase('results');
    }
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
    skipRef.current = false;
    setPhase('idle');
    setSummonResults([]);
    setSummonResultTypes([]);
    setRevealIndex(0);
    setOpenedCards(new Set());
    setCurrentStar(1);
    particlesRef.current = [];
  };

  // トースト自動消去
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- レンダー ---- */
  const isAnimating = phase !== 'idle' && phase !== 'results';
  const showButtons = phase === 'idle';
  const showReveal  = phase === 'reveal';
  const showResults = phase === 'results';
  const showStage   = phase !== 'results';

  return (
    <div className={`summon-page ${shakePage ? 'summon-shake' : ''}`}>
      {/* 背景画像 */}
      <img
        src="/assets/images/backgrounds/summon/bg_ui_summon.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.4 }}
      />
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* スキップボタン: アニメーション中またはカード開封中のみ表示 */}
          {(phase === 'summon' || phase === 'crystal' || phase === 'shatter' || phase === 'reveal') && (
            <button
              onClick={handleSkip}
              className="text-xs font-bold px-2 py-1 rounded-lg transition-all active:scale-95 flex-shrink-0"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
              }}>
              SKIP
            </button>
          )}
          <div className="summon-currency flex-shrink-0">
            <div className="currency-gem" />
            <span className="font-black text-sm text-yellow-200">{formatCompact(player.diamond)}</span>
          </div>
        </div>
      </header>

      {/* メインステージ (idle / summon / crystal / shatter) — ビジュアルのみ */}
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
        </div>
      )}

      {/* 召喚コントロール — 常に画面下部に固定 */}
      {showButtons && (
        <div className="summon-controls-dock animate-fade-in">
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
          <div className="summon-diamond-count" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CurrencyIcon type="diamond" size={20} />
            <span>所持ダイヤ：{player.diamond.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* カード開封フェーズ */}
      {showReveal && summonResults[revealIndex] && (() => {
        const rt = summonResultTypes[revealIndex];
        return (
          <CardReveal
            unit={summonResults[revealIndex]}
            star={RARITY_TO_STAR[summonResults[revealIndex].rarity]}
            index={revealIndex}
            total={summonResults.length}
            onOpen={openCard}
            opened={openedCards.has(revealIndex)}
            resultType={rt?.type}
            awakeningCount={rt?.type === 'awakening' ? rt.awakeningCount : undefined}
          />
        );
      })()}

      {/* 結果一覧 */}
      {showResults && (
        <ResultGrid
          units={summonResults}
          resultTypes={summonResultTypes}
          onClose={reset}
          onAgain={reset}
        />
      )}

      {/* エラートースト */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-sm font-bold text-white pointer-events-none"
          style={{
            background: toast.type === 'error' ? 'rgba(220,38,38,0.95)' : 'rgba(79,70,229,0.95)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            animation: 'slideDown 0.2s ease',
          }}>
          {toast.type === 'error' ? '⚠️ ' : 'ℹ️ '}{toast.msg}
        </div>
      )}
    </div>
  );
};
