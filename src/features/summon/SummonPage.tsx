import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { SUMMON_POOLS } from '../../data/summons';
import { UNIT_MASTER } from '../../data/units';
import { usePlayerStore } from '../../stores/playerStore';
import { useUnitStore } from '../../stores/unitStore';
import { useMissionStore } from '../../stores/missionStore';
import { useAuthStore } from '../../stores/authStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { ELEMENT_NAMES } from '../../types';
import type { SummonPool, RarityType, UnitMaster, GachaApplyResult } from '../../types';
import type { GachaStar } from '../../types';
import { RARITY_TO_STAR, STAR_COLORS, STAR_LABELS } from '../../types';
import { AWAKENING_CONFIG, RARITY_TYPE_TO_STAR } from '../../data/rarityConfig';
import { CurrencyIcon } from '../../components/ui/game/GameIcons';
import { formatCompact } from '../../utils/format';
import { UnitIcon } from '../../components/ui/UnitCard';
import { resolveUnitImage } from '../../lib/unitImage';
import { elementGradient } from '../../utils/elementUtils';

/* ============================================================
   パーティクル
============================================================ */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
  color: string; shape: 'circle' | 'diamond';
}

/* ============================================================
   ガチャロジック
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

type CSSPropertiesWithVars = CSSProperties & Record<`--${string}`, string>;

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
   メインコンポーネント
============================================================ */
type Phase = 'idle' | 'summon' | 'reveal' | 'results';

