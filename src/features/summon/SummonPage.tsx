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
import './SummonPage.css';

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

/** Lightweight, asset-free crystal with independently animated orbital rings. */
const SummonPortal = ({ state }: { state: 'idle' | 'charge' | 'release' }) => (
  <div className={`arcana-portal portal-${state}`} aria-hidden="true">
    <div className="portal-halo" />
    <div className="portal-orbit orbit-one" />
    <div className="portal-orbit orbit-two" />
    <div className="portal-orbit orbit-three" />
    <div className="portal-core">
      <svg viewBox="0 0 160 240" fill="none">
        <path d="M80 8 143 81 119 173 80 232 41 173 17 81Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" />
        <path d="m80 8 24 73-24 151-24-151Z" fill="currentColor" fillOpacity=".55" />
        <path d="m17 81 39 0 24-73Zm126 0h-39L80 8Z" fill="white" fillOpacity=".6" />
        <path d="m17 81 63 151-24-151Zm126 0L80 232l24-151Z" fill="currentColor" fillOpacity=".3" />
        <path d="M80 8v224M17 81h126M41 173l39-20 39 20" stroke="white" strokeOpacity=".45" />
      </svg>
    </div>
    <div className="portal-shockwave" />
    <div className="portal-horizon" />
    {Array.from({ length: 12 }, (_, i) => <i key={i} className="portal-spark" style={{ '--angle': `${i * 30}deg`, '--delay': `${i * -0.23}s` } as CSSPropertiesWithVars} />)}
  </div>
);

/* ============================================================
   メインコンポーネント
============================================================ */
type Phase = 'idle' | 'summon' | 'reveal' | 'results';

