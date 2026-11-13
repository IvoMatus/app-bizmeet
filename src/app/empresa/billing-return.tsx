import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiscardButton } from '@/components/profile/profile-form';
import { PrimaryButton } from '@/components/register/primary-button';
import { RegisterHeader } from '@/components/register/register-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useTheme } from '@/hooks/use-theme';

type Estado = 'success' | 'cancel' | 'error';

const CONTENIDO: Record<Estado, { icon: SymbolViewProps['name']; titulo: string; texto: string }> = {
  success: {
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
    titulo: 'Pago realizado',
    texto: 'Recibimos tu pago. Tu plan se activa en unos instantes, en cuanto Stripe confirme el cobro.',
  },
  cancel: {
    icon: { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' },
    titulo: 'Pago cancelado',
    texto: 'No se completó el pago y no se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.',
  },
  error: {
    icon: { ios: 'exclamationmark.triangle.fill', android: 'error', web: 'error' },
    titulo: 'No pudimos confirmar el pago',
    texto: 'Algo falló al volver de la pasarela de pago. Revisa tu historial de pagos antes de intentarlo otra vez.',
  },
};

/**
 * Regreso del checkout de Stripe (T2.3). Llega por `plan.tsx` (con `companyId`) o directo por el deep
 * link `appbizmeet://empresa/billing-return?status=…` (STRIPE_CHECKOUT_SUCCESS_URL/CANCEL_URL del
 * backend), que en Android también abre esta ruta; ahí no hay `companyId` y los botones van a Mis
 * Empresas. Cualquier `status` que no sea success/cancel se muestra como error.
 * Sin diseño en Figma para Fase 1 (los frames 2043:2/2043:168 son de Fase 2): estilo de la app.
 */
export default function BillingReturnScreen() {
  const theme = useTheme();
  const { status, companyId } = useLocalSearchParams<{ status?: string; companyId?: string }>();
  const { reload } = useActiveCompany();
  const estado: Estado = status === 'success' || status === 'cancel' ? status : 'error';
  const { icon, titulo, texto } = CONTENIDO[estado];
  const color = estado === 'success' ? theme.success : estado === 'cancel' ? theme.warning : theme.error;

  // Éxito: refrescar Mis Empresas para que se vaya el estado PENDIENTE_PAGO (si el webhook ya llegó).
  useEffect(() => {
    if (estado === 'success') reload();
  }, [estado, reload]);

  const irAEmpresa = () => router.replace(companyId ? `/empresa/${companyId}` : '/company');

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <RegisterHeader title="Pago del plan" onBack={irAEmpresa} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero} accessible accessibilityRole="summary" accessibilityLabel={`${titulo}. ${texto}`}>
            <SymbolView name={icon} tintColor={color} size={64} />
            <ThemedText type="subtitle" style={styles.center} accessibilityRole="header">
              {titulo}
            </ThemedText>
            <ThemedText type="default" themeColor="textMuted" style={styles.center}>
              {texto}
            </ThemedText>
          </View>

          {estado === 'success' ? (
            <PrimaryButton label={companyId ? 'Ver mi empresa' : 'Ir a Mis Empresas'} onPress={irAEmpresa} />
          ) : (
            <>
              {companyId && (
                <PrimaryButton label="Intentar de nuevo" onPress={() => router.replace(`/empresa/plan?companyId=${companyId}`)} />
              )}
              {estado === 'error' && companyId && (
                <DiscardButton label="Ver historial de pagos" onPress={() => router.replace(`/empresa/pagos?companyId=${companyId}`)} />
              )}
              <DiscardButton label={companyId ? 'Volver a la empresa' : 'Ir a Mis Empresas'} onPress={irAEmpresa} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  hero: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  center: { textAlign: 'center' },
});
