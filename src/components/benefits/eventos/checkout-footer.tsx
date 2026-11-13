import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Cierre de la selección de entrada: total, "Pasarela Encriptada" y confirmar. */
export function CheckoutFooter({ total, onConfirm }: { total: number; onConfirm: () => void }) {
  const theme = useTheme();
  const gratis = total === 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      <View style={styles.row}>
        <View accessible accessibilityLabel={`Total a liquidar: MXN ${total.toFixed(2)}`}>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            Total a liquidar:
          </ThemedText>
          <ThemedText type="h2" style={{ color: gratis ? theme.successStrong : theme.textPrimary }}>
            MXN {total.toFixed(2)}
          </ThemedText>
        </View>
        <View style={[styles.secure, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={12} />
          <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
            Pasarela Encriptada
          </ThemedText>
        </View>
      </View>
      <BenefitButton
        label={gratis ? 'CONFIRMAR ASISTENCIA (GRATIS SOCIO)' : 'CONFIRMAR ASISTENCIA'}
        icon={{ ios: 'person.crop.circle.badge.checkmark', android: 'how_to_reg', web: 'how_to_reg' }}
        onPress={onConfirm}
        style={styles.cta}
      />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    borderWidth: 1,
  },
  cta: {
    minHeight: 52,
  },
});