export const SummonPage = () => {
  const { player, spendDiamond, useItem: consumeItem, items, recordSummon } = usePlayerStore();
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
  const [portalState, setPortalState] = useState<'idle' | 'charge' | 'release'>('idle');
  const [currentStar, setCurrentStar] = useState<GachaStar>(1);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const summonLock = useRef(false);
  const openLock = useRef(false);
  const revealButtonRef = useRef<HTMLButtonElement>(null);
  const resultsTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

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
    if (!canvas || reducedMotion) return;
    count = Math.min(count, 100);
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight * 0.40;
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
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion || phase === 'results') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth * Math.min(devicePixelRatio, 2);
      canvas.height = window.innerHeight * Math.min(devicePixelRatio, 2);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const dpr = Math.min(devicePixelRatio, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      particlesRef.current = [];
    };
  }, [spawnBurst, phase, reducedMotion]);

  // Phase-owned timers are cancelled on skip, reset, navigation, and motion changes.
  useEffect(() => {
    if (phase !== 'summon') return;
    if (reducedMotion) { setPhase('reveal'); return; }
    setPortalState('charge');
    const release = window.setTimeout(() => {
      setPortalState('release');
      spawnBurst(100, STAR_COLORS[currentStar], 0.9);
    }, 1600);
    const reveal = window.setTimeout(() => setPhase('reveal'), 2400);
    return () => { window.clearTimeout(release); window.clearTimeout(reveal); };
  }, [phase, reducedMotion, currentStar, spawnBurst]);

  useEffect(() => {
    if (phase === 'reveal') revealButtonRef.current?.focus({ preventScroll: true });
    if (phase === 'results') resultsTitleRef.current?.focus({ preventScroll: true });
  }, [phase, revealIndex, openedCards]);

  /* ---- 召喚アニメーション ---- */
  const startSummon = (count: number, ticketType: 'normal' | 'sr' | 'ssr' | null = null) => {
    if (phase !== 'idle' || summonLock.current) return;

    let diamondSpent = 0;
    let pool = selectedPool;

    if (ticketType === 'normal') {
      if (ticketCount < count) {
        setToast({ msg: `チケットが足りません (所持: ${ticketCount})`, type: 'error' });
        return;
      }
      consumeItem('item_summon_ticket', count);
      pool = SR_POOL;
    } else if (ticketType === 'sr') {
      if (srTicketCount < 1) {
        setToast({ msg: 'SR確定チケットがありません', type: 'error' });
        return;
      }
      consumeItem('item_summon_ticket_sr', 1);
      pool = SR_POOL;
    } else if (ticketType === 'ssr') {
      if (ssrTicketCount < 1) {
        setToast({ msg: 'SSR確定チケットがありません', type: 'error' });
        return;
      }
      consumeItem('item_summon_ticket_ssr', 1);
      pool = SSR_POOL;
    } else {
      const cost = count === 1 ? selectedPool.cost1 : selectedPool.cost10;
      if (!spendDiamond(cost)) {
        setToast({ msg: `ダイヤが足りません (必要: ${cost})`, type: 'error' });
        return;
      }
      diamondSpent = cost;
    }

    summonLock.current = true;
    openLock.current = false;
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

    setPortalState('charge');
    setPhase('summon');
  };

  const handleSkip = () => {
    setPhase('results');
    particlesRef.current = [];
  };

  const openCard = () => {
    if (phase !== 'reveal' || openLock.current || openedCards.has(revealIndex)) return;
    openLock.current = true;
    const star = RARITY_TO_STAR[summonResults[revealIndex].rarity];
    setOpenedCards(prev => new Set([...prev, revealIndex]));
    spawnBurst(star === 3 ? 100 : 50, STAR_COLORS[star], star === 3 ? 1.1 : 0.6);
  };

  const nextCard = () => {
    if (!openedCards.has(revealIndex)) return;
    openLock.current = false;
    if (revealIndex + 1 >= summonResults.length) setPhase('results');
    else setRevealIndex(i => i + 1);
  };

  const reset = () => {
    summonLock.current = false;
    openLock.current = false;
    setPhase('idle');
    setSummonResults([]);
    setSummonResultTypes([]);
    setRevealIndex(0);
    setOpenedCards(new Set());
    setCurrentStar(1);
    setPortalState('idle');
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
  const showStage   = phase === 'idle' || phase === 'summon';

  const currentUnit = summonResults[revealIndex];
  const currentStar_ = currentUnit ? RARITY_TO_STAR[currentUnit.rarity] : 1 as GachaStar;

  return (
    <div className={`summon-page summon-modern phase-${phase}`} style={{ '--summon-accent': STAR_COLORS[showReveal ? currentStar_ : currentStar] } as CSSPropertiesWithVars}>
      {/* 背景画像 */}
      <img
        src="/assets/images/backgrounds/summon/bg_ui_summon.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.4 }}
      />
      {/* Canvas パーティクル */}
      <canvas ref={canvasRef} className="summon-particle-canvas" />

      <div className="summon-atmosphere" aria-hidden="true" />
      <div className="summon-vignette" />

      {/* ヘッダー */}
      <header className="summon-header">
        <div><p className="summon-eyebrow">ARCANA / SUMMON</p><h1 className="summon-title text-luxe-gold">召喚神殿</h1></div>
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
              演出をスキップ
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
        <div className="summon-stage">
          <SummonPortal state={isAnimating ? portalState : 'idle'} />
          <div className="portal-caption" role="status">
            <p className="summon-eyebrow">{isAnimating ? 'RESONANCE' : 'CALL OF THE ARCANA'}</p>
            <h2>{isAnimating ? (portalState === 'release' ? '運命が、目を覚ます。' : '星の記憶と共鳴中…') : 'その光が、運命を変える。'}</h2>
            {!isAnimating && <p>クリスタルに眠る、新たな仲間を召喚</p>}
            {isAnimating && <div className="summon-charge-track"><span /></div>}
          </div>
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
          <div className="summon-reveal-stage">
            <p className="summon-eyebrow">REVEAL / {String(revealIndex + 1).padStart(2, '0')} — {String(summonResults.length).padStart(2, '0')}</p>
            <div className="reveal-aura" aria-hidden="true" />
            {/*
              filter(drop-shadow)は .gacha-flip-card (transform-style:preserve-3d) 自身に
              かけると3D合成が壊れ、フリップしても常に裏面(またはその鏡像)しか
              見えなくなる不具合があった(Playwrightでの検証で発見)。
              preserve-3dを持つ要素とは別の親要素にfilterをかける。
            */}
            <div className="gacha-flip-perspective"
              style={{
                width: 'clamp(208px, 27vw, 260px)', height: 'clamp(320px, 44vh, 370px)',
                filter: isOpen
                  ? `drop-shadow(0 0 26px ${starColor}) drop-shadow(0 0 54px ${starColor}88)`
                  : `drop-shadow(0 4px 20px rgba(0,0,0,0.8)) drop-shadow(0 0 14px ${starColor}55)`,
              }}>
              <div
                key={revealIndex}
                className={`gacha-flip-card ${isOpen ? 'flipped' : ''}`}
                onClick={() => void openCard()}>
                {/* 裏面: タップ前 */}
                <div className="gacha-flip-face" aria-hidden={isOpen}
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
                <div aria-hidden={!isOpen} className={`gacha-flip-face gacha-flip-front ${currentStar_ === 3 ? 'summon-rainbow-border' : ''}`}
                  style={{
                    background: 'linear-gradient(145deg, rgba(20,10,40,0.97), rgba(10,5,20,0.99))',
                    border: `2px solid ${starColor}`,
                    padding: '14px 10px 12px',
                  }}>
                  {currentStar_ === 3 && <div className="gacha-shine-sweep" />}
                  {summonResultTypes[revealIndex]?.type === 'new' && <span className="summon-new-badge">NEW</span>}
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

            <div className="summon-reveal-progress" aria-label={`${revealIndex + 1} / ${summonResults.length}`}>
              {summonResults.map((_, i) => <span key={i} className={i <= revealIndex ? 'active' : ''} />)}
            </div>
            <button ref={revealButtonRef} onClick={isOpen ? nextCard : openCard} className="summon-reveal-action">
              {isOpen ? (revealIndex + 1 === summonResults.length ? '結果を見る' : '次の仲間へ →') : 'タップして解放'}
            </button>
            <p className="summon-reveal-hint" aria-live="polite">{isOpen ? currentUnit.name + ' を獲得' : 'クリスタルに宿る記憶を解き放つ'}</p>
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
          <div className="summon-results-panel"
            style={{ background: 'radial-gradient(ellipse at 50% 20%, #1a0535 0%, #08081a 70%)' }}>
            <p className="summon-eyebrow text-center">SUMMON COMPLETE</p>
            <h2 ref={resultsTitleRef} tabIndex={-1} className="summon-results-title">召喚結果</h2>
            <p className="summon-results-summary">{summonResults.length}体の仲間 · NEW {summonResultTypes.filter(r => r.type === 'new').length} · 覚醒 {summonResultTypes.filter(r => r.type === 'awakening').length}</p>

            {/* スポットライト: ★3(最高レア)を引いた場合、実物カードを大きく表示 */}
            {bestStar === 3 && best && (
              <div className="summon-spotlight relative rounded-2xl p-4 mb-4 text-center overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${elementGradient(best.u.element)}, rgba(10,5,20,0.92))`,
                  border: '2px solid rgba(255,228,141,0.85)',
                  boxShadow: '0 0 30px rgba(255,228,141,.5), 0 0 60px rgba(214,152,255,.25)',
                  animation: 'popIn .5s ease backwards',
                }}>
                <div className="gacha-shine-sweep" />
                <p className="text-yellow-200 font-black text-xs tracking-widest mb-2">★★★ ARCANA / 星の導き</p>
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

            <div className={`summon-result-grid ${summonResults.length === 1 ? 'single-result' : ''}`}>
              {sorted.map(({ u, rt, i }, order) => {
                const star = RARITY_TO_STAR[u.rarity];
                return (
                  <div key={i} className="summon-result-card relative rounded-xl p-2 text-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20,10,40,0.9), rgba(10,5,20,0.95))',
                      border: `1.5px solid ${STAR_COLORS[star]}`,
                      boxShadow: star === 3
                        ? `0 0 14px ${STAR_COLORS[star]}, 0 0 28px rgba(214,152,255,.35)`
                        : `0 0 8px ${STAR_COLORS[star]}44`,
                      animation: `popIn .45s ease backwards`,
                      animationDelay: `${order * 0.06}s`,
                    }}>
                    {star === 3 && <div className="gacha-shine-sweep" />}
                    {rt?.type === 'new' && <span className="summon-new-badge">NEW</span>}
                    <div className="flex justify-center mb-1">
                      <UnitIcon
                        src={resolveUnitImage(u.id, RARITY_TYPE_TO_STAR[u.rarity] ?? 1)}
                        masterId={u.id}
                        unitRarity={RARITY_TYPE_TO_STAR[u.rarity] ?? 1}
                        fallbackEmoji={u.emoji}
                        element={u.element}
                        size={64}
                        height={96}
                      />
                    </div>
                    <div className="summon-result-name text-white font-bold leading-tight mb-0.5">{u.name}</div>
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
