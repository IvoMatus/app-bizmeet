import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { iconoBeneficio } from '@/components/benefits/shared/benefit-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Tile ícono + label + valor ("Créditos de Bienvenida / $10,000 USD"). */
export function HighlightTile({ icono, label, valor }: { icono?: string; label: string; valor: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${valor}`}
      style={[styles.tile, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
        <SymbolView tintColor={theme.accentText} name={iconoBeneficio(icono)} size={16} />
      </View>
      <View style={styles.text}>
        <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12, lineHeight: 16 }}>
          {label}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {valor}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
