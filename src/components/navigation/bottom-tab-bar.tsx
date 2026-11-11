import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { confirmExitIfNeeded } from '@/hooks/use-discard-guard';
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
  /**
   * Cómo navegar al tocar un ítem. Default `router.navigate`: dentro de (tabs) (ver
   * app-tabs.tsx) el destino vive en el mismo navigator de tabs, y `navigate` ya hace el
   * JUMP_TO correcto sin tocar el stack.
   *
   * Desde una pantalla fuera de (tabs) (ver RootBottomTabBar en el root `_layout.tsx`) el
   * destino está en otra rama del Stack raíz: ahí hay que pasar `router.dismissTo` en su lugar.
   * `navigate` resuelve ese salto con un StackRouter 'NAVIGATE' que, si la ruta destino ya
   * existe más abajo en el stack, la reordena al tope SIN remover la pantalla actual del
   * array de rutas — como ninguna ruta se remueve, `beforeRemove`/`usePreventRemove` (el guard
   * de "descartar publicación" de publicacion/crear) nunca se dispara, y la navegación lo
   * saltea. `dismissTo` dispara un 'POP_TO' real: descarta las pantallas hasta la de destino,
   * lo cual sí pasa por `beforeRemove` en cada una — igual que el back nativo.
   */
  onNavigate?: (href: Href) => void;
};

/** Barra inferior compartida de 6 destinos. "Empresa" usa el logo y "Perfil" el avatar. */
export function BottomTabBar({ activeKey, avatar, companyLogo, onNavigate = router.navigate }: BottomTabBarProps) {
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
              // confirmExitIfNeeded: cubre el caso que ni `navigate` ni `dismissTo` resuelven —
              // tocar otra tab mientras hay cambios sin guardar en una pantalla anidada dentro de
              // (tabs) (ver perfil/editar.tsx) no remueve nada, solo cambia el foco del Tabs
              // navigator, así que `beforeRemove` nunca se dispara ahí (ver use-discard-guard.ts).
              onPress={() => confirmExitIfNeeded(() => onNavigate(item.href))}
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
