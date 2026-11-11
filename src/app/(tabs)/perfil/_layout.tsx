import { Stack } from 'expo-router';

import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';

/** Stack propio de la tab "Perfil": vista (con el topbar compartido) + editar (headerless,
 * trae su propio EditTopBar a pantalla completa). */
export default function PerfilLayout() {
  const avatar = useProfileAvatar();

  return (
    <Stack
      screenOptions={{
        header: ({ options }) => (
          <ProfileTopBar
            avatar={avatar}
            companyLogo={MOCK_PROFILE.companyLogoUri}
            hasUnread={MOCK_PROFILE.unreadNotifications}
            subtitle={options.title}
          />
        ),
      }}>
      <Stack.Screen name="index" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="editar" options={{ headerShown: false }} />
      {/* "Invitaciones Corporativas" (T2.2): el Figma la trata como tab hermana de
          Perfil/Pago/Notif. dentro del mismo header — se agrega aquí, al stack que ya monta
          ProfileTopBar + el patrón de tabs (ProfileTabs), en vez de crear un contenedor nuevo. */}
      <Stack.Screen name="invitaciones" options={{ title: 'Invitaciones' }} />
      {/* Centro de Notificaciones B2B (T2.5, Figma 2046:558/2046:2): misma lógica que
          "invitaciones" arriba — tab hermana dentro del mismo stack/header compartido. */}
      <Stack.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />
    </Stack>
  );
}
