import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StepProgressProps = {
  /** e.g. "PASO 1 DE 3" */
  stepLabel: string;
  /** e.g. "33% completado" or "Parte 1 de 2: Correo" */
  progressLabel: string;
  /** 0..1 */
  progress: number;
};

/** Stepper header card: "PASO X DE 3" + progress caption + progress bar. */
export function StepProgress({ stepLabel, progressLabel, progress }: StepProgressProps) {
  const theme = useTheme();

  return (
    <ThemedView type="card" style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold" themeColor="accent">
          {stepLabel}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {progressLabel}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.cardElevated }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.accent, width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
