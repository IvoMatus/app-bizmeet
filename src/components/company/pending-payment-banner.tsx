import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { PLAN_LABEL } from '@/components/company/company-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useTheme } from '@/hooks/use-theme';

/**
 * Aviso de pago pendiente de la empresa activa (`pendingPayment` de useActiveCompany, T2.3). Sin
 * diseño en Figma: sigue el estilo warning de la app. El CTA "Pagar plan" solo aparece si el
 * motor de permisos lo deja (`derechos['change-plan']`: ADMINISTRADOR de una empresa Cliente);
 * al resto le explica quién tiene que pagar.
 */
export function PendingPaymentBanner() {
  const theme = useTheme();
  const { active, pendingPayment, context } = useActiveCompany();
  if (!pendingPayment || !active) return null;

  const { id, name, plan } = active.company;
  const canPay = context?.derechos['change-plan']?.permitida === true;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.warningSurface, borderColor: theme.warningBorder }]}>
      <ThemedText type="small" themeColor="warningText" style={styles.text}>
        <ThemedText type="smallBold" themeColor="warningText">
          Pago pendiente.{' '}
        </ThemedText>
        {name} opera con perfil básico hasta que se confirme el pago del plan {PLAN_LABEL[plan]}.
        {canPay ? '' : ' La persona administradora de la empresa debe completarlo.'}
      </ThemedText>
      {canPay && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pagar plan de ${name}`}
          hitSlop={Spacing.two}
          onPress={() => router.push(`/empresa/plan?companyId=${id}`, { withAnchor: true })}
          style={styles.cta}>
          <ThemedText type="smallBold" themeColor="warningText">
            Pagar plan
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
  cta: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
