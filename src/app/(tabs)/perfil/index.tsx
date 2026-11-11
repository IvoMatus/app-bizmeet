import { useAuth, useUser } from '@clerk/expo';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { ThemedText } from '@/components/themed-text';
import { IdentitySection, KycSection, SecuritySection } from '@/components/profile/profile-sections';
import { ProfileTabs } from '@/components/profile/profile-chrome';
import { ProfileHeroCard } from '@/components/profile/profile-hero';
import { buildProfileData, type ProfileData } from '@/components/profile/profile-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchUserProfile } from '@/utils/api';

export default function PerfilScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const getToken = useAuthToken();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;
  const email = user?.primaryEmailAddress?.emailAddress;
  const imageUrl = user?.imageUrl;

  // La foto de perfil viaja como URL firmada (vence a los 15 min), así que no basta con
  // pedirla una vez: las pestañas de Expo Router quedan montadas al cambiar de tab, por eso
  // se refresca en cada foco en vez de solo en el mount.
  // ponytail: deps en campos primitivos de `user`, no en el objeto — Clerk puede emitir un
  // `user` nuevo con los mismos datos, y como la pantalla sigue montada entre tabs, depender de
  // la referencia completa reabre el fetch en loop sin esperar un foco real.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return fetchUserProfile(userId, token);
        })
        .then((api) => setProfile(buildProfileData(api, { email, imageUrl: imageUrl ?? '' })))
        .catch((e: Error) => setError(e.message));
    }, [userId, email, imageUrl, getToken]),
  );

  if (!profile) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.screenBackground }]}>
        {error ? (
          <>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error}</ThemedText>
            <Pressable onPress={() => signOut()} style={styles.logout}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Volver a iniciar sesión
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator color={theme.accent} />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTabs activeKey="perfil" />

      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeroCard profile={profile} onEditPress={() => router.push('/perfil/editar')} />
        <IdentitySection profile={profile} />
        <SecuritySection profile={profile} />
        <KycSection profile={profile} />
        {/* ponytail: logout temporal para pruebas; no está en el diseño, ubicarlo en Ajustes cuando exista */}
        <Pressable onPress={() => signOut()} style={styles.logout}>
          <ThemedText type="smallBold">Cerrar sesión</ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  logout: {
    alignItems: 'center',
    padding: Spacing.three,
  },
});
