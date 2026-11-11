import { useAuth } from '@clerk/expo';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompanyIcon } from '@/components/company/company-icons';
import { createMockCheckoutSession, PLAN_CATALOG, priceForCycle, type BillingCycle, type PlanOption } from '@/components/company/plan-data';
import { PrimaryButton } from '@/components/register/primary-button';
import { RegisterHeader } from '@/components/register/register-header';
import { showAlert } from '@/components/ui/app-alert';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCompany, type CompanyDetail } from '@/utils/api';

/**
 * ⚠️ Figma: el MCP llegó al rate limit del plan Starter a mitad del relevamiento de este
 * nodo ("Cambiar Plan de Empresa", 2006:5017 claro / 2006:7359 oscuro, fileKey
 * cMjyM3XHZbQN7DGiquE67M). Solo hubo descripción estructural de alto nivel (selector de tipo
 * de entidad, selector mensual/anual, tarjeta de plan activo con precio y CTA) — SIN
 * `get_design_context` real. Esta pantalla usa tokens/componentes existentes en vez de
 * adivinar textos/colores del diseño. Layout provisorio: tarjetas de los 3 planes en vez de un
 * selector de "tipo de entidad" separado (no quedó claro a qué refería esa descripción sin
 * el contexto completo del nodo). Re-extraer 2006:5017 / 2006:7359 cuando se libere el rate
 * limit para el ajuste fino visual.
 */
export default function PlanScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>('MENSUAL');
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<PlanOption['type'] | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchCompany(companyId, token);
      })
      .then((company) => {
        setCompany(company);
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
        success ? 'Tu plan se actualizará en unos instantes.' : 'Podés intentar de nuevo cuando quieras.',
      );
      if (success) load();
    });
    return () => subscription.remove();
  }, [load]);

  const handleChoosePlan = useCallback(
    async (plan: PlanOption) => {
      setCheckoutLoadingPlan(plan.type);
      try {
        // TODO(backend): sustituir por fetch real a POST /companies/:id/billing/checkout-session
        // (ver `createMockCheckoutSession`) cuando el endpoint exista.
        const session = await createMockCheckoutSession(companyId, plan.type, cycle);
        await WebBrowser.openAuthSessionAsync(session.url, Linking.createURL('empresa/billing-return'));
      } catch {
        showAlert('No se pudo iniciar el pago', 'Revisá tu conexión e intentá de nuevo.');
      } finally {
        setCheckoutLoadingPlan(null);
      }
    },
    [companyId, cycle],
  );

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <RegisterHeader title="Elegir plan" onBack={() => router.back()} />

        {error && !company && (
          <Pressable onPress={load} style={styles.center}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
          </Pressable>
        )}

        {!company && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {company && (
          <ScrollView contentContainerStyle={styles.content}>
            <SegmentedControl
              accessibilityLabel="Ciclo de facturación"
              value={cycle}
              onChange={setCycle}
              activeBackgroundColor={theme.buttonDark}
              options={[
                { value: 'MENSUAL', label: 'Mensual' },
                { value: 'ANUAL', label: 'Anual', badge: '2 meses gratis' },
              ]}
            />

            {PLAN_CATALOG.map((plan) => {
              const isCurrent = plan.type === company.plan.type;
              const price = priceForCycle(plan, cycle);
              const loadingThis = checkoutLoadingPlan === plan.type;

              return (
                <View
                  key={plan.type}
                  style={[
                    styles.card,
                    { backgroundColor: theme.cardElevated, borderColor: isCurrent ? theme.accent : theme.surfaceBorder },
                  ]}>
                  <View style={styles.cardHeader}>
                    <ThemedText style={[styles.planLabel, { color: theme.textPrimary }]}>{plan.label}</ThemedText>
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: theme.buttonDark }]}>
                        <ThemedText style={[styles.currentBadgeLabel, { color: theme.accent }]}>Plan actual</ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText style={[styles.description, { color: theme.textMuted }]}>{plan.description}</ThemedText>

                  <ThemedText style={[styles.price, { color: theme.textPrimary }]}>
                    ${price.toLocaleString('es-MX')} MXN
                    <ThemedText style={[styles.pricePeriod, { color: theme.textMuted }]}>
                      {cycle === 'ANUAL' ? ' / año' : ' / mes'}
                    </ThemedText>
                  </ThemedText>

                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <CompanyIcon name="verified-check" color={theme.success} width={12} height={12} />
                      <ThemedText style={[styles.featureLabel, { color: theme.textMuted }]}>{feature}</ThemedText>
                    </View>
                  ))}

                  <PrimaryButton
                    label={isCurrent ? 'Plan actual' : loadingThis ? 'Abriendo pago…' : `Elegir ${plan.label}`}
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
  description: {
    fontSize: 13,
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
