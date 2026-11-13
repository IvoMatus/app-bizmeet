import { Image } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BenefitCoverProps = {
  uri?: string;
  height: number;
  /** Ícono grande del fallback sin imagen (los convenios de semilla no traen imagen). */
  fallbackIcon: SymbolViewProps['name'];
  /** Overlays: arriba (pills) y abajo (logo/proveedor, aforo...). */
  top?: ReactNode;
  bottom?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Portada de card/hero de Beneficios. Sin imagen: fondo `buttonDark` con un ícono tenue, así los
 * overlays (pensados para foto oscura) mantienen contraste igual. */
export function BenefitCover({ uri, height, fallbackIcon, top, bottom, style }: BenefitCoverProps) {
  const theme = useTheme();

  return (
    <View style={[styles.cover, { height, backgroundColor: theme.buttonDark }, style]}>
      {uri ? (
        <Image source={{ uri }} contentFit="cover" transition={150} style={StyleSheet.absoluteFill} accessible={false} />
      ) : (
        <View style={styles.fallback} accessible={false} importantForAccessibility="no-hide-descendants">
          <SymbolView tintColor={theme.accentSoft} name={fallbackIcon} size={height * 0.45} />
        </View>
      )}
      <View style={styles.overlay}>
        <View style={styles.row}>{top}</View>
        <View style={styles.row}>{bottom}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    overflow: 'hidden',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: Spacing.four,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
