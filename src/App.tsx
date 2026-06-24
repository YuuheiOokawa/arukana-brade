import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

const HIDE_NAV_PATHS = ['/battle', '/friends'];

const AppContent = () => {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV_PATHS.some(p => pathname.startsWith(p));

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/units/:instanceId" element={<UnitDetailPage />} />
        <Route path="/party" element={<PartyPage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/friends" element={<FriendSelectPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/enhance" element={<EnhancePage />} />
        <Route path="/summon" element={<SummonPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/raid" element={<RaidPage />} />
        <Route path="/guild" element={<GuildPage />} />
        <Route path="/pvp" element={<PvPPage />} />
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
