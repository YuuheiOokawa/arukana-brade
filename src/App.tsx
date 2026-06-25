import { useEffect } from 'react';
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
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { useAuthStore } from './stores/authStore';
import { useTutorialStore } from './stores/tutorialStore';

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
  const { checkAuth } = useAuthStore();
  const showNav = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
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
        <Route path="/scenario/:stageId" element={<AuthGuard><MainGuard><ScenarioScreen /></MainGuard></AuthGuard>} />

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
