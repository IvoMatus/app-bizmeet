import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "147 / 200 Lugares reservados · Quedan 53 cupos" + barra de progreso. */
export function CapacityBar({ reservados, total }: { reservados: number; total: number }) {
  const theme = useTheme();
  const quedan = Math.max(total - reservados, 0);
  const pct = total > 0 ? Math.min(reservados / total, 1) : 0;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${reservados} de ${total} lugares reservados, quedan ${quedan} cupos`}
      accessibilityValue={{ min: 0, max: total, now: reservados }}>
      <View style={styles.labels}>
        <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
          {reservados} / {total} Lugares reservados
        </ThemedText>
        <View style={styles.remaining}>
          {/* Ámbar en el ícono y no en el texto: ámbar sobre blanco no llega a 4.5:1. */}
          <SymbolView tintColor={theme.warningAccent} name={{ ios: 'hourglass', android: 'hourglass_top', web: 'hourglass_top' }} size={12} />
          <ThemedText type="smallBold" style={{ color: theme.textPrimary, fontSize: 12 }}>
            Quedan {quedan} cupos
          </ThemedText>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: theme.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  remaining: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  track: {
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
