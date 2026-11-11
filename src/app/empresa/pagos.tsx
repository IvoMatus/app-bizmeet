import { useAuth } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterHeader } from '@/components/register/register-header';
import { BillingSummaryCard, PaymentCard } from '@/components/payments/payments-sections';
import { fetchCompanyPayments, sortByDateDesc, totalByStatus, type Payment } from '@/components/payments/payments-data';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCompany, fetchMyCompanies, type CompanyDetail } from '@/utils/api';

type ScreenData = {
  company: CompanyDetail;
  payments: Payment[];
  /** TODO(backend): hoy no hay un permiso granular de "ver pagos de empresa" — se aproxima con
   * el rol de membership (`MyCompany.rol`, ver utils/api.ts). Cuando exista un permiso real
   * (p. ej. una entrada en `CompanyContext.derechos` o un campo dedicado), conectarlo acá. Este
   * mismo flag controla el toggle "Pagos de la empresa"/"Mis compras" de abajo — no agregar un
   * segundo mock paralelo cuando se conecte el endpoint. */
  canViewCompanyPayments: boolean;
};

type PaymentsViewMode = 'empresa' | 'mias';

const PAYMENTS_VIEW_OPTIONS: { value: PaymentsViewMode; label: string }[] = [
  { value: 'empresa', label: 'Pagos de la empresa' },
  { value: 'mias', label: 'Mis compras' },
];

/**
 * Vista Pagos — "Historial de Pagos de la Empresa" (Figma 2036:2). Recibe `id` de empresa por
 * query, igual que `/empresa/equipo`.
 *
 * ponytail: el MCP de Figma llegó al rate limit a mitad del relevamiento de este nodo — solo
 * hay descripción estructural de alto nivel (resumen de facturación arriba + listado
 * cronológico de pagos), sin colores/textos exactos. Re-extraer el nodo cuando el rate limit se
 * libere para el ajuste fino visual; por ahora se construye con los tokens de `theme.ts` y los
 * componentes ya existentes.
 */
export default function PagosScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const [data, setData] = useState<ScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PaymentsViewMode>('empresa');

  const load = useCallback(() => {
    if (!companyId) return;
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return Promise.all([fetchCompany(companyId, token), fetchMyCompanies(token)]);
      })
      .then(([company, mine]) => {
        const rol = mine.find((m) => m.company.id === companyId)?.rol;
        setData({
          company,
          payments: fetchCompanyPayments(companyId).payments,
          canViewCompanyPayments: rol === 'ADMINISTRADOR',
        });
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [companyId, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !data) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <RegisterHeader title="Historial de Pagos" onBack={() => router.back()} />
          <Pressable onPress={load} style={styles.center}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <RegisterHeader title="Historial de Pagos" onBack={() => router.back()} />
          <ActivityIndicator color={theme.accent} style={styles.loading} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  // RN-PAGOS: los pagos de empresa solo los ven roles con permiso de pago (hoy, el mock
  // `canViewCompanyPayments`); toda persona ve sus propias compras (`companyWide: false`) sin
  // importar el rol. Con permiso, el toggle "Pagos de la empresa"/"Mis compras" decide el modo;
  // sin permiso, se fuerza "Mis compras".
  const showCompanyWide = data.canViewCompanyPayments && mode === 'empresa';
  const visible = showCompanyWide ? data.payments : data.payments.filter((p) => !p.companyWide);
  const ordered = sortByDateDesc(visible);

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <RegisterHeader title="Historial de Pagos" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <BillingSummaryCard
            companyName={data.company.name}
            rfc={data.company.rfc}
            totalPagado={totalByStatus(visible, 'PAGADO')}
            totalPendiente={totalByStatus(visible, 'PENDIENTE')}
          />

          {data.canViewCompanyPayments ? (
            <SegmentedControl
              options={PAYMENTS_VIEW_OPTIONS}
              value={mode}
              onChange={setMode}
              accessibilityLabel="Alternar entre pagos de la empresa y mis compras"
            />
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              Tu rol no tiene permiso para ver los pagos de la empresa — solo se muestran tus compras propias.
            </ThemedText>
          )}

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
              LISTADO CRONOLÓGICO DE PAGOS
            </ThemedText>
          </View>

          {ordered.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
              Todavía no hay pagos registrados.
            </ThemedText>
          ) : (
            ordered.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  loading: { marginTop: Spacing.four },
  content: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', paddingVertical: Spacing.four },
});
