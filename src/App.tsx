import { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './features/home/HomePage';
import { UnitsPage } from './features/units/UnitsPage';
import { UnitDetailPage } from './features/units/UnitDetailPage';
import { PartyPage } from './features/party/PartyPage';
import { QuestsPage } from './features/quests/QuestsPage';
import { FriendSelectPage } from './features/friends/FriendSelectPage';
import { BattlePage } from './features/battle/BattlePage';
import { EnhancePage } from './features/enhance/EnhancePage';
import { SummonPage } from './features/summon/SummonPage';
import { ItemsPage } from './features/items/ItemsPage';
import { EquipmentPage } from './features/equipment/EquipmentPage';
import { MissionsPage } from './features/missions/MissionsPage';
import { RaidPage } from './features/raid/RaidPage';
import { GuildPage } from './features/guild/GuildPage';
import { FriendPage } from './features/social/FriendPage';
import { PvPPage } from './features/pvp/PvPPage';
import { TitleScreen } from './features/tutorial/TitleScreen';
import { TutorialIntroScreen } from './features/tutorial/TutorialIntroScreen';
import { PlayerNameInputScreen } from './features/tutorial/PlayerNameInputScreen';
import { HeroSelectScreen } from './features/tutorial/HeroSelectScreen';
import { TutorialBattleScreen } from './features/tutorial/TutorialBattleScreen';
import { TutorialCompleteScreen } from './features/tutorial/TutorialCompleteScreen';
import { TutorialGachaScreen } from './features/tutorial/TutorialGachaScreen';
import { ScenarioScreen } from './features/scenario/ScenarioScreen';
import { ProfilePage } from './features/profile/ProfilePage';
import { CollectionPage } from './features/collection/CollectionPage';
import { GiftBoxPage } from './features/gifts/GiftBoxPage';
import { ShopPage } from './features/shop/ShopPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { UIShowcasePage } from './features/debug/UIShowcasePage';
import { useAuthStore } from './stores/authStore';
import { useTutorialStore } from './stores/tutorialStore';
import type { TutorialPhase } from './types';
import { usePlayerStore } from './stores/playerStore';
import { hydrateFromGameState, resetAllStores, initAutoSave, saveImmediately, saveBeforeUnload, setSaveErrorHandler, setSaveSuccessHandler, initCrossTabClaimSync } from './lib/syncService';
import { fetchAndPopulateMasterData } from './lib/masterDataCache';
import { populateImageCache } from './lib/unitImage';
import { ADMIN_EMAIL } from './utils/admin';

const LAST_USER_KEY = 'arcana-last-user-id';

// 認証済みでないと通過できないガード
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isChecked, isLoading } = useAuthStore();

  if (!isChecked || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#08081a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-purple-300 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/title" replace />;
  return <>{children}</>;
};

// チュートリアル完了済みでないと本編へアクセスできないガード
const MainGuard = ({ children }: { children: React.ReactNode }) => {
  const { completed } = useTutorialStore();
  if (!completed) return <Navigate to="/tutorial/intro" replace />;
  return <>{children}</>;
};

// チュートリアル完了済みなら /tutorial/* 系画面へは再入場させないガード。
// 各画面側で phase の再チェックに頼っていたが、HeroSelectScreen の
// setPhase('tutorial_battle') は completed を見ずに常に phase を巻き戻せるため、
// 完了後にこれらのURLへ直接アクセスするだけで主人公ユニットや初回無料10連ガチャを
// 何度でも farming できてしまっていた。ルート単位で塞ぐことで根本的に防ぐ。
//
// minPhase を指定すると、通常のフローで直前の画面が離脱時にセットする phase 値
// (下記PHASE_ORDER)にまだ到達していない状態での直接URLアクセスも防ぐ。
// これにより例えば /tutorial/gacha への直接アクセスで名前入力・主人公選択・
// チュートリアルバトルを全てスキップし、初期ヒーロー/アイテムを一切受け取れない
// まま「チュートリアル完了」になってしまう問題も防止する。
const PHASE_ORDER: TutorialPhase[] = ['title', 'intro', 'name_input', 'hero_select', 'tutorial_battle', 'initial_gacha', 'complete'];
const TutorialGuard = ({ children, minPhase }: { children: React.ReactNode; minPhase?: TutorialPhase }) => {
  const { completed, phase } = useTutorialStore();
  if (completed) return <Navigate to="/" replace />;
  if (minPhase && PHASE_ORDER.indexOf(phase) < PHASE_ORDER.indexOf(minPhase)) {
    return <Navigate to="/tutorial/intro" replace />;
  }
  return <>{children}</>;
};

