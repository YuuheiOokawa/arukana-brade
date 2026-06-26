import type { ReactNode } from 'react';
import './GameUI.css';

/* パネル角装飾 */
const PanelCorner = () => (
  <svg className="gb-panel-corner" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 1 L8 1 L1 8 Z" fill="rgba(240,192,64,.5)"/>
    <path d="M1 1 L4 1 L1 4 Z" fill="rgba(255,220,100,.8)"/>
    <rect x="0" y="0" width="1.5" height="9" fill="rgba(240,192,64,.6)"/>
    <rect x="0" y="0" width="9" height="1.5" fill="rgba(240,192,64,.6)"/>
  </svg>
);

/* ──── 情報パネル ──── */
interface InfoPanelProps {
  title?: string;
  children: ReactNode;
  width?: number | string;
  minHeight?: number;
}

export const InfoPanel = ({ title, children, width, minHeight = 80 }: InfoPanelProps) => (
  <div
    className="gb-panel gb-panel-info"
    style={{ width: width ?? '100%', minHeight }}
  >
    {/* 角装飾 */}
    <div className="gb-panel-corner gb-panel-corner-tl"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-tr"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-bl"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-br"><PanelCorner /></div>

    {/* ヘッダー */}
    {title && (
      <div className="gb-panel-header">
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 900,
          fontSize: 13,
          color: '#c4b5fd',
          letterSpacing: '.08em',
        }}>
          {title}
        </p>
      </div>
    )}

    {/* ボディ */}
    <div className="gb-panel-body">{children}</div>
  </div>
);

/* ──── ダイアログ ──── */
interface DialogProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  onClose?: () => void;
}

export const GameDialog = ({ title, children, footer, width, onClose }: DialogProps) => (
  <div
    className="gb-panel gb-panel-dialog"
    style={{
      width: width ?? '100%',
      boxShadow: '0 24px 80px rgba(0,0,0,.8), 0 0 40px rgba(240,192,64,.1)',
    }}
  >
    {/* 角装飾 */}
    <div className="gb-panel-corner gb-panel-corner-tl"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-tr"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-bl"><PanelCorner /></div>
    <div className="gb-panel-corner gb-panel-corner-br"><PanelCorner /></div>

    {/* タイトル */}
    {title && (
      <div
        className="gb-panel-header"
        style={{
          borderBottom: '1px solid rgba(240,192,64,.2)',
          background: 'linear-gradient(90deg, rgba(109,40,217,.2), rgba(240,192,64,.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 900,
          fontSize: 15,
          color: '#fde68a',
          letterSpacing: '.08em',
          background: 'linear-gradient(to right, #fff8e0, #fde68a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 20, lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        )}
      </div>
    )}

    {/* ボディ */}
    <div className="gb-panel-body">{children}</div>

    {/* フッター */}
    {footer && (
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,.05)',
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-end',
      }}>
        {footer}
      </div>
    )}
  </div>
);

/* ──── ストーリーテキストボックス ──── */
interface StoryTextBoxProps {
  speaker?: string;
  text: string;
  showCursor?: boolean;
}

export const StoryTextBox = ({ speaker, text, showCursor = false }: StoryTextBoxProps) => (
  <div className="gb-story-box">
    {/* 左右の光エフェクト */}
    <div style={{
      position: 'absolute',
      left: 0, top: 0, bottom: 0,
      width: 3,
      background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,.6), transparent)',
      borderRadius: '10px 0 0 10px',
    }} />
    <div style={{
      position: 'absolute',
      right: 0, top: 0, bottom: 0,
      width: 3,
      background: 'linear-gradient(to bottom, transparent, rgba(240,192,64,.4), transparent)',
      borderRadius: '0 10px 10px 0',
    }} />

    {/* 話者名 */}
    {speaker && <div className="gb-story-speaker">{speaker}</div>}

    {/* テキスト */}
    <p className="gb-story-text">
      {text}
      {showCursor && <span className="gb-story-cursor" />}
    </p>
  </div>
);
