import { Image } from 'expo-image';
import { ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon } from '@/components/profile/profile-icons';
import { StatusPill } from '@/components/profile/profile-primitives';
import { ProfileData } from '@/components/profile/profile-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Avatar circular con anillo de acento. `verified` agrega el badge verde; `onCameraPress` el botón de cámara. */
export function ProfileAvatar({
  source,
  size = 80,
  verified,
  onCameraPress,
}: {
  source: ImageSourcePropType;
  size?: number;
  verified?: boolean;
  onCameraPress?: () => void;
}) {
  const theme = useTheme();
  const badge = Math.round(size * 0.3);

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={source}
        accessibilityLabel="Foto de perfil"
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, borderColor: theme.accent },
        ]}
        contentFit="cover"
      />
      {verified && (
        <View
          style={[
            styles.verifiedBadge,
            { width: badge, height: badge, borderRadius: badge / 2, backgroundColor: theme.success, borderColor: theme.surface },
          ]}>
          <ProfileIcon name="verified" color={theme.background} width={badge * 0.6} height={badge * 0.6} />
        </View>
      )}
      {onCameraPress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar fotografía"
          onPress={onCameraPress}
          style={[styles.cameraButton, { backgroundColor: theme.accent, borderColor: theme.surface }]}>
          <SymbolView name="camera.fill" tintColor={theme.background} size={14} />
        </Pressable>
      )}
    </View>
  );
}

/** Tarjeta hero de Ver Perfil: avatar, nombre, cargo, pills y botón "Editar Perfil". */
export function ProfileHeroCard({
  profile,
  onEditPress,
}: {
  profile: ProfileData;
  onEditPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      <ProfileAvatar source={profile.avatarUri} size={80} verified />
      <View style={styles.heroText}>
        <ThemedText style={[styles.name, { color: theme.textPrimary }]}>{profile.fullName}</ThemedText>
        <ThemedText style={[styles.role, { color: theme.textMuted }]}>{profile.role}</ThemedText>
      </View>
      <View style={styles.pills}>
        <StatusPill label={profile.membership} />
        <StatusPill label={profile.aiVerifiedScore} variant="success" icon="ia-sparkle" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Editar Perfil"
        onPress={onEditPress}
        style={({ pressed }) => [
          styles.editButton,
          { backgroundColor: theme.buttonDark, opacity: pressed ? 0.85 : 1 },
        ]}>
        <SymbolView name="pencil" tintColor={theme.onButtonDark} size={14} />
        <ThemedText style={[styles.editLabel, { color: theme.onButtonDark }]}>Editar Perfil</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroText: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  role: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  editButton: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.half,
    borderRadius: 12,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
