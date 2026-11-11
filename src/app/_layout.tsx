import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppAlertHost } from '@/components/ui/app-alert';

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
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inRegisterFlow = segments[1] === 'register';
    if (isSignedIn && inAuthGroup && !inRegisterFlow) {
      router.replace('/');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isLoaded, isSignedIn, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }} />
        <AppAlertHost />
      </ThemeProvider>
    </ClerkProvider>
  );
}
