import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { TabHeader } from '@/components/navigation/tab-stack';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { ProfileAvatarProvider } from '@/hooks/use-profile-avatar';

export default function AppTabs() {
  return (
    // Avatar compartido por la barra y los topbars: monta acá, al entrar a la app (ver
    // use-profile-avatar.tsx), no en la raíz.
    <ProfileAvatarProvider>
      <Tabs
        // Header acá solo para las tabs de una sola pantalla (Mensajes, Red). Las que tienen Stack
        // propio ((home), (company), (benefits), perfil) lo ponen en su pantalla raíz (ver
        // tab-stack.tsx y perfil/_layout.tsx): así sus hijas, con header propio, no lo heredan.
        screenOptions={{ header: ({ options }) => <TabHeader title={options.title} /> }}
        tabBar={({ state, navigation }) => (
          <BottomTabBar
            state={state}
            navigation={navigation}
            companyLogo={MOCK_PROFILE.companyLogoUri}
          />
        )}>
        <Tabs.Screen name="(home)" options={{ headerShown: false }} />
        <Tabs.Screen name="(company)" options={{ headerShown: false }} />
        <Tabs.Screen name="network" options={{ title: 'Red' }} />
        <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
        <Tabs.Screen name="(benefits)" options={{ headerShown: false }} />
        <Tabs.Screen name="perfil" options={{ headerShown: false }} />
        {/* Explore se conserva como ruta pero fuera de la barra. */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </ProfileAvatarProvider>
  );
}
