import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { iconoBeneficio } from '@/components/benefits/shared/benefit-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DetailListItem = { titulo: string; texto: string; icono?: string };

type DetailListProps = {
  items: DetailListItem[];
  /** `bullet`: elegibilidad · `number`: pasos de activación · `icon`: logística del evento. */
  marker: 'bullet' | 'number' | 'icon';
};

/** Lista título + texto de los detalles (elegibilidad, cómo activar, logística & beneficios). */
export function DetailList({ items, marker }: DetailListProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        if (marker === 'bullet') {
          return (
            <View key={item.titulo} style={styles.row}>
              <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
              <ThemedText type="body" style={[styles.flex, { color: theme.textMuted }]}>
                <ThemedText type="body" style={{ color: theme.textPrimary, fontWeight: 700 }}>
                  {item.titulo}
                </ThemedText>{' '}
                {item.texto}
              </ThemedText>
            </View>
          );
        }

        const isStep = marker === 'number';
        return (
          <View
            key={item.titulo}
            style={[styles.row, isStep && [styles.step, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]]}
            accessible
            accessibilityLabel={`${isStep ? `Paso ${index + 1}: ` : ''}${item.titulo}. ${item.texto}`}>
            <View style={[styles.marker, { backgroundColor: theme.accentSoft }]}>
              {isStep ? (
                <ThemedText type="smallBold" style={{ color: theme.accentText }}>
                  {index + 1}
                </ThemedText>
              ) : (
                <SymbolView tintColor={theme.accentText} name={iconoBeneficio(item.icono)} size={16} />
              )}
            </View>
            <View style={styles.flex}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                {item.titulo}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                {item.texto}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  step: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
