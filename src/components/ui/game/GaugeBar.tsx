import './GameUI.css';

type GaugeType = 'hp' | 'bb' | 'mp' | 'exp' | 'stamina';

interface GaugeBarProps {
  type: GaugeType;
  value: number;
  max: number;
  showLabel?: boolean;
  showValue?: boolean;
  animated?: boolean;
  width?: number | string;
}

const GAUGE_META: Record<GaugeType, {
  label: string;
  fillClass: string;
  labelColor: string;
  trackBg: string;
}> = {
  hp: {
    label: 'HP',
    fillClass: 'gb-gauge-fill-hp',
    labelColor: '#f87171',
    trackBg: 'rgba(80,0,0,.5)',
  },
  bb: {
    label: 'BB',
    fillClass: 'gb-gauge-fill-bb',
    labelColor: '#fb923c',
    trackBg: 'rgba(80,20,0,.5)',
  },
  mp: {
    label: 'MP',
    fillClass: 'gb-gauge-fill-mp',
    labelColor: '#60a5fa',
    trackBg: 'rgba(0,20,80,.5)',
  },
  exp: {
    label: 'EXP',
    fillClass: 'gb-gauge-fill-exp',
    labelColor: '#4ade80',
    trackBg: 'rgba(0,40,10,.5)',
  },
  stamina: {
    label: 'スタミナ',
    fillClass: 'gb-gauge-fill-stamina',
    labelColor: '#bef264',
    trackBg: 'rgba(20,40,0,.5)',
  },
};

export const GaugeBar = ({
  type,
  value,
  max,
  showLabel = true,
  showValue = true,
  animated = true,
  width = '100%',
}: GaugeBarProps) => {
  const meta = GAUGE_META[type];
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="gb-gauge-wrap" style={{ width }}>
      {(showLabel || showValue) && (
        <div className="gb-gauge-label">
          {showLabel && (
            <span style={{ color: meta.labelColor, fontFamily: "'Noto Sans JP', sans-serif", fontSize: 11, fontWeight: 900 }}>
              {meta.label}
            </span>
          )}
          {showValue && (
            <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 11 }}>
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* ゲージトラック */}
      <div
        className="gb-gauge-track"
        style={{ background: `linear-gradient(to bottom, ${meta.trackBg}, rgba(0,0,0,.6))` }}
      >
        {/* ゲージ塗り */}
        <div
          className={`gb-gauge-fill ${meta.fillClass}`}
          style={{
            width: `${pct}%`,
            transition: animated ? 'width .6s cubic-bezier(.4,0,.2,1)' : 'none',
          }}
        />

        {/* グリッドライン */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: `${tick}%`,
              width: 1,
              background: 'rgba(255,255,255,.08)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ベースゲージ（空のトラック表示用） */
export const BaseGauge = ({ width = '100%' }: { width?: number | string }) => (
  <div style={{ width }}>
    <div
      className="gb-gauge-track gb-gauge-track-base"
      style={{ height: 22 }}
    >
      {/* 目盛り */}
      {[20, 40, 60, 80].map(tick => (
        <div key={tick} style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${tick}%`,
          width: 1,
          background: 'rgba(255,255,255,.06)',
        }} />
      ))}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'rgba(255,255,255,.04)',
        borderRadius: '11px 11px 0 0',
      }} />
    </div>
  </div>
);

/* 全種まとめて表示するコンポーネント */
export const GaugeBarsShowcase = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
    <BaseGauge />
    {(['hp', 'bb', 'mp', 'exp', 'stamina'] as GaugeType[]).map(type => (
      <GaugeBar
        key={type}
        type={type}
        value={Math.floor(Math.random() * 80 + 10)}
        max={100}
        animated
      />
    ))}
  </div>
);
