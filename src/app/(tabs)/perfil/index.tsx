import { useAuth, useUser } from '@clerk/expo';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

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
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // La foto de perfil viaja como URL firmada (vence a los 15 min), así que no basta con
  // pedirla una vez: las pestañas de Expo Router quedan montadas al cambiar de tab, por eso
  // se refresca en cada foco en vez de solo en el mount.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const email = user.primaryEmailAddress?.emailAddress;
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return fetchUserProfile(user.id, token);
        })
        .then((api) => setProfile(buildProfileData(api, { email, imageUrl: user.imageUrl })))
        .catch((e: Error) => setError(e.message));
    }, [user, getToken]),
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
