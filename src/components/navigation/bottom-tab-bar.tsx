import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NavItem = { key: string; label: string; href: Href; icon?: ProfileIconName };

/** key = nombre de ruta (en (tabs)) o 'perfil' para la ruta fuera de tabs. */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: 'index', label: 'Inicio', href: '/', icon: 'home' },
  { key: 'messages', label: 'Mensajes', href: '/messages', icon: 'chat' },
  { key: 'benefits', label: 'Beneficios', href: '/benefits', icon: 'gift' },
  { key: 'network', label: 'Red', href: '/network', icon: 'network' },
  { key: 'company', label: 'Empresa', href: '/company' },
  { key: 'perfil', label: 'Perfil', href: '/perfil' },
];

type BottomTabBarProps = {
  activeKey?: string;
  avatar: ImageSourcePropType;
  companyLogo: number;
};

/** Barra inferior compartida de 6 destinos. "Empresa" usa el logo y "Perfil" el avatar. */
export function BottomTabBar({ activeKey, avatar, companyLogo }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.container,
        { backgroundColor: theme.navBackground, borderTopColor: theme.surfaceBorder },
      ]}>
      <View style={styles.bar}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = item.key === activeKey;
          const color = active ? theme.accent : theme.textMuted;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => router.navigate(item.href)}
              style={styles.item}>
              {item.key === 'company' ? (
                <View style={[styles.circle, { backgroundColor: theme.buttonDark }]}>
                  <Image source={companyLogo} style={styles.companyLogo} contentFit="cover" />
                  <View style={[styles.badge, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]} />
                </View>
              ) : item.key === 'perfil' ? (
                <Image
                  source={avatar}
                  style={[styles.avatar, { borderColor: theme.accent }]}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.circle,
                    { backgroundColor: active ? theme.accentSoft : theme.surfaceInset },
                  ]}>
                  {item.icon && <ProfileIcon name={item.icon} color={color} width={18} height={18} />}
                </View>
              )}
              <ThemedText style={[styles.label, { color }]}>{item.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  item: {
    alignItems: 'center',
    gap: Spacing.half,
    minWidth: 48,
    minHeight: 44,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
