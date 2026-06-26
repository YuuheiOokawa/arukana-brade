import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScenario, BG_STYLES, BG_ACCENT } from '../../data/scenarios';
import { StoryTextBox } from '../../components/ui/game/GamePanel';

const AUTO_INTERVAL_MS = 3200;

export const ScenarioScreen = () => {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const scenario = stageId ? getScenario(stageId) : undefined;

  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [textDone, setTextDone] = useState(false);
  const [displayText, setDisplayText] = useState('');

  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = scenario?.lines ?? [];
  const currentLine = lines[lineIndex];
  const bgKey = scenario?.backgroundKey ?? 'forest';
  const accent = BG_ACCENT[bgKey] ?? '#8b5cf6';

  /* ---- 完了時の遷移先 ---- */
  const onFinish = useCallback(() => {
    navigate(`/friends`, { state: { fromScenario: true, stageId } });
  }, [navigate, stageId]);

  /* ---- テキストタイプライター ---- */
  useEffect(() => {
    if (!currentLine) return;
    setVisible(false);
    setTextDone(false);
    setDisplayText('');
    const full = currentLine.text;
    let i = 0;
    // フェードイン後にタイプ開始
    const fadeIn = setTimeout(() => {
      setVisible(true);
      const type = () => {
        i++;
        setDisplayText(full.slice(0, i));
        if (i < full.length) {
          typeTimer.current = setTimeout(type, 32);
        } else {
          setTextDone(true);
        }
      };
      type();
    }, 180);
    return () => {
      clearTimeout(fadeIn);
      if (typeTimer.current) clearTimeout(typeTimer.current);
    };
  }, [lineIndex, currentLine]);

  /* ---- オート再生 ---- */
  useEffect(() => {
    if (!autoPlay || !textDone) return;
    autoTimer.current = setTimeout(() => advance(), AUTO_INTERVAL_MS);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, textDone, lineIndex]);

  const advance = useCallback(() => {
    if (typeTimer.current) { clearTimeout(typeTimer.current); }
    if (!textDone) {
      // タイプ途中なら全表示
      setDisplayText(lines[lineIndex]?.text ?? '');
      setTextDone(true);
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex(i => i + 1);
    } else {
      onFinish();
    }
  }, [textDone, lineIndex, lines, onFinish]);

  const skip = useCallback(() => {
    onFinish();
  }, [onFinish]);

  if (!scenario) {
    // シナリオが存在しないステージはフレンド選択へスキップ
    navigate(`/friends`, { replace: true });
    return null;
  }

  const isNarration = currentLine?.type === 'narration';
  const speakerName = currentLine?.speakerName;

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col select-none"
      style={{ background: BG_STYLES[bgKey] }}
      onClick={advance}
    >
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 奥の光源 */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 20%, ${accent}22 0%, transparent 60%)`,
        }} />
        {/* 星粒 */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              top: `${Math.random() * 70}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.05,
              animation: `glow-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
        {/* 床の反射光 */}
        <div className="absolute bottom-0 left-0 right-0 h-48" style={{
          background: `linear-gradient(to top, ${accent}18, transparent)`,
        }} />
      </div>

      {/* スキップ / オート */}
      <div className="absolute top-4 right-4 flex gap-2 z-20" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setAutoPlay(p => !p)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: autoPlay ? `${accent}44` : 'rgba(0,0,0,0.5)',
            border: `1px solid ${autoPlay ? accent : 'rgba(255,255,255,0.2)'}`,
            color: autoPlay ? accent : '#9ca3af',
          }}>
          AUTO
        </button>
        <button onClick={skip}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#9ca3af',
          }}>
          SKIP
        </button>
      </div>

      {/* 進行度ドット */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {lines.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width: i === lineIndex ? '16px' : '6px',
              height: '6px',
              background: i <= lineIndex ? accent : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* キャラクター立ち絵エリア（疑似シルエット） */}
      {!isNarration && currentLine?.position === 'left' && (
        <div className="absolute left-4 bottom-44 w-24 h-48 pointer-events-none">
          <div className="w-full h-full rounded-2xl" style={{
            background: `linear-gradient(to top, ${accent}40, ${accent}15)`,
            border: `1px solid ${accent}30`,
            backdropFilter: 'blur(4px)',
          }} />
        </div>
      )}
      {!isNarration && currentLine?.position === 'right' && (
        <div className="absolute right-4 bottom-44 w-24 h-48 pointer-events-none">
          <div className="w-full h-full rounded-2xl" style={{
            background: `linear-gradient(to top, ${accent}40, ${accent}15)`,
            border: `1px solid ${accent}30`,
            backdropFilter: 'blur(4px)',
          }} />
        </div>
      )}

      {/* ダイアログボックス */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4"
        style={{ transition: 'opacity 0.2s', opacity: visible ? 1 : 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div onClick={advance} className="cursor-pointer">
          <StoryTextBox
            speaker={!isNarration && speakerName ? speakerName : undefined}
            text={isNarration ? `▍ ${displayText}` : displayText}
            showCursor={!textDone}
          />
        </div>
        {textDone && (
          <div className="flex justify-end mt-2 pr-1">
            <span className="text-xs font-bold animate-bounce" style={{ color: accent }}>
              ▼ 次へ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
