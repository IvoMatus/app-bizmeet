import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Cierre del listado de Convenios: invitación a postularse como Partner. */
export function PartnerCtaCard() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.buttonDark }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.accentStrong }]}>
          <SymbolView tintColor={theme.onButtonDark} name={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }} size={22} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="smallBold" style={[styles.overline, { color: theme.success }]}>
            RED COLABORATIVA B2B
          </ThemedText>
          <ThemedText type="h3" accessibilityRole="header" style={{ color: theme.onButtonDark }}>
            ¿Tienes una alianza comercial que ofrecer?
          </ThemedText>
        </View>
      </View>
      <ThemedText type="body" style={{ color: theme.onButtonDark }}>
        Postula los productos o servicios de tu empresa para ser Partner Estratégico y llega a más de 3,400 compañías federadas.
      </ThemedText>
      <BenefitButton
        label="Postular Empresa como Partner"
        icon={{ ios: 'hands.sparkles.fill', android: 'handshake', web: 'handshake' }}
        // TODO: no hay flujo de postulación como Partner todavía (ni endpoint ni diseño).
        onPress={() => showAlert('Próximamente', 'La postulación como Partner estará disponible próximamente.')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
});
