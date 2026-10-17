import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { MOCK_PROFILE } from '@/components/profile/profile-data';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state }) => (
        <BottomTabBar
          activeKey={state.routes[state.index].name}
          avatar={MOCK_PROFILE.avatarUri}
          companyLogo={MOCK_PROFILE.companyLogoUri}
        />
      )}>
      {/* Explore se conserva como ruta pero fuera de la barra. */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
