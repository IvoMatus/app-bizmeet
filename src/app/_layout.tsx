import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { CHILD_ROUTE_TAB_KEY } from '@/components/navigation/tab-route-map';
import { UnreadNotificationsProvider } from '@/components/notifications/unread-notifications';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { AppAlertHost } from '@/components/ui/app-alert';
import { ActiveCompanyProvider } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { ProfileAvatarProvider, useProfileAvatar } from '@/hooks/use-profile-avatar';
import { hasUserProfile } from '@/utils/api';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error('Falta EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en .env');
}

SplashScreen.preventAutoHideAsync();

// ponytail: guard by segment; the whole register flow is exempt, not just step-4. Clerk's
// `isSignedIn` flips true inside step-3a's `signUp.finalize()`, *before* it awaits
// `createUserProfile`/`uploadProfilePhoto` and pushes to step-4 itself — exempting only step-4
// left that async gap unguarded, so this effect raced ahead and bounced the user to the Muro
// for a flash before step-3a's own navigation caught up and sent them to step-4. Letting the
// whole register subtree own its navigation (it already does, via its own `router.push`/
// `router.replace` calls) removes the race instead of just narrowing the window.
function AuthGuard() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const getToken = useAuthToken();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';
  const inRegisterFlow = segments[1] === 'register';
  // Cuenta de Clerk cuyo perfil de BizMeet ya se confirmó: se chequea una sola vez por sesión.
  // Solo se guarda el "sí" — un "no" se vuelve a preguntar al salir del registro (ya completado).
  const confirmedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }
    if (inRegisterFlow) return;
    if (confirmedUserId.current === userId) {
      if (inAuthGroup) router.replace('/');
      return;
    }

    // Sesión sin perfil de BizMeet (alta con Google, o un registro cuyo POST /users falló):
    // completar el perfil antes de entrar a la app. Mientras se chequea, no se redirige.
    let cancelled = false;
    getToken()
      .then((token) => (token && userId ? hasUserProfile(userId, token) : true))
      // ponytail: si el chequeo falla (red), no bloquea — mismo comportamiento que antes del chequeo.
      .catch(() => true)
      .then((exists) => {
        if (cancelled) return;
        if (exists) {
          confirmedUserId.current = userId ?? null;
          if (inAuthGroup) router.replace('/');
        } else {
          router.replace('/(auth)/register/aviso-privacidad?completar=1');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, inAuthGroup, inRegisterFlow, getToken]);

  return null;
}

/**
 * Barra inferior para rutas que cuelgan del Stack raíz (fuera de (tabs)): `publicacion/*` y
 * `empresa/*`. Se renderiza como sibling del Stack, no como pantalla dentro de él, así el stack
 * nativo de esas rutas queda intacto (back, historial y animaciones no cambian) — meterlas
 * dentro de `<Tabs>` como ocultas (`href: null`) para esto rompe el back, por eso no se hizo así.
 * Las rutas de (tabs) ya traen su propia barra (ver app-tabs.tsx) y no entran en
 * `CHILD_ROUTE_TAB_KEY`, así que esta nunca se duplica con esa.
 */
function RootBottomTabBar() {
  const avatar = useProfileAvatar();
  const segments = useSegments();
  const activeKey = CHILD_ROUTE_TAB_KEY[segments.join('/')];
  if (!activeKey) return null;

  return (
    <BottomTabBar
      activeKey={activeKey}
      avatar={avatar}
      companyLogo={MOCK_PROFILE.companyLogoUri}
      // dismissTo (no navigate): el destino está en otra rama del Stack raíz — ver el porqué
      // en el comment de `onNavigate` en bottom-tab-bar.tsx. Esto es lo que hace que CUALQUIER
      // guard de salida en esta rama (no solo el de publicacion/crear) se respete al tocar la
      // barra, igual que con el back nativo.
      onNavigate={router.dismissTo}
    />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Mantiene el splash (preventAutoHideAsync arriba) hasta que Inter cargue — AnimatedSplashOverlay
  // recién monta y dispara hideAsync cuando este componente deja de devolver null.
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (fontsError) console.warn('[fonts][diag] Inter no pudo cargar, se usa la fuente del sistema', fontsError);
  if (!fontsLoaded && !fontsError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthGuard />
        {/* Arriba del Stack entero (no solo de (tabs)): pantallas de stack como
            publicacion/crear también dependen de `useActiveCompany` (ver useCompanyBlocked). */}
        <ActiveCompanyProvider>
          {/* Un solo fetch de avatar por sesión, compartido por la barra de (tabs) (app-tabs.tsx)
              y por RootBottomTabBar de aquí abajo — por eso vive arriba del Stack entero. */}
          <ProfileAvatarProvider>
            <UnreadNotificationsProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }} />
                <RootBottomTabBar />
              </View>
            </UnreadNotificationsProvider>
          </ProfileAvatarProvider>
        </ActiveCompanyProvider>
        <AppAlertHost />
      </ThemeProvider>
    </ClerkProvider>
  );
}
