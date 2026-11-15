import { Image } from 'expo-image';
import type { BottomTabBarProps as TabsBarProps } from 'expo-router/tabs';
import { useEffect, useState } from 'react';
import { ImageSourcePropType, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { confirmExitIfNeeded } from '@/hooks/use-discard-guard';
import { useTheme } from '@/hooks/use-theme';

/** key = nombre de la ruta en el Tabs de (tabs) (los grupos con Stack propio van con paréntesis). */
type NavItem = { key: string; label: string; icon?: ProfileIconName };

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: '(home)', label: 'Inicio', icon: 'home' },
  { key: 'messages', label: 'Mensajes', icon: 'chat' },
  { key: '(benefits)', label: 'Beneficios', icon: 'gift' },
  { key: 'network', label: 'Red', icon: 'network' },
  { key: '(company)', label: 'Empresa' },
  { key: 'perfil', label: 'Perfil' },
];

type BottomTabBarProps = Pick<TabsBarProps, 'state' | 'navigation'> & {
  avatar: ImageSourcePropType;
  companyLogo: number;
};

/** Barra inferior compartida de 6 destinos. "Empresa" usa el logo y "Perfil" el avatar. */
export function BottomTabBar({ state, navigation, avatar, companyLogo }: BottomTabBarProps) {
  const theme = useTheme();
  // Equivalente a `tabBarHideOnKeyboard` (no aplica con `tabBar` custom): con el
  // KeyboardAvoidingView del root `_layout.tsx` la barra subiría sobre el teclado, con su inset
  // inferior, y le comería alto al formulario.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardOpen) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.container,
        { backgroundColor: theme.navBackground, borderTopColor: theme.surfaceBorder },
      ]}>
      <View style={styles.bar}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const route = state.routes.find((r) => r.name === item.key);
          if (!route) return null;
          const active = state.routes[state.index].key === route.key;
          const color = active ? theme.accent : theme.textMuted;
          // Press canónico de tabs: `tabPress` + navigate si no es la activa. En la activa, el
          // Stack de la pestaña escucha `tabPress` y vuelve a su raíz (popToTop) — eso remueve
          // pantallas, así que una hija con cambios sin guardar lo frena con su propio
          // `beforeRemove` (useDiscardGuard). Cambiar a OTRA tab no remueve nada (solo cambia el
          // foco), por eso ahí pasa antes por confirmExitIfNeeded.
          const emitTabPress = () =>
            navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          const onPress = active
            ? emitTabPress
            : () =>
                confirmExitIfNeeded(() => {
                  if (!emitTabPress().defaultPrevented) navigation.navigate(route.name);
                });
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={onPress}
              style={styles.item}>
              {item.key === '(company)' ? (
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
