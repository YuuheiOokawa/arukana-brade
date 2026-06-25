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
import { useTutorialStore } from './stores/tutorialStore';

// チュートリアル完了済みでないと本編へアクセスできないガード
const MainGuard = ({ children }: { children: React.ReactNode }) => {
  const { completed } = useTutorialStore();
  if (!completed) return <Navigate to="/title" replace />;
  return <>{children}</>;
};

const HIDE_NAV_PATHS = ['/battle', '/friends', '/title', '/tutorial'];

const AppContent = () => {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p));

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <Routes>
        {/* タイトル・チュートリアル（ガード不要） */}
        <Route path="/title"             element={<TitleScreen />} />
        <Route path="/tutorial/intro"    element={<TutorialIntroScreen />} />
        <Route path="/tutorial/name"     element={<PlayerNameInputScreen />} />
        <Route path="/tutorial/hero"     element={<HeroSelectScreen />} />
        <Route path="/tutorial/battle"   element={<TutorialBattleScreen />} />
        <Route path="/tutorial/complete" element={<TutorialCompleteScreen />} />

        {/* 本編（チュートリアル完了後のみ） */}
        <Route path="/"         element={<MainGuard><HomePage /></MainGuard>} />
        <Route path="/units"    element={<MainGuard><UnitsPage /></MainGuard>} />
        <Route path="/units/:instanceId" element={<MainGuard><UnitDetailPage /></MainGuard>} />
        <Route path="/party"    element={<MainGuard><PartyPage /></MainGuard>} />
        <Route path="/quests"   element={<MainGuard><QuestsPage /></MainGuard>} />
        <Route path="/friends"  element={<MainGuard><FriendSelectPage /></MainGuard>} />
        <Route path="/battle"   element={<MainGuard><BattlePage /></MainGuard>} />
        <Route path="/enhance"  element={<MainGuard><EnhancePage /></MainGuard>} />
        <Route path="/summon"   element={<MainGuard><SummonPage /></MainGuard>} />
        <Route path="/items"    element={<MainGuard><ItemsPage /></MainGuard>} />
        <Route path="/equipment" element={<MainGuard><EquipmentPage /></MainGuard>} />
        <Route path="/missions" element={<MainGuard><MissionsPage /></MainGuard>} />
        <Route path="/raid"     element={<MainGuard><RaidPage /></MainGuard>} />
        <Route path="/guild"    element={<MainGuard><GuildPage /></MainGuard>} />
        <Route path="/pvp"      element={<MainGuard><PvPPage /></MainGuard>} />

        {/* デフォルト: タイトルへ */}
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
