import { Tabs } from 'expo-router';
import { useState } from 'react';

import { CompanySwitcherSheet } from '@/components/company/company-switcher-sheet';
import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';

export default function AppTabs() {
  const avatar = useProfileAvatar();
  const { companies } = useActiveCompany();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          // Topbar compartido: UNA instancia por el layout de tabs, no una por pantalla —
          // cada tab solo define su `title` (estático u override dinámico vía
          // `navigation.setOptions`, ver index.tsx) y este header lo renderiza igual para todas.
          // El subtítulo es tocable cuando el usuario tiene al menos una empresa: abre el
          // selector de empresa activa (T2.5), disponible desde cualquier tab.
          header: ({ options }) => (
            <ProfileTopBar
              avatar={avatar}
              companyLogo={MOCK_PROFILE.companyLogoUri}
              hasUnread={MOCK_PROFILE.unreadNotifications}
              subtitle={options.title}
              onPressSubtitle={companies && companies.length > 0 ? () => setSwitcherOpen(true) : undefined}
            />
          ),
        }}
        tabBar={({ state }) => {
          const activeRoute = state.routes[state.index];
          // "editar" cuelga del Stack interno de la tab "perfil" (ver perfil/_layout.tsx) y por
          // pedido del usuario también lleva esta barra, con "Perfil" activa — sin excepción.
          return (
            <BottomTabBar
              activeKey={activeRoute.name}
              avatar={avatar}
              companyLogo={MOCK_PROFILE.companyLogoUri}
            />
          );
        }}>
        <Tabs.Screen name="index" options={{ title: 'Muro General' }} />
        <Tabs.Screen name="company" options={{ title: 'Mis Empresas' }} />
        <Tabs.Screen name="network" options={{ title: 'Red' }} />
        <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
        <Tabs.Screen name="benefits" options={{ title: 'Beneficios' }} />
        {/* "Perfil" trae su propio Stack interno (vista + editar) con su propio topbar/header
            por pantalla (ver perfil/_layout.tsx) — este nivel no le pone header, para no duplicar. */}
        <Tabs.Screen name="perfil" options={{ headerShown: false }} />
        {/* Explore se conserva como ruta pero fuera de la barra. */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
      <CompanySwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}
