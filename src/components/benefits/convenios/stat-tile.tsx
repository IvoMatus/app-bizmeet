import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Métrica del header de sección: valor grande + etiqueta ("5 · Activos"). */
export function StatTile({ value, label }: { value: string; label: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.surfaceBorder }]}>
      <ThemedText type="h3" style={{ color: theme.accent }}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textMuted }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 104,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
});
