import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "● ALIANZAS CORPORATIVAS" / "● Canje oficial verificado": antetítulo con punto. Default verde `eyebrow`. */
export function Eyebrow({ label, color }: { label: string; color?: string }) {
  const theme = useTheme();
  const tint = color ?? theme.eyebrow;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <ThemedText type="smallBold" style={[styles.label, { color: tint }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
});
