import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DetailCardProps = {
  title?: string;
  icon?: SymbolViewProps['name'];
  /** A la derecha del título (pill "Validado", "Paso 1 de 2"...). */
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Contenedor de bloque de los detalles de Beneficios, con título opcional. */
export function DetailCard({ title, icon, right, children, style }: DetailCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }, style]}>
      {title && (
        <View style={styles.titleRow}>
          {icon && <SymbolView tintColor={theme.accentText} name={icon} size={18} />}
          <ThemedText type="h3" accessibilityRole="header" style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </ThemedText>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
  },
});
