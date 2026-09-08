import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '../../stores/missionStore';
import { useGiftStore } from '../../stores/giftStore';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
const MAIN = [
  { path: '/', label: 'ホーム', icon: 'home' }, { path: '/quests', label: 'クエスト', icon: 'quest' },
  { path: '/units', label: 'ユニット', icon: 'units' }, { path: '/summon', label: '召喚', icon: 'summon' },
] as const;
const MORE: {path: string; label: string; icon: IconName}[] = [
  {path:'/party',label:'パーティ編成',icon:'party'}, {path:'/enhance',label:'強化・進化',icon:'enhance'},
  {path:'/equipment',label:'装備',icon:'equipment'}, {path:'/items',label:'アイテム',icon:'items'},
  {path:'/collection',label:'図鑑',icon:'collection'}, {path:'/missions',label:'ミッション',icon:'missions'},
  {path:'/gifts',label:'プレゼント',icon:'gifts'}, {path:'/shop',label:'ショップ',icon:'shop'},
  {path:'/raid',label:'レイド',icon:'raid'}, {path:'/pvp',label:'アリーナ',icon:'pvp'},
  {path:'/guild',label:'ギルド',icon:'guild'}, {path:'/social',label:'フレンド',icon:'social'},
  {path:'/profile',label:'プロフィール',icon:'profile'},
];
export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const missions = useMissionStore();
  const gifts = useGiftStore();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = missions.getCompletedCount() - missions.getClaimedCount();
  const giftCount = gifts.getUnclaimedCount();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const el = dialog.current;
    if (open) el?.showModal(); else el?.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await useAuthStore.getState().logout(); navigate('/title', {replace:true}); }
    finally { setLoggingOut(false); setOpen(false); }
  };
  const badge = (path: string) => path === '/missions' ? pending : path === '/gifts' ? giftCount : 0;
  const link = (item: {path:string;label:string;icon:IconName}) => <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({isActive}) => `game-nav-link ${isActive ? 'is-active' : ''}`} onClick={() => setOpen(false)}><Icon name={item.icon} /><span>{item.label}</span>{badge(item.path) > 0 && <b className="nav-badge">{badge(item.path)}</b>}</NavLink>;
  return <>
    <aside className="game-sidebar"><NavLink to="/" className="sidebar-brand"><Icon name="summon" size={32} /><span>ARCANA<small>BLADE</small></span></NavLink><p className="eyebrow">EXPLORE</p><nav aria-label="メインナビゲーション">{MAIN.map(link)}<div className="nav-divider" />{MORE.map(link)}</nav><button className="game-logout" onClick={() => void logout()} disabled={loggingOut}><Icon name="logout" size={16}/>ログアウト</button><p className="sidebar-footer">星の記憶と、あなたの物語。</p></aside>
    <nav className="game-bottom-nav" aria-label="モバイルナビゲーション">{MAIN.map(link)}<button className={`game-nav-link ${open ? 'is-active' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(true)}><Icon name="menu" /><span>メニュー</span>{pending + giftCount > 0 && <i className="notification-dot" />}</button></nav>
    <dialog ref={dialog} className="game-menu-dialog" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={e => { if(e.target === e.currentTarget) setOpen(false); }} aria-labelledby="game-menu-title">
      <div className="menu-heading"><div><p className="eyebrow">DISCOVER MORE</p><h2 id="game-menu-title">冒険メニュー</h2></div><button className="icon-button" aria-label="メニューを閉じる" onClick={() => setOpen(false)}><Icon name="close" /></button></div>
      <nav className="game-menu-grid" aria-label="その他の画面">{MORE.map(link)}</nav>
      <button className="game-logout" onClick={() => void logout()} disabled={loggingOut}><Icon name="logout" size={18}/>{loggingOut ? 'ログアウト中…' : 'ログアウト'}</button>
    </dialog>
  </>;
};