const HIDE_NAV_PATHS = ['/battle', '/friends', '/title', '/login', '/register', '/tutorial', '/scenario'];

const AppContent = () => {
  const { pathname } = useLocation();
  const { checkAuth, user, gameData, player: authPlayer } = useAuthStore();
  const setAdminMode = usePlayerStore(s => s.setAdminMode);
  const recoverStamina = usePlayerStore(s => s.recoverStamina);
  const showNav = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // 認証チェック
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // ユーザー切り替え検出・リセット・復元(hydrate)を1つの useLayoutEffect にまとめ、
  // 「別ユーザーへの切り替え検出→リセット→復元」を必ずこの順でペイント前に完了させる。
  // （以前は reset を [user]、hydrate を [gameData] の別々の useEffect に分けていたため、
  //   同一コミットで両方の依存が変化すると宣言順に実行され、hydrate の直後に reset が
  //   復元済みデータを上書きしてしまう競合があった。また useEffect は次のペイント後に
  //   実行されるため、その間ログイン直後の画面が一瞬リセット後の空データで描画され、
  //   MainGuard がチュートリアル未完了と誤判定してリダイレクトする恐れもあった）
  useLayoutEffect(() => {
    if (!user) return;
    const storedUserId = localStorage.getItem(LAST_USER_KEY);
    if (storedUserId && storedUserId !== user.id) {
      resetAllStores();
    }
    localStorage.setItem(LAST_USER_KEY, user.id);
    if (gameData) {
      hydrateFromGameState(gameData, authPlayer?.miscData ?? undefined, authPlayer?.tutorialCompleted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gameData]);

  // user が確定したとき一度だけ実行: 自動保存・スタミナ回復のセットアップ
  useEffect(() => {
    if (!user) return;

    // マスタデータをDBから取得してキャッシュに投入（失敗時はTypeScriptデータにフォールバック）
    void fetchAndPopulateMasterData();

    // キャラ画像パスをDBから取得してキャッシュに投入
    fetch('/api/master?type=images', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data: { images: Array<{ unitId: string; rarity: number; imagePath: string }> } | null) => {
        if (data?.images) populateImageCache(data.images);
      })
      .catch(() => { /* 失敗時は静的パスにフォールバック */ });

    if (user.email === ADMIN_EMAIL) setAdminMode();

    // 保存失敗・成功のUI通知
    setSaveErrorHandler((msg) => {
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 5000);
    });
    setSaveSuccessHandler(() => {
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 1500);
    });

    // ストア変更を監視して自動デバウンス保存
    const stopAutoSave = initAutoSave();

    // 同一アカウントを複数タブで開いた場合の報酬二重受け取り防止
    const stopCrossTabSync = initCrossTabClaimSync();

    // フォーカスロス時に即時保存
    window.addEventListener('blur', saveImmediately);
    // ページ離脱時は keepalive 付き専用関数で保存
    window.addEventListener('beforeunload', saveBeforeUnload);
    // beforeunload はモバイル(特にiOS Safari・ホーム画面追加のPWA)では
    // ほぼ発火しないため、それだけに頼るとアプリをホームボタン/スワイプで
    // 閉じた際にデータが保存されないことがあった。visibilitychange(hidden)
    // と pagehide はモバイルでも確実に発火し、ページ終了直後に打ち切られても
    // 送信を継続する keepalive fetch(saveBeforeUnload)と組み合わせることで、
    // 「操作が終わってアプリを離れる瞬間」に確実に保存できるようにする。
    const handleHidden = () => { if (document.visibilityState === 'hidden') saveBeforeUnload(); };
    document.addEventListener('visibilitychange', handleHidden);
    window.addEventListener('pagehide', saveBeforeUnload);

    // スタミナ回復タイマー
    recoverStamina();
    const staminaInterval = setInterval(recoverStamina, 30 * 1000);

    return () => {
      stopAutoSave();
      stopCrossTabSync();
      window.removeEventListener('blur', saveImmediately);
      window.removeEventListener('beforeunload', saveBeforeUnload);
      document.removeEventListener('visibilitychange', handleHidden);
      window.removeEventListener('pagehide', saveBeforeUnload);
      clearInterval(staminaInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      {/* 保存失敗トースト */}
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'rgba(220,38,38,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          ⚠️ {saveError}
        </div>
      )}
      {/* 保存成功インジケーター */}
      {saveOk && (
        <div className="fixed top-4 right-4 z-[200] px-3 py-1.5 rounded-lg text-xs font-bold text-green-300"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(34,197,94,0.4)' }}>
          ✓ 保存済み
        </div>
      )}
      <Routes>
        {/* 認証不要 */}
        <Route path="/title"    element={<TitleScreen />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 認証必須・チュートリアル未完了時のみ（かつ直前の画面まで正規の順序で到達している場合のみ） */}
        <Route path="/tutorial/intro"    element={<AuthGuard><TutorialGuard><TutorialIntroScreen /></TutorialGuard></AuthGuard>} />
        <Route path="/tutorial/name"     element={<AuthGuard><TutorialGuard minPhase="name_input"><PlayerNameInputScreen /></TutorialGuard></AuthGuard>} />
        <Route path="/tutorial/hero"     element={<AuthGuard><TutorialGuard minPhase="hero_select"><HeroSelectScreen /></TutorialGuard></AuthGuard>} />
        <Route path="/tutorial/battle"   element={<AuthGuard><TutorialGuard minPhase="tutorial_battle"><TutorialBattleScreen /></TutorialGuard></AuthGuard>} />
        <Route path="/tutorial/complete" element={<AuthGuard><TutorialGuard minPhase="tutorial_battle"><TutorialCompleteScreen /></TutorialGuard></AuthGuard>} />
        <Route path="/tutorial/gacha"    element={<AuthGuard><TutorialGuard minPhase="initial_gacha"><TutorialGachaScreen /></TutorialGuard></AuthGuard>} />

        {/* 認証必須・チュートリアル完了必須 */}
        <Route path="/"         element={<AuthGuard><MainGuard><HomePage /></MainGuard></AuthGuard>} />
        <Route path="/units"    element={<AuthGuard><MainGuard><UnitsPage /></MainGuard></AuthGuard>} />
        <Route path="/units/:instanceId" element={<AuthGuard><MainGuard><UnitDetailPage /></MainGuard></AuthGuard>} />
        <Route path="/party"    element={<AuthGuard><MainGuard><PartyPage /></MainGuard></AuthGuard>} />
        <Route path="/quests"   element={<AuthGuard><MainGuard><QuestsPage /></MainGuard></AuthGuard>} />
        <Route path="/friends"  element={<AuthGuard><MainGuard><FriendSelectPage /></MainGuard></AuthGuard>} />
        <Route path="/battle"   element={<AuthGuard><MainGuard><BattlePage /></MainGuard></AuthGuard>} />
        <Route path="/enhance"  element={<AuthGuard><MainGuard><EnhancePage /></MainGuard></AuthGuard>} />
        <Route path="/summon"   element={<AuthGuard><MainGuard><SummonPage /></MainGuard></AuthGuard>} />
        <Route path="/items"    element={<AuthGuard><MainGuard><ItemsPage /></MainGuard></AuthGuard>} />
        <Route path="/equipment" element={<AuthGuard><MainGuard><EquipmentPage /></MainGuard></AuthGuard>} />
        <Route path="/missions" element={<AuthGuard><MainGuard><MissionsPage /></MainGuard></AuthGuard>} />
        <Route path="/raid"     element={<AuthGuard><MainGuard><RaidPage /></MainGuard></AuthGuard>} />
        <Route path="/guild"    element={<AuthGuard><MainGuard><GuildPage /></MainGuard></AuthGuard>} />
        <Route path="/social"   element={<AuthGuard><MainGuard><FriendPage /></MainGuard></AuthGuard>} />
        <Route path="/pvp"      element={<AuthGuard><MainGuard><PvPPage /></MainGuard></AuthGuard>} />
        <Route path="/profile"  element={<AuthGuard><MainGuard><ProfilePage /></MainGuard></AuthGuard>} />
        <Route path="/collection" element={<AuthGuard><MainGuard><CollectionPage /></MainGuard></AuthGuard>} />
        <Route path="/gifts"    element={<AuthGuard><MainGuard><GiftBoxPage /></MainGuard></AuthGuard>} />
        <Route path="/shop"     element={<AuthGuard><MainGuard><ShopPage /></MainGuard></AuthGuard>} />
        <Route path="/scenario/:stageId" element={<AuthGuard><MainGuard><ScenarioScreen /></MainGuard></AuthGuard>} />
        {import.meta.env.DEV && <Route path="/ui-showcase" element={<UIShowcasePage />} />}

        <Route path="*" element={<Navigate to="/title" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
};

export const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
