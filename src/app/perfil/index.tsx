import { useAuth, useUser } from '@clerk/expo';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { IdentitySection, KycSection, SecuritySection } from '@/components/profile/profile-sections';
import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { ProfileTabs, ProfileTopBar } from '@/components/profile/profile-chrome';
import { ProfileHeroCard } from '@/components/profile/profile-hero';
import { buildProfileData, type ProfileData } from '@/components/profile/profile-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchUserProfile } from '@/utils/api';

export default function PerfilScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const email = user.primaryEmailAddress?.emailAddress;
    fetchUserProfile(user.id)
      .then((api) => setProfile(buildProfileData(api, { email, imageUrl: user.imageUrl })))
      .catch((e: Error) => setError(e.message));
  }, [user]);

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
      <ProfileTopBar avatar={profile.avatarUri} companyLogo={profile.companyLogoUri} hasUnread={profile.unreadNotifications} />
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

      <BottomTabBar avatar={profile.avatarUri} companyLogo={profile.companyLogoUri} activeKey="perfil" />
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