export const SummonPage = () => {
  const { player, spendDiamond, useItem, items, recordSummon } = usePlayerStore();
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
  const [colorFlash, setColorFlash] = useState<string | null>(null);
  const [raysActive, setRaysActive] = useState(false);
  const [currentStar, setCurrentStar] = useState<GachaStar>(1);
  const skipRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const ticketCount    = items.find(i => i.itemId === 'item_summon_ticket')?.quantity ?? 0;
  const srTicketCount  = items.find(i => i.itemId === 'item_summon_ticket_sr')?.quantity ?? 0;
  const ssrTicketCount = items.find(i => i.itemId === 'item_summon_ticket_ssr')?.quantity ?? 0;

  const SR_POOL  = SUMMON_POOLS.find(p => p.id === 'summon_ticket')!;
  const SSR_POOL = SUMMON_POOLS.find(p => p.id === 'summon_ssr_ticket')!;

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
  const startSummon = async (count: number, ticketType: 'normal' | 'sr' | 'ssr' | null = null) => {
    if (phase !== 'idle') return;
    skipRef.current = false;

    let diamondSpent = 0;
    let pool = selectedPool;

    if (ticketType === 'normal') {
      if (ticketCount < count) {
        setToast({ msg: `チケットが足りません (所持: ${ticketCount})`, type: 'error' });
        return;
      }
      useItem('item_summon_ticket', count);
      pool = SR_POOL;
    } else if (ticketType === 'sr') {
      if (srTicketCount < 1) {
        setToast({ msg: 'SR確定チケットがありません', type: 'error' });
        return;
      }
      useItem('item_summon_ticket_sr', 1);
      pool = SR_POOL;
    } else if (ticketType === 'ssr') {
      if (ssrTicketCount < 1) {
        setToast({ msg: 'SSR確定チケットがありません', type: 'error' });
        return;
      }
      useItem('item_summon_ticket_ssr', 1);
      pool = SSR_POOL;
    } else {
      const cost = count === 1 ? selectedPool.cost1 : selectedPool.cost10;
      if (!spendDiamond(cost)) {
        setToast({ msg: `ダイヤが足りません (必要: ${cost})`, type: 'error' });
        return;
      }
      diamondSpent = cost;
    }

    const summonedMasters = performSummon(pool, count);
    const maxStar = Math.max(...summonedMasters.map(u => RARITY_TO_STAR[u.rarity])) as GachaStar;
    setCurrentStar(maxStar);
    setSummonResults(summonedMasters);
    setSummonResultTypes([]);
    setRevealIndex(0);
    setOpenedCards(new Set());

    const gachaResults = processSummonResults(summonedMasters.map(m => m.id));
    for (const r of gachaResults) {
      if (r.type === 'crystal') addAwakeningCrystal(r.masterId);
    }
    setSummonResultTypes(gachaResults);
    addDailyProgress('summon');
    useMissionStore.getState().addWeeklyProgress('summon');
    recordSummon(summonedMasters.length);
    useCollectionStore.getState().registerDiscovered(summonedMasters.map(m => m.id));

    void syncSummonResult(
      pool.id,
      summonedMasters.map((m, i) => ({
        masterId: m.id,
        rarity: m.rarity,
        resultType: gachaResults[i]?.type ?? 'new',
      })),
      diamondSpent,
    );

    const pColor = maxStar === 3 ? 'rgba(255,228,141,.8)' : maxStar === 2 ? 'rgba(183,115,255,.8)' : 'rgba(123,200,255,.8)';

    setPhase('summon');
    setRaysActive(maxStar === 3);
    spawnBurst(120, pColor, 0.45);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(1200);

    if (skipRef.current) { setPhase('results'); return; }
    spawnBurst(200, 'rgba(255,244,190,.85)', 0.6);
    setShakePage(true);
    spawnBurst(220, pColor, 1.0);
    if (maxStar === 3) {
      setColorFlash('rgba(255,228,141,.55)');
      await sleep(160);
      setColorFlash(null);
    }
    await sleep(240);
    setShakePage(false);

    if (skipRef.current) { setPhase('results'); return; }
    spawnBurst(260, 'rgba(190,249,255,.9)', 1.1);
    setWhiteFlash(true);
    await sleep(200);
    setWhiteFlash(false);
    if (skipRef.current) { setPhase('results'); return; }
    await sleep(600);

    setPhase('reveal');
  };

  /* スキップ */
  const handleSkip = () => {
    skipRef.current = true;
    setShakePage(false);
    setWhiteFlash(false);
    setColorFlash(null);
    setRaysActive(false);
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
      // モバイル端末での触覚フィードバック(対応端末のみ、非対応環境では何もしない)
      try { navigator.vibrate?.([30, 40, 90]); } catch { /* 非対応環境は無視 */ }
      await sleep(200);
      setShakePage(false);
      setWhiteFlash(false);
    } else if (star === 2) {
      spawnBurst(180, color, 0.85);
    } else {
      spawnBurst(100, color, 0.55);
    }

    await sleep(1000);
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
    setRaysActive(false);
    setColorFlash(null);
    particlesRef.current = [];
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---- レンダー ---- */
  const isAnimating = phase === 'summon';
  const showButtons = phase === 'idle';
  const showReveal  = phase === 'reveal';
  const showResults = phase === 'results';
  const showStage   = phase !== 'results';

  const currentUnit = summonResults[revealIndex];
  const currentStar_ = currentUnit ? RARITY_TO_STAR[currentUnit.rarity] : 1 as GachaStar;

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

      {/* 白フラッシュ / レアリティカラーフラッシュ */}
      {whiteFlash && <div className="summon-white-flash active" />}
      {colorFlash && (
        <div className="summon-color-flash active" style={{ '--flash-color': colorFlash } as CSSPropertiesWithVars} />
      )}
      <div className="summon-vignette" />

      {/* ヘッダー */}
      <header className="summon-header">
        <h1 className="summon-title text-luxe-gold">召喚神殿</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(phase === 'summon' || phase === 'reveal') && (
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

      {/* メインステージ (idle / summon) */}
      {showStage && (
        <div className="summon-stage" style={{ opacity: showReveal ? 0 : 1, transition: 'opacity 0.6s' }}>
          <div className={`summon-rays ${raysActive ? 'active' : ''}`} />
          <div className={`summon-light-column ${isAnimating ? 'active' : ''}`} />
          <MagicCircle active={isAnimating} star={currentStar} />
        </div>
      )}

      {/* 召喚コントロール */}
      {showButtons && (
        <div className="summon-controls-dock animate-fade-in">
          <div className="summon-pool-tabs">
            {SUMMON_POOLS.map(pool => (
              <button key={pool.id} onClick={() => setSelectedPool(pool)}
                className={`summon-pool-tab ${selectedPool.id === pool.id ? 'active' : ''}`}>
                {pool.name}
              </button>
            ))}
          </div>

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

          <div className="summon-btn-row">
            <button className="arcana-btn arcana-btn-blue" onClick={() => void startSummon(1)}>
              <span className="btn-main-text">1回召喚</span>
              <span className="btn-sub-text">ダイヤ {selectedPool.cost1}</span>
            </button>
            <button className="arcana-btn arcana-btn-gold" onClick={() => void startSummon(10)}>
              <span className="btn-main-text">10連召喚</span>
              <span className="btn-sub-text">ダイヤ {selectedPool.cost10} · ★★保証</span>
            </button>
          </div>
          {ticketCount > 0 && (
            <button className="arcana-btn arcana-btn-ticket" onClick={() => void startSummon(1, 'normal')}>
              <span className="btn-main-text">チケット召喚</span>
              <span className="btn-sub-text">残り {ticketCount} 枚 · SR以上確定</span>
            </button>
          )}
          {srTicketCount > 0 && (
            <button className="arcana-btn arcana-btn-ticket" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }} onClick={() => void startSummon(1, 'sr')}>
              <span className="btn-main-text">🌠 SR確定チケット召喚</span>
              <span className="btn-sub-text">残り {srTicketCount} 枚 · SR以上確定</span>
            </button>
          )}
          {ssrTicketCount > 0 && (
            <button className="arcana-btn arcana-btn-ticket" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }} onClick={() => void startSummon(1, 'ssr')}>
              <span className="btn-main-text">🌟 SSR確定チケット召喚</span>
              <span className="btn-sub-text">残り {ssrTicketCount} 枚 · SSR確定</span>
            </button>
          )}
          <div className="summon-diamond-count" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CurrencyIcon type="diamond" size={20} />
            <span>所持ダイヤ：{player.diamond.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* カード開封フェーズ（3Dフリップ演出） */}
      {showReveal && currentUnit && (() => {
        const isOpen = openedCards.has(revealIndex);
        const starColor = STAR_COLORS[currentStar_];
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            {/*
              filter(drop-shadow)は .gacha-flip-card (transform-style:preserve-3d) 自身に
              かけると3D合成が壊れ、フリップしても常に裏面(またはその鏡像)しか
              見えなくなる不具合があった(Playwrightでの検証で発見)。
              preserve-3dを持つ要素とは別の親要素にfilterをかける。
            */}
            <div className="gacha-flip-perspective"
              style={{
                width: 208, height: 296,
                filter: isOpen
                  ? `drop-shadow(0 0 26px ${starColor}) drop-shadow(0 0 54px ${starColor}88)`
                  : `drop-shadow(0 4px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 14px ${starColor}55)`,
              }}>
              <div
                className={`gacha-flip-card ${isOpen ? 'flipped' : ''}`}
                onClick={() => void openCard()}>
                {/* 裏面: タップ前 */}
                <div className="gacha-flip-face"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.14), transparent 22%), linear-gradient(145deg, rgba(22,16,35,.98), rgba(94,55,111,.55) 45%, rgba(8,7,16,.98))',
                    border: `1.5px solid ${starBorder(currentStar_)}`,
                  }}>
                  <div className="gacha-card-orbit-stack">
                    <div className="gacha-card-ring ring-outer" />
                    <div className="gacha-card-ring ring-inner" />
                    <div className="gacha-card-emblem" />
                  </div>
                  <div className="text-xs text-purple-300 font-bold mt-4">タップして開く</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {revealIndex + 1} / {summonResults.length}
                  </div>
                </div>

                {/* 表面: 開封後 */}
                <div className={`gacha-flip-face gacha-flip-front ${currentStar_ === 3 ? 'summon-rainbow-border' : ''}`}
                  style={{
                    background: 'linear-gradient(145deg, rgba(20,10,40,0.97), rgba(10,5,20,0.99))',
                    border: `2px solid ${starColor}`,
                    padding: '14px 10px 12px',
                  }}>
                  {currentStar_ === 3 && <div className="gacha-shine-sweep" />}
                  <div className="flex justify-center mb-2">
                    <UnitIcon
                      src={resolveUnitImage(currentUnit.id, RARITY_TYPE_TO_STAR[currentUnit.rarity] ?? 1)}
                      masterId={currentUnit.id}
                      unitRarity={RARITY_TYPE_TO_STAR[currentUnit.rarity] ?? 1}
                      fallbackEmoji={currentUnit.emoji}
                      element={currentUnit.element}
                      size={90}
                      height={150}
                    />
                  </div>
                  <div className="font-black text-white text-base mb-1 text-center">{currentUnit.name}</div>
                  <div className="text-sm mb-1 font-bold text-center" style={{ color: starColor }}>
                    {'★'.repeat(currentStar_)}{' '}{STAR_LABELS[currentStar_]}
                  </div>
                  <div className="text-xs font-bold text-center" style={{ color: ELEMENT_COLOR[currentUnit.element] }}>
                    {ELEMENT_NAMES[currentUnit.element]}属性 · {currentUnit.title}
                  </div>
                  {summonResultTypes[revealIndex]?.type === 'awakening' && (
                    <div className="text-center" style={{
                      marginTop: '6px',
                      background: 'rgba(255,200,80,0.25)',
                      border: '1px solid rgba(255,200,80,0.7)',
                      borderRadius: '6px', padding: '3px 8px',
                      fontSize: '11px', fontWeight: 'bold', color: '#ffe48d',
                    }}>
                      覚醒 +1 ({summonResultTypes[revealIndex].awakeningCount}/{AWAKENING_CONFIG.maxAwakeningCount})
                    </div>
                  )}
                  {summonResultTypes[revealIndex]?.type === 'crystal' && (
                    <div className="text-center" style={{
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

            {!isOpen && (
              <button
                onClick={() => void openCard()}
                className="mt-5 px-8 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white',
                  boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                }}>
                {summonResults.length === 1 ? 'OPEN' : `${revealIndex + 1} / ${summonResults.length} OPEN`}
              </button>
            )}
          </div>
        );
      })()}

      {/* 結果グリッド（レアリティ降順ソート + 最高レアのスポットライト演出） */}
      {showResults && (() => {
        // 引いた順ではなくレアリティ降順で並べる(最新のガチャ演出の定番)。
        // 元のインデックス(summonResultTypesとの対応)を保持したままソートする
        const sorted = summonResults
          .map((u, i) => ({ u, rt: summonResultTypes[i], i }))
          .sort((a, b) => RARITY_TO_STAR[b.u.rarity] - RARITY_TO_STAR[a.u.rarity]);
        const best = sorted[0];
        const bestStar = best ? RARITY_TO_STAR[best.u.rarity] : null;

        return (
          <div className="absolute inset-0 z-20 overflow-y-auto px-4 pt-4 pb-6"
            style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a0535 0%, #08081a 70%)' }}>
            <h2 className="text-center font-black text-white text-base mb-3">召喚結果</h2>

            {/* スポットライト: ★3(最高レア)を引いた場合、実物カードを大きく表示 */}
            {bestStar === 3 && best && (
              <div className="relative rounded-2xl p-4 mb-4 text-center overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${elementGradient(best.u.element)}, rgba(10,5,20,0.92))`,
                  border: '2px solid rgba(255,228,141,0.85)',
                  boxShadow: '0 0 30px rgba(255,228,141,.5), 0 0 60px rgba(214,152,255,.25)',
                  animation: 'popIn .5s ease backwards',
                }}>
                <div className="gacha-shine-sweep" />
                <p className="text-yellow-200 font-black text-xs tracking-widest mb-2">🎉 ★★★ ARCANA 獲得！</p>
                <div className="flex justify-center mb-1">
                  <UnitIcon
                    src={resolveUnitImage(best.u.id, RARITY_TYPE_TO_STAR[best.u.rarity] ?? 1)}
                    masterId={best.u.id}
                    unitRarity={RARITY_TYPE_TO_STAR[best.u.rarity] ?? 1}
                    fallbackEmoji={best.u.emoji}
                    element={best.u.element}
                    size={100}
                    height={170}
                  />
                </div>
                <p className="text-white font-black text-lg">{best.u.name}</p>
                <p className="text-yellow-300 text-xs font-bold">{'★'.repeat(3)} {STAR_LABELS[3]} · {best.u.title}</p>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2 mb-4">
              {sorted.map(({ u, rt, i }) => {
                const star = RARITY_TO_STAR[u.rarity];
                return (
                  <div key={i} className="relative rounded-xl p-2 text-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20,10,40,0.9), rgba(10,5,20,0.95))',
                      border: `1.5px solid ${STAR_COLORS[star]}`,
                      boxShadow: star === 3
                        ? `0 0 14px ${STAR_COLORS[star]}, 0 0 28px rgba(214,152,255,.35)`
                        : `0 0 8px ${STAR_COLORS[star]}44`,
                      animation: `popIn .45s ease backwards`,
                      animationDelay: `${i * 0.05}s`,
                    }}>
                    {star === 3 && <div className="gacha-shine-sweep" />}
                    <div className="flex justify-center mb-1">
                      <UnitIcon
                        src={resolveUnitImage(u.id, RARITY_TYPE_TO_STAR[u.rarity] ?? 1)}
                        masterId={u.id}
                        unitRarity={RARITY_TYPE_TO_STAR[u.rarity] ?? 1}
                        fallbackEmoji={u.emoji}
                        element={u.element}
                        size={44}
                        height={66}
                      />
                    </div>
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

            {summonResultTypes.filter(r => r.type === 'crystal').length > 0 && (
              <div className="rounded-xl p-2 mb-3 text-center"
                style={{ background: 'rgba(80,180,255,0.1)', border: '1px solid rgba(80,180,255,0.3)' }}>
                <p className="text-xs" style={{ color: '#7bc8ff' }}>
                  💎 覚醒結晶 ×{summonResultTypes.filter(r => r.type === 'crystal').length} 獲得
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm active:scale-95 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f0c040, #d97706)',
                  boxShadow: '0 4px 16px rgba(240,192,64,0.4)',
                  border: '1px solid rgba(255,220,80,0.4)',
                }}
                onClick={reset}>
                もう一度召喚
              </button>
              <button
                className="flex-1 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all"
                style={{
                  background: 'rgba(30,30,60,0.8)',
                  border: '1px solid rgba(75,85,99,0.4)',
                  color: '#9ca3af',
                }}
                onClick={reset}>
                閉じる
              </button>
            </div>
          </div>
        );
      })()}

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
