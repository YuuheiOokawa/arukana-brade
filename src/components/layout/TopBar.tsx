import { useEffect, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatCompact } from '../../utils/format';
import { CurrencyIcon } from '../ui/game/GameIcons';
import { Icon } from '../ui/Icon';

interface Props { title?: string; onBack?: () => void; }
const SUBTITLES: Record<string, string> = {
  'ユニット一覧': '仲間を見つめ、次の可能性を育てる。', 'パーティ編成': '五つの力を、一つの意志に。',
  '図鑑': '出会った仲間と、集めた装備の記録。', 'クエスト': 'まだ見ぬ世界へ、冒険を続けよう。',
  '強化': '積み重ねた経験を、新たな力へ。', 'ユニット強化': '積み重ねた経験を、新たな力へ。',
  '装備': '冒険にふさわしい装備を選ぼう。', '装備管理': '冒険にふさわしい装備を選ぼう。',
  'ショップ': '次の冒険に、万全の準備を。', 'ミッション': '今日の一歩が、明日の力になる。',
  'プレゼント': '届いた贈り物を受け取ろう。', 'フレンド': '仲間とともに、さらに遠くへ。',
};
export const TopBar = ({ title, onBack }: Props) => {
  const player = usePlayerStore(s => s.player);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (player.stamina >= player.maxStamina) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [player.stamina, player.maxStamina]);
  const remaining = Math.max(0, Math.ceil((player.staminaRecoveryTime - now) / 1000));
  return <header className="game-topbar">
    <div className="game-topbar-row">
      <div className="game-wordmark">{onBack && <button onClick={onBack} aria-label="戻る" className="icon-button"><Icon name="back" /></button>}<Icon name="summon" size={20} /><span>ARCANA <b>BLADE</b></span></div>
      <div className="game-resources">
        <div className="resource-chip stamina-chip" title="スタミナ"><Icon name="thunder" size={16} /><span>{player.stamina}<small> / {player.maxStamina}</small></span>{player.stamina < player.maxStamina && <small className="stamina-timer">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</small>}</div>
        <div className="resource-chip" title="ダイヤ"><CurrencyIcon type="diamond" size={18} /><span>{formatCompact(player.diamond)}</span></div>
        <div className="resource-chip gold-chip" title="ゴールド"><CurrencyIcon type="gold" size={18} /><span>{formatCompact(player.gold)}</span></div>
      </div>
    </div>
    {title && <div className="game-page-heading"><div><p className="eyebrow">YOUR ADVENTURE</p><h1>{title}</h1>{SUBTITLES[title] && <p className="page-description">{SUBTITLES[title]}</p>}</div><span className="heading-ornament" aria-hidden="true">✧</span></div>}
  </header>;
};
