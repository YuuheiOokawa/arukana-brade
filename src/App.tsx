import { useEffect, useState } from 'react';
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
import { ShopPage } from './features/shop/ShopPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { UIShowcasePage } from './features/debug/UIShowcasePage';
import { useAuthStore } from './stores/authStore';
import { useTutorialStore } from './stores/tutorialStore';
import { usePlayerStore } from './stores/playerStore';
import { hydrateFromGameState, resetAllStores, initAutoSave, saveImmediately, saveBeforeUnload, setSaveErrorHandler, setSaveSuccessHandler } from './lib/syncService';
import { fetchAndPopulateMasterData } from './lib/masterDataCache';
import { populateImageCache } from './lib/unitImage';

const ADMIN_EMAIL = 'yuuheiookawa@gmail.com';
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

const HIDE_NAV_PATHS = ['/battle', '/friends', '/title', '/login', '/register', '/tutorial', '/scenario'];

const AppContent = () => {
  const { pathname } = useLocation();
  const { checkAuth, user, gameData } = useAuthStore();
  const setAdminMode = usePlayerStore(s => s.setAdminMode);
  const recoverStamina = usePlayerStore(s => s.recoverStamina);
  const showNav = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // 認証チェック
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // gameData が変化するたびに（ログイン・ページ初期化時）ストアを復元
  useEffect(() => {
    if (!user || !gameData) return;
    hydrateFromGameState(gameData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData]);

  // user が確定したとき一度だけ実行: ユーザー切り替え検出・自動保存・スタミナ回復
  useEffect(() => {
    if (!user) return;

    // 別ユーザーへ切り替わった場合は全ストアをリセット
    const storedUserId = localStorage.getItem(LAST_USER_KEY);
    if (storedUserId && storedUserId !== user.id) {
      resetAllStores();
    }
    localStorage.setItem(LAST_USER_KEY, user.id);

    // マスタデータをDBから取得してキャッシュに投入（失敗時はTypeScriptデータにフォールバック）
    void fetchAndPopulateMasterData();

    // キャラ画像パスをDBから取得してキャッシュに投入
    fetch('/api/master/images', { credentials: 'include' })
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

    // フォーカスロス時に即時保存
    window.addEventListener('blur', saveImmediately);
    // ページ離脱時は keepalive 付き専用関数で保存
    window.addEventListener('beforeunload', saveBeforeUnload);

    // スタミナ回復タイマー
    recoverStamina();
    const staminaInterval = setInterval(recoverStamina, 30 * 1000);

    return () => {
      stopAutoSave();
      window.removeEventListener('blur', saveImmediately);
      window.removeEventListener('beforeunload', saveBeforeUnload);
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

        {/* 認証必須・チュートリアル不要 */}
        <Route path="/tutorial/intro"    element={<AuthGuard><TutorialIntroScreen /></AuthGuard>} />
        <Route path="/tutorial/name"     element={<AuthGuard><PlayerNameInputScreen /></AuthGuard>} />
        <Route path="/tutorial/hero"     element={<AuthGuard><HeroSelectScreen /></AuthGuard>} />
        <Route path="/tutorial/battle"   element={<AuthGuard><TutorialBattleScreen /></AuthGuard>} />
        <Route path="/tutorial/complete" element={<AuthGuard><TutorialCompleteScreen /></AuthGuard>} />
        <Route path="/tutorial/gacha"    element={<AuthGuard><TutorialGachaScreen /></AuthGuard>} />

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
        <Route path="/pvp"      element={<AuthGuard><MainGuard><PvPPage /></MainGuard></AuthGuard>} />
        <Route path="/profile"  element={<AuthGuard><MainGuard><ProfilePage /></MainGuard></AuthGuard>} />
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
