import { Stack } from 'expo-router';
import { useState } from 'react';

import { CompanySwitcherSheet } from '@/components/company/company-switcher-sheet';
import { PendingPaymentBanner } from '@/components/company/pending-payment-banner';
import { useUnreadNotifications } from '@/components/notifications/unread-notifications';
import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';

/**
 * Header de la pantalla raíz de una pestaña: topbar compartido + aviso de pago pendiente de la
 * empresa activa. El subtítulo es `title` de la ruta (estático, u override vía
 * `navigation.setOptions`, ver (home)/index.tsx) y es tocable si hay al menos una empresa: abre
 * el selector de empresa activa (T2.5).
 */
export function TabHeader({ title }: { title?: string }) {
  const avatar = useProfileAvatar();
  const { unread } = useUnreadNotifications();
  const { companies } = useActiveCompany();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <>
      <ProfileTopBar
        avatar={avatar}
        companyLogo={MOCK_PROFILE.companyLogoUri}
        hasUnread={unread > 0}
        subtitle={title}
        onPressSubtitle={companies && companies.length > 0 ? () => setSwitcherOpen(true) : undefined}
      />
      <PendingPaymentBanner />
      <CompanySwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}

/**
 * Stack propio de una pestaña ((home), (company), (benefits)): solo la pantalla raíz lleva el
 * TabHeader; las hijas traen su propio header (volver + título) y se apilan con el mismo push
 * opaco que el resto de la app. La barra inferior vive en el Tabs de arriba (app-tabs.tsx), así
 * que queda fija mientras las pantallas del Stack entran y salen.
 */
export function TabStack({ root, title }: { root: string; title: string }) {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen
        name={root}
        options={{ title, headerShown: true, header: ({ options }) => <TabHeader title={options.title} /> }}
      />
    </Stack>
  );
}
