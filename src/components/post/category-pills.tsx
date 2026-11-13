import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Rubro } from '@/utils/api';

export const GENERAL_FEED = 'general';

type CategoryPillsProps = {
  /** Catálogo SCIAN (PA-10) u otra lista código+nombre (categorías de convenios) — `null` mientras carga. */
  industries: Pick<Rubro, 'codigo' | 'nombre'>[] | null;
  selected: string;
  onSelect: (value: string) => void;
  /** Etiqueta de la primera opción, la que no filtra (valor `GENERAL_FEED`). */
  allLabel?: string;
};

/** Pills horizontales: opción "todas" + una por código (muro T3.2, Convenios). */
export function CategoryPills({ industries, selected, onSelect, allLabel = 'General' }: CategoryPillsProps) {
  const theme = useTheme();
  const options = [{ label: allLabel, value: GENERAL_FEED }, ...(industries ?? []).map((r) => ({ label: r.nombre, value: r.codigo }))];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap} contentContainerStyle={styles.content}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onSelect(option.value)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? theme.buttonDark : theme.surface,
                borderColor: active ? theme.buttonDark : theme.surfaceBorder,
              },
            ]}>
            <ThemedText type="small" style={{ color: active ? theme.onButtonDark : theme.textMuted, fontWeight: '600' }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
});
