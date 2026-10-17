import { Image } from 'expo-image';
import { ImageSourcePropType, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileChromeProps = {
  avatar: ImageSourcePropType;
  companyLogo: number;
  hasUnread: boolean;
};

/** Header fijo de Ver Perfil: marca BizAInet + PRO, notificaciones y avatar. */
export function ProfileTopBar({ avatar, hasUnread }: ProfileChromeProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.navBackground }}>
      <View style={[styles.topBar, { borderBottomColor: theme.surfaceBorder }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: theme.accentSoft }]}>
            <ProfileIcon name="brand" color={theme.accent} width={18} height={18} />
          </View>
          <View>
            <View style={styles.brandNameRow}>
              <ThemedText style={[styles.brandName, { color: theme.textPrimary }]}>
                BizAInet
              </ThemedText>
              <View style={[styles.proChip, { backgroundColor: theme.accentSoft }]}>
                <ThemedText style={[styles.proLabel, { color: theme.accent }]}>PRO</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.subtitle, { color: theme.textMuted }]}>Mi Perfil</ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            style={[styles.iconButton, { backgroundColor: theme.surfaceInset }]}>
            <ProfileIcon name="bell" color={theme.textMuted} width={18} height={18} />
            {hasUnread && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
          </Pressable>
          <Image
            source={avatar}
            accessibilityLabel="Foto de perfil"
            style={[styles.topAvatar, { borderColor: theme.accent }]}
            contentFit="cover"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

type TabItem = { key: string; label: string; icon: ProfileIconName; dot?: boolean };

const PROFILE_TABS: TabItem[] = [
  { key: 'perfil', label: 'Perfil', icon: 'person' },
  { key: 'invitaciones', label: 'Invitaciones', icon: 'mail-plus' },
  { key: 'pago', label: 'Pago', icon: 'card' },
  { key: 'notif', label: 'Notif.', icon: 'bell-outline', dot: true },
];

/** Pestañas horizontales bajo el header. "Perfil" es la activa. */
export function ProfileTabs({ activeKey = 'perfil' }: { activeKey?: string }) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContent}
      style={[styles.tabsWrap, { borderBottomColor: theme.surfaceBorder }]}>
      {PROFILE_TABS.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[
              styles.tab,
              active && { backgroundColor: theme.accentSoft, borderColor: theme.accent },
            ]}>
            <ProfileIcon
              name={tab.icon}
              color={active ? theme.accent : theme.textMuted}
              width={14}
              height={14}
            />
            <ThemedText
              style={[styles.tabLabel, { color: active ? theme.accent : theme.textMuted }]}>
              {tab.label}
            </ThemedText>
            {tab.dot && <View style={[styles.dot, styles.tabDot, { backgroundColor: theme.accent }]} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
  },
  proChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  proLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  tabsWrap: {
    flexGrow: 0,
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabDot: {
    position: 'relative',
    top: 0,
    right: 0,
    marginLeft: Spacing.half,
  },
});
