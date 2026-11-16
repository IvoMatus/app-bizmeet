import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

// Pulso compartido: un solo valor animado para todos los bloques del grupo (van en fase), y solo
// los bloques pulsan — no la tarjeta que los contiene.
const PulseContext = createContext<ReturnType<typeof useAnimatedStyle<{ opacity: number }>> | null>(null);

/**
 * Contenedor de una carga con esqueletos: pulso de opacidad suave en los bloques (quieto si el
 * sistema tiene "reducir movimiento") y UN solo elemento para lectores de pantalla — `label` —
 * con los bloques de adentro agrupados, sin anunciarse uno por uno. Genérico: armar adentro la
 * forma de lo que va a llegar con `SkeletonBlock` (ver PostCardSkeleton).
 */
export function SkeletonGroup({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(opacity);
  }, [reduceMotion, opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={style}>
      <PulseContext.Provider value={pulse}>{children}</PulseContext.Provider>
    </View>
  );
}

/** Bloque relleno del esqueleto: darle tamaño/forma con `style`. */
export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const pulse = useContext(PulseContext);
  return <Animated.View style={[{ backgroundColor: theme.cardElevated, borderRadius: 6 }, style, pulse]} />;
}

/** Línea de texto de `lineHeight` dado: el bloque ocupa el mismo alto que la línea real (así no
 * salta el layout cuando llega el texto). */
export function skeletonLine(lineHeight: number, width: ViewStyle['width']): ViewStyle {
  return { width, height: lineHeight - 8, marginVertical: 4 };
}
