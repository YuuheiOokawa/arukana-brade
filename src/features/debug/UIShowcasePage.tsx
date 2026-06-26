import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GameButton,
  CardFrame,
  InfoPanel, GameDialog, StoryTextBox,
  GaugeBar, BaseGauge,
  GameNavIcon, StatusIcon, CurrencyIcon,
  TitlePlate, DividerLine, LoadingBar, FrameDecoration, GameBadge,
} from '../../components/ui/game';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 40 }}>
    <div style={{ marginBottom: 16 }}>
      <TitlePlate color="purple">{title}</TitlePlate>
    </div>
    <div style={{ paddingLeft: 4 }}>{children}</div>
  </section>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: 10, color: '#6b7280', fontFamily: "'Noto Sans JP', sans-serif",
    marginBottom: 6, fontWeight: 700, letterSpacing: '.1em',
  }}>
    {children}
  </p>
);

export const UIShowcasePage = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingPct, setLoadingPct] = useState(60);
  const [activeNav, setActiveNav] = useState<string>('home');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0418 0%, #050210 100%)',
      padding: '16px 16px 120px',
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 16 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 900, letterSpacing: '.1em',
          background: 'linear-gradient(135deg, #fde68a, #f0c040, #d97706)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>
          アルカナブレイド UI ライブラリ
        </h1>
        <p style={{ fontSize: 12, color: '#4b5563' }}>全部品カタログ / Game UI Component Showcase</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 12, padding: '6px 20px', borderRadius: 8,
            background: 'rgba(79,70,229,.2)', border: '1px solid rgba(139,92,246,.3)',
            color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          ← 戻る
        </button>
      </div>

      {/* ──── ボタン ──── */}
      <Section title="ボタン（Button）400×80">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <Label>プライマリ（通常）</Label>
            <GameButton variant="primary">プライマリボタン</GameButton>
          </div>
          <div>
            <Label>プライマリ（押下状態はホバー/active で確認）</Label>
            <GameButton variant="primary" fullWidth>プライマリ — フルワイド</GameButton>
          </div>
          <div>
            <Label>セカンダリ（通常）</Label>
            <GameButton variant="secondary">セカンダリ</GameButton>
          </div>
          <div>
            <Label>デンジャー（通常）</Label>
            <GameButton variant="danger">デンジャー</GameButton>
          </div>
          <div>
            <Label>ガチャ（通常）</Label>
            <GameButton variant="gacha">召喚スタート！</GameButton>
          </div>
          <div>
            <Label>戻る（通常）</Label>
            <GameButton variant="back">戻る</GameButton>
          </div>
          <div>
            <Label>無効状態（disabled）</Label>
            <GameButton variant="primary" disabled>無効ボタン</GameButton>
          </div>
        </div>
      </Section>

      <DividerLine color="gold" />
      <div style={{ marginBottom: 28 }} />

      {/* ──── カードフレーム ──── */}
      <Section title="カードフレーム（CardFrame）200×280相当">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <Label>★1</Label>
            <CardFrame rarity={1} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Label>★3</Label>
            <CardFrame rarity={3} width={154} height={216} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Label>★5</Label>
            <CardFrame rarity={5} width={168} height={236} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Label>★W（クラウン）</Label>
            <div style={{ marginTop: 24 }}>
              <CardFrame rarity="W" width={168} height={236} />
            </div>
          </div>
        </div>
      </Section>

      <DividerLine color="purple" />
      <div style={{ marginBottom: 28 }} />

      {/* ──── パネル・ダイアログ ──── */}
      <Section title="パネル・ダイアログ（Panel / Dialog）">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>インフォパネル（700×400）</Label>
            <InfoPanel title="ユニット情報">
              <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7 }}>
                <p>名前：<span style={{ color: '#fff', fontWeight: 700 }}>炎の騎士カイル</span></p>
                <p>レアリティ：<span style={{ color: '#fde68a', fontWeight: 700 }}>★★★★★</span></p>
                <p>属性：<span style={{ color: '#f87171', fontWeight: 700 }}>炎</span></p>
                <p>HP: 8500 / ATK: 4200 / DEF: 3100</p>
              </div>
            </InfoPanel>
          </div>
          <div>
            <Label>ダイアログ（800×500）</Label>
            <GameButton variant="primary" onClick={() => setDialogOpen(true)}>
              ダイアログを開く
            </GameButton>
          </div>
        </div>
      </Section>

      {/* ダイアログオーバーレイ */}
      {dialogOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setDialogOpen(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
            <GameDialog
              title="確認"
              onClose={() => setDialogOpen(false)}
              footer={
                <>
                  <GameButton variant="secondary" onClick={() => setDialogOpen(false)}>キャンセル</GameButton>
                  <GameButton variant="danger" onClick={() => setDialogOpen(false)}>削除する</GameButton>
                </>
              }
            >
              <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7 }}>
                本当にこのアイテムを削除しますか？<br />
                この操作は取り消せません。
              </p>
            </GameDialog>
          </div>
        </div>
      )}

      {/* ストーリーテキストボックス */}
      <Section title="ストーリーテキストボックス（1080×300相当）">
        <StoryTextBox
          speaker="魔導師アリス"
          text="ここは古代の遺跡……かつてアルカナブレイドの戦士たちが命を懸けて戦った聖地です。あなたが選ばれし者なら、この扉を開く力を持っているはずです。"
          showCursor
        />
      </Section>

      <DividerLine color="gold" label="GAUGE BAR" />
      <div style={{ marginBottom: 20 }} />

      {/* ──── ゲージバー ──── */}
      <Section title="ゲージ・バー（400×30）">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
          <div>
            <Label>HP ベース（空）</Label>
            <BaseGauge />
          </div>
          <div>
            <Label>HP（赤）</Label>
            <GaugeBar type="hp" value={68} max={100} />
          </div>
          <div>
            <Label>BB（ブレイブブースト）</Label>
            <GaugeBar type="bb" value={75} max={100} />
          </div>
          <div>
            <Label>MP（青）</Label>
            <GaugeBar type="mp" value={42} max={100} />
          </div>
          <div>
            <Label>EXP（経験値）</Label>
            <GaugeBar type="exp" value={88} max={100} />
          </div>
          <div>
            <Label>スタミナ（黄緑）</Label>
            <GaugeBar type="stamina" value={30} max={50} />
          </div>
        </div>
      </Section>

      <DividerLine color="purple" label="NAV ICONS" />
      <div style={{ marginBottom: 20 }} />

      {/* ──── ナビゲーションアイコン ──── */}
      <Section title="ナビゲーションアイコン（48×48）">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {(['home','quest','unit','summon','profile','shop','guild','arena'] as const).map(type => (
            <GameNavIcon
              key={type}
              type={type}
              active={activeNav === type}
              onClick={() => setActiveNav(type)}
              showLabel
            />
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 11, color: '#4b5563' }}>
          ※ タップでアクティブ切替
        </p>
      </Section>

      <DividerLine color="gold" label="STATUS ICONS" />
      <div style={{ marginBottom: 20 }} />

      {/* ──── 状態異常アイコン ──── */}
      <Section title="状態異常アイコン（48×48）">
        {/* デバフ */}
        <Label>デバフ系（状態異常）</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['poison','burn','paralysis','freeze','sleep','dark','silence','stone','confusion','charm'] as const).map(t => (
            <StatusIcon key={t} type={t} />
          ))}
        </div>
        {/* バフ */}
        <Label>バフ系（能力UP / 特殊）</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['def_up','atk_up','rec_up','critical','death_resist','reflect'] as const).map(t => (
            <StatusIcon key={t} type={t} />
          ))}
        </div>
      </Section>

      <DividerLine color="purple" label="CURRENCY" />
      <div style={{ marginBottom: 20 }} />

      {/* ──── 通貨アイコン ──── */}
      <Section title="通貨アイコン（64×64）">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <CurrencyIcon type="gold" showLabel />
          <CurrencyIcon type="diamond" showLabel />
          <CurrencyIcon type="mana" showLabel />
        </div>
      </Section>

      <DividerLine color="gold" label="OTHER UI" />
      <div style={{ marginBottom: 20 }} />

      {/* ──── その他UI素材 ──── */}
      <Section title="その他UI素材">
        {/* タイトルプレート */}
        <Label>タイトルプレート（ゴールド / パープル / レッド）</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <TitlePlate color="gold">強化結果</TitlePlate>
          <TitlePlate color="purple">ユニット詳細</TitlePlate>
          <TitlePlate color="red">警告</TitlePlate>
        </div>

        {/* 仕切りライン */}
        <Label>仕切りライン（ゴールド / パープル / ラベル付き）</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <DividerLine color="gold" />
          <DividerLine color="purple" />
          <DividerLine color="gold" label="REWARD" />
          <DividerLine color="purple" label="ステータス" />
        </div>

        {/* ローディングバー */}
        <Label>ローディングバー（purple / gold / green）</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340, marginBottom: 12 }}>
          <LoadingBar progress={loadingPct} label="ロード中..." color="purple" />
          <LoadingBar progress={loadingPct} label="ダウンロード" color="gold" />
          <LoadingBar progress={loadingPct} label="EXP" color="green" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[0,25,50,75,100].map(v => (
            <button
              key={v}
              onClick={() => setLoadingPct(v)}
              style={{
                padding: '4px 10px', borderRadius: 6,
                background: loadingPct === v ? 'rgba(139,92,246,.4)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${loadingPct === v ? 'rgba(167,139,250,.5)' : 'rgba(255,255,255,.08)'}`,
                color: loadingPct === v ? '#c4b5fd' : '#6b7280',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
              }}
            >
              {v}%
            </button>
          ))}
        </div>

        {/* フレーム装飾 */}
        <Label>フレーム装飾（gold / purple / teal）</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FrameDecoration color="gold">
            <p style={{ color: '#fde68a', fontWeight: 700, fontSize: 13 }}>ゴールドフレーム</p>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>報酬・重要情報などに使用</p>
          </FrameDecoration>
          <FrameDecoration color="purple">
            <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13 }}>パープルフレーム</p>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>スキル・魔法情報などに使用</p>
          </FrameDecoration>
          <FrameDecoration color="teal">
            <p style={{ color: '#5eead4', fontWeight: 700, fontSize: 13 }}>ティールフレーム</p>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>ステータス・クリア情報などに使用</p>
          </FrameDecoration>
        </div>

        {/* バッジ */}
        <div style={{ marginTop: 20 }}>
          <Label>バッジ（GameBadge）</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <GameBadge color="gold">NEW</GameBadge>
            <GameBadge color="purple">EVENT</GameBadge>
            <GameBadge color="red">LIMIT</GameBadge>
            <GameBadge color="green">CLEAR</GameBadge>
            <GameBadge color="teal">BONUS</GameBadge>
          </div>
        </div>
      </Section>
    </div>
  );
};
