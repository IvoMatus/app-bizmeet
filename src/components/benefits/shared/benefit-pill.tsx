import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type BenefitPillProps = {
  label: string;
  fg: string;
  bg: string;
  /** Punto de color a la izquierda ("● PARTNER PLATINUM"). Ignorado si hay `icon`. */
  dot?: string;
  icon?: SymbolViewProps['name'];
  /** Color del ícono si difiere del texto. */
  iconColor?: string;
};

/** Pill de estado/etiqueta de Beneficios. Fondo opaco a propósito: va encima de fotos. */
export function BenefitPill({ label, fg, bg, dot, icon, iconColor }: BenefitPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? (
        <SymbolView tintColor={iconColor ?? fg} name={icon} size={12} />
      ) : (
        dot && <View style={[styles.dot, { backgroundColor: dot }]} />
      )}
      <ThemedText type="smallBold" style={[styles.label, { color: fg }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 9999,
    maxWidth: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});
