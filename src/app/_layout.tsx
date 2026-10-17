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

// ponytail: guard by segment; register/step-4 is exempt because the session is already active there.
function AuthGuard() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inRegisterSuccess = segments[1] === 'register' && segments[2] === 'step-4';
    if (isSignedIn && inAuthGroup && !inRegisterSuccess) {
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
