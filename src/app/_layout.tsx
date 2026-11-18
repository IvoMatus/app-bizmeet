import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UnreadNotificationsProvider } from '@/components/notifications/unread-notifications';
import { AppAlertHost } from '@/components/ui/app-alert';
import { ActiveCompanyProvider } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import { hasUserProfile } from '@/utils/api';
import { bootLog } from '@/utils/boot-log';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error('Falta EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en .env');
}

SplashScreen.preventAutoHideAsync();

bootLog('módulo raíz cargado');

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
    bootLog(`Clerk isLoaded=${isLoaded} isSignedIn=${isSignedIn}`);
  }, [isLoaded, isSignedIn]);

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  // Mantiene el splash (preventAutoHideAsync arriba) hasta que Inter cargue — AnimatedSplashOverlay
  // recién monta y dispara hideAsync cuando este componente deja de devolver null.
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) bootLog('fuentes listas');
  }, [fontsLoaded, fontsError]);

  if (fontsError) console.warn('[fonts][diag] Inter no pudo cargar, se usa la fuente del sistema', fontsError);
  if (!fontsLoaded && !fontsError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthGuard />
        {/* Arriba del Stack entero: lo usan (tabs) y sus Stacks por pestaña (ej. publicacion/crear
            vía useCompanyBlocked). */}
        <ActiveCompanyProvider>
          <UnreadNotificationsProvider>
            {/* Fondo del tema: en la transición nativa la pantalla saliente se desliza y deja ver
                lo que hay detrás del Stack — sin esto asomaba el fondo claro de la ventana (franja
                que destellaba en modo oscuro). */}
            <View style={{ flex: 1, backgroundColor: theme.screenBackground }}>
              {/* Teclado para TODA la app: en Android edge-to-edge (Expo SDK 57) `adjustResize`
                  ya no achica la ventana, así que sin esto el teclado tapa cualquier input.
                  `padding` encoge el Stack hasta el borde del teclado y el ScrollView de cada
                  pantalla lleva solo el input enfocado a la vista. Va acá y no por pantalla.
                  La barra inferior se oculta sola con el teclado (ver bottom-tab-bar.tsx). */}
              <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                {/* 'slide_from_right': push opaco clásico. El default de Android (la pantalla saliente
                    se corre a la izquierda + cross-fade de la entrante encima) se veía como un
                    "pestañeo" que se mueve de lado. Los Stacks por pestaña usan el mismo
                    (tab-stack.tsx, perfil/_layout.tsx). */}
                <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
              </KeyboardAvoidingView>
            </View>
          </UnreadNotificationsProvider>
        </ActiveCompanyProvider>
        <AppAlertHost />
      </ThemeProvider>
    </ClerkProvider>
  );
}
