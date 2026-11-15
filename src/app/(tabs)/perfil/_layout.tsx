import { Stack } from 'expo-router';

import { TabHeader } from '@/components/navigation/tab-stack';

// Deep link en frío a una hija (ej. /perfil/editar): Mi Perfil queda debajo para poder volver.
export const unstable_settings = { anchor: 'index' };

/** Stack propio de la tab "Perfil": vista + pestañas hermanas (con el topbar compartido) y las
 * hijas headerless (editar trae su propio EditTopBar a pantalla completa). */
export default function PerfilLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        // Mismo header que la raíz de las demás pestañas (aviso de pago + selector de empresa).
        header: ({ options }) => <TabHeader title={options.title} />,
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
      {/* Pagos y Equipo de la empresa: hijas con header propio (volver + título). */}
      <Stack.Screen name="pagos" options={{ headerShown: false }} />
      <Stack.Screen name="equipo" options={{ headerShown: false }} />
    </Stack>
  );
}
