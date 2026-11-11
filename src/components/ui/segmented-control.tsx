import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SegmentedOption<T extends string> = { value: T; label: string; icon?: ReactNode; badge?: string };

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Fondo del segmento activo. Default `theme.accent` (tabs de entidad); pasar `theme.buttonDark` para el toggle Mensual/Anual. */
  activeBackgroundColor?: string;
};

/** Segmented control genérico (tabs de entidad, toggle Mensual/Anual) — único en el repo, se repite 2x en Planes. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  activeBackgroundColor,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const activeBg = activeBackgroundColor ?? theme.accent;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, { backgroundColor: theme.surfaceInset }]}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: activeBg }]}
          >
            {option.icon}
            <ThemedText type="smallBold" style={{ color: active ? theme.onButtonDark : theme.textMuted }}>
              {option.label}
            </ThemedText>
            {option.badge && (
              <View style={[styles.badge, { backgroundColor: theme.successSurface }]}>
                <ThemedText style={[styles.badgeLabel, { color: theme.eyebrow }]}>{option.badge}</ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half + 2,
    minHeight: 44,
    borderRadius: 8,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
});
