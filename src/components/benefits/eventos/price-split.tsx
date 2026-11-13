import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Precio = { label: string; valor: string };

/** Caja de dos precios lado a lado: "MEMBRESÍA BIZAINET $0 MXN (Incluido) | PÚBLICO GENERAL MXN 200". */
export function PriceSplit({ miembro, publico }: { miembro: Precio; publico: Precio }) {
  const theme = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <Columna precio={miembro} color={theme.successStrong} />
      <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
      <Columna precio={publico} color={theme.textPrimary} />
    </View>
  );
}

function Columna({ precio, color }: { precio: Precio; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.column} accessible accessibilityLabel={`${precio.label}: ${precio.valor}`}>
      <ThemedText type="smallBold" style={[styles.label, { color: theme.textMuted }]}>
        {precio.label}
      </ThemedText>
      <ThemedText type="smallBold" style={[styles.value, { color }]}>
        {precio.valor}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
  },
  divider: {
    width: 1,
  },
  column: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  // ≥ 18.66px en negrita = "texto grande" WCAG: el verde sobre fondo claro solo llega a ~3.9:1.
  value: {
    fontSize: 19,
    lineHeight: 24,
  },
});
