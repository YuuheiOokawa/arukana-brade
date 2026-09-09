import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerStore, RANK_EXP_TABLE } from '../../stores/playerStore';
import { useMissionStore } from '../../stores/missionStore';
import { useLoginBonusStore } from '../../stores/loginBonusStore';
import { useGiftStore } from '../../stores/giftStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { useArenaStore } from '../../stores/arenaStore';
import { getActiveEvents, getActiveRaids } from '../../data/events';
import { getRankTitle } from '../../data/arenaRank';
import { getUnitMaster } from '../../data/units';
import { TopBar } from '../../components/layout/TopBar';
import { UnitIcon } from '../../components/ui/UnitCard';
import { Icon } from '../../components/ui/Icon';
import type { IconName } from '../../components/ui/Icon';
import { resolveUnitImage } from '../../lib/unitImage';
import { LoginBonusModal } from '../login/LoginBonusModal';

const ACTIONS: {path:string; title:string; caption:string; icon:IconName}[] = [
  {path:'/units',title:'ユニット',caption:'仲間の力を確かめる',icon:'units'},
  {path:'/party',title:'パーティ編成',caption:'冒険の準備を整える',icon:'party'},
  {path:'/enhance',title:'強化・進化',caption:'新たな可能性を開く',icon:'enhance'},
  {path:'/summon',title:'召喚神殿',caption:'運命の仲間と出会う',icon:'summon'},
];
export const HomePage = () => {
  const {player,recoverStamina} = usePlayerStore();
  const missions = useMissionStore();
  const loginBonus = useLoginBonusStore();
  const giftCount = useGiftStore(s=>s.getUnclaimedCount());
  const party = usePartyStore(s=>s.getActiveParty());
  const ownedUnits = useUnitStore(s=>s.ownedUnits);
  const arenaPoints = useArenaStore(s=>s.record.points);
  const [showLoginBonus,setShowLoginBonus] = useState(false);
  // Keep the pending flag across StrictMode's setup/cleanup replay.
  const [autoBonus] = useState(()=>useLoginBonusStore.getState().canClaim());
  useEffect(()=>{
    recoverStamina(); useMissionStore.getState().checkDailyReset();
    const interval = window.setInterval(recoverStamina,30000);
    const bonus = autoBonus ? window.setTimeout(()=>{
      if(useLoginBonusStore.getState().markLoggedInToday() && useLoginBonusStore.getState().canClaim()) setShowLoginBonus(true);
    },800) : undefined;
    return ()=>{ window.clearInterval(interval); window.clearTimeout(bonus); };
  },[recoverStamina,autoBonus]);
  const leader = ownedUnits.find(u=>u.instanceId===party.leaderId) ?? ownedUnits[0];
  const leaderMaster = leader ? getUnitMaster(leader.masterId) : undefined;
  const missionPending = Math.max(0,missions.getCompletedCount()-missions.getClaimedCount());
  const rankTitle = getRankTitle(arenaPoints);
  const expNeeded = RANK_EXP_TABLE[player.rank-1] ?? 9999;
  const events = getActiveEvents(); const raids = getActiveRaids();
  return <div className="game-page home-page">
    <TopBar />
    <div className="home-welcome"><div><p className="eyebrow">THE NEXT CHAPTER</p><h1>おかえりなさい、{player.name}。</h1><p>今日も、あなただけの冒険を。</p></div><Link to="/profile" className="rank-pill"><Icon name="crown" size={17}/>RANK {player.rank}</Link></div>
    <section className="home-hero" aria-labelledby="hero-heading">
      <img src="/assets/images/backgrounds/home/bg_ui_home_night.webp" className="home-hero-background" alt=""/>
      <div className="home-hero-copy"><p className="eyebrow">ARCANA CHRONICLES</p><h2 id="hero-heading">星の記憶が、<br/>あなたを待っている。</h2><p>仲間とともに、物語の続きを紡ごう。</p><Link to="/quests" className="hero-cta"><Icon name="quest" size={20}/>冒険へ出発<Icon name="next" size={18}/></Link></div>
      {leader && leaderMaster && <div className="home-featured-unit"><UnitIcon src={resolveUnitImage(leader.masterId,leader.currentRarity)} masterId={leader.masterId} unitRarity={leader.currentRarity} fallbackEmoji={leaderMaster.emoji} element={leaderMaster.element} size={64} height={80} variant="portrait" alt={leaderMaster.name}/><div><span>PARTY LEADER</span><p>{leaderMaster.name}</p></div></div>}
      <div className="hero-bottom-line"><span>YOUR STORY, YOUR LEGEND</span><span>01 / ADVENTURE</span></div>
    </section>
    <div className="home-stat-row">
      <Link to="/profile" className="home-stat"><Icon name="profile"/><div><span>冒険者ランク</span><strong>{player.rank}<small> RANK</small></strong><div className="mini-progress"><i style={{width:`${Math.min(100,player.exp/expNeeded*100)}%`}}/></div></div></Link>
      <Link to="/pvp" className="home-stat"><Icon name="pvp"/><div><span>アリーナ</span><strong className="stat-title">{rankTitle.label}</strong><small>{arenaPoints.toLocaleString()} ポイント</small></div></Link>
      <button onClick={()=>setShowLoginBonus(true)} className="home-stat"><Icon name="gifts"/><div><span>ログインボーナス</span><strong className="stat-title">{loginBonus.canClaim() ? '受取可能' : '受取済み'}</strong><small>毎日の冒険に贈り物を</small></div>{loginBonus.canClaim() && <i className="notification-dot"/>}</button>
    </div>
    <section className="home-section"><div className="section-heading"><h2>冒険の準備</h2><span>PREPARE YOUR PARTY</span></div><div className="home-action-grid">{ACTIONS.map(a=><Link key={a.path} to={a.path} className="home-action"><span className="action-icon"><Icon name={a.icon} size={26}/></span><div><h3>{a.title}</h3><p>{a.caption}</p></div><Icon name="next" size={16}/></Link>)}</div></section>
    <div className="home-lower-grid"><section className="home-section"><div className="section-heading"><h2>冒険のお知らせ</h2><span>UPDATES</span></div><div className="home-notices">
      {giftCount>0 && <Link to="/gifts"><Icon name="gifts"/><div><strong>贈り物が届いています</strong><p>{giftCount}件のプレゼントを受け取る</p></div><Icon name="next" size={18}/></Link>}
      {missionPending>0 && <Link to="/missions"><Icon name="missions"/><div><strong>ミッション達成</strong><p>{missionPending}件の報酬を受け取る</p></div><Icon name="next" size={18}/></Link>}
      {raids.slice(0,1).map(r=><Link key={r.id} to="/raid"><Icon name="raid"/><div><strong>{r.name}</strong><p>レイドボスに挑戦</p></div><Icon name="next" size={18}/></Link>)}
      {events.slice(0,1).map(e=><Link key={e.id} to="/quests"><Icon name="quest"/><div><strong>{e.name}</strong><p>開催中のイベントを確認</p></div><Icon name="next" size={18}/></Link>)}
      {!giftCount && !missionPending && !raids.length && !events.length && <p className="quiet-empty">新しいお知らせはありません。次の冒険へ出かけましょう。</p>}
    </div></section><section className="home-section"><div className="section-heading"><h2>世界を広げる</h2><span>DISCOVER</span></div><div className="home-discover-grid">{([{path:'/collection',title:'図鑑',icon:'collection'},{path:'/guild',title:'ギルド',icon:'guild'},{path:'/shop',title:'ショップ',icon:'shop'},{path:'/social',title:'フレンド',icon:'social'},{path:'/equipment',title:'装備',icon:'equipment'},{path:'/missions',title:'ミッション',icon:'missions'}] as const).map(a=><Link to={a.path} key={a.path}><Icon name={a.icon}/><span>{a.title}</span></Link>)}</div></section></div>
    {showLoginBonus && <LoginBonusModal onClose={()=>setShowLoginBonus(false)}/>}
  </div>;
};
