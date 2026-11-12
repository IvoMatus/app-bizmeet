import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthToken } from '@/hooks/use-auth-token';

import { PLAN_LABEL } from '@/components/company/company-card';
import { CompanyIcon } from '@/components/company/company-icons';
import { createMockCheckoutSession } from '@/components/company/plan-data';
import { PrimaryButton } from '@/components/register/primary-button';
import { RegisterHeader } from '@/components/register/register-header';
import { showAlert } from '@/components/ui/app-alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCompany, fetchPlans, type CompanyDetail, type PlanCatalogEntry } from '@/utils/api';

/**
 * ⚠️ Figma: el MCP llegó al rate limit del plan Starter a mitad del relevamiento de este
 * nodo ("Cambiar Plan de Empresa", 2006:5017 claro / 2006:7359 oscuro, fileKey
 * cMjyM3XHZbQN7DGiquE67M). Solo hubo descripción estructural de alto nivel — SIN
 * `get_design_context` real. Esta pantalla usa tokens/componentes existentes en vez de
 * adivinar textos/colores del diseño. Re-extraer 2006:5017 / 2006:7359 cuando se libere el rate
 * limit para el ajuste fino visual.
 *
 * Catálogo real vía `GET /plans` (precio en USD, cupos del motor de permisos) — sin el selector
 * Mensual/Anual del mock original: el backend no tiene precio anual, inventar un "2 meses
 * gratis" encima hubiera sido fabricar datos otra vez. El checkout en sí sigue mockeado
 * (`createMockCheckoutSession`): Stripe real existe en el backend pero queda bloqueado a
 * Sprint 3 por decisión de producto.
 */
export default function PlanScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [plans, setPlans] = useState<PlanCatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<PlanCatalogEntry['code'] | null>(null);

  const load = useCallback(() => {
    getToken()
      .then(async (token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        const [company, plans] = await Promise.all([fetchCompany(companyId, token), fetchPlans(token)]);
        setCompany(company);
        setPlans(plans);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken, companyId]);

  useEffect(() => {
    load();
  }, [load]);

  // Handler de retorno post-pago por deep link, preparado pero sin esquema real todavía.
  // TODO: coordinar esquema real con T2.7 (hoy no hay infraestructura confirmada de retorno).
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!url.includes('billing-return')) return;
      const success = url.includes('status=success');
      showAlert(
        success ? 'Suscripción activada' : 'No se completó el pago',
        success ? 'Tu plan se actualizará en unos instantes.' : 'Puedes intentarlo de nuevo cuando quieras.',
      );
      if (success) load();
    });
    return () => subscription.remove();
  }, [load]);

  const handleChoosePlan = useCallback(
    async (plan: PlanCatalogEntry) => {
      setCheckoutLoadingPlan(plan.code);
      try {
        const session = await createMockCheckoutSession(companyId, plan.code);
        await WebBrowser.openAuthSessionAsync(session.url, Linking.createURL('empresa/billing-return'));
      } catch {
        showAlert('No se pudo iniciar el pago', 'Revisa tu conexión e intenta de nuevo.');
      } finally {
        setCheckoutLoadingPlan(null);
      }
    },
    [companyId],
  );

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <RegisterHeader title="Elegir plan" onBack={() => router.back()} />

        {error && !company && (
          <Pressable onPress={load} style={styles.center}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Toca para reintentar.</ThemedText>
          </Pressable>
        )}

        {(!company || !plans) && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {company && plans && (
          <ScrollView contentContainerStyle={styles.content}>
            {plans.map((plan) => {
              const isCurrent = plan.code === company.plan && company.estado !== 'PENDIENTE_PAGO';
              const loadingThis = checkoutLoadingPlan === plan.code;
              const features = [
                `${plan.cupos.publicacionesPorTipoMes} publicaciones por tipo al mes`,
                `${plan.cupos.iniciarConversacionesMes} conversaciones iniciadas al mes`,
                plan.cupos.sugerenciasMes > 0 ? `${plan.cupos.sugerenciasMes} sugerencias al mes` : null,
                `${plan.cupos.contactos} contactos de equipo`,
                plan.prioritarias ? 'Publicaciones prioritarias' : null,
                plan.aparecerEnDirectorio ? 'Aparece en el directorio' : null,
              ].filter((f): f is string => f !== null);

              return (
                <View
                  key={plan.code}
                  style={[
                    styles.card,
                    { backgroundColor: theme.cardElevated, borderColor: isCurrent ? theme.accent : theme.surfaceBorder },
                  ]}>
                  <View style={styles.cardHeader}>
                    <ThemedText style={[styles.planLabel, { color: theme.textPrimary }]}>{PLAN_LABEL[plan.code]}</ThemedText>
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: theme.buttonDark }]}>
                        <ThemedText style={[styles.currentBadgeLabel, { color: theme.accent }]}>Plan actual</ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText style={[styles.price, { color: theme.textPrimary }]}>
                    ${plan.precioUsdMes.toLocaleString('en-US')} USD
                    <ThemedText style={[styles.pricePeriod, { color: theme.textMuted }]}> / mes</ThemedText>
                  </ThemedText>

                  {features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <CompanyIcon name="verified-check" color={theme.success} width={12} height={12} />
                      <ThemedText style={[styles.featureLabel, { color: theme.textMuted }]}>{feature}</ThemedText>
                    </View>
                  ))}

                  <PrimaryButton
                    label={isCurrent ? 'Plan actual' : loadingThis ? 'Abriendo pago…' : `Elegir ${PLAN_LABEL[plan.code]}`}
                    disabled={isCurrent || checkoutLoadingPlan !== null}
                    onPress={() => handleChoosePlan(plan)}
                  />
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  loading: { marginTop: Spacing.four },
  content: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  planLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  currentBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '500',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  featureLabel: {
    fontSize: 13,
  },
});
