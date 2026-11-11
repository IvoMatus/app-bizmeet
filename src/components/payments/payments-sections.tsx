import { StyleSheet, View } from 'react-native';

import { SectionCard } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Payment, PaymentStatus } from '@/components/payments/payments-data';

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PAGADO: 'Pagado',
  PENDIENTE: 'Pendiente',
  FALLIDO: 'Fallido',
};

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

/** Badge de estado de pago. Paleta: `success` (pagado), `warning*` (pendiente), `error*` (fallido) —
 * mismos tokens de `theme.ts` que usa `StatusPill`, sin agregar una variante nueva al primitive
 * porque este es el único lugar que necesita "fallido". */
function PaymentStatusBadge({ estado }: { estado: PaymentStatus }) {
  const theme = useTheme();
  const palette = {
    PAGADO: { bg: theme.successSurface, border: theme.successBorder, fg: theme.success },
    PENDIENTE: { bg: theme.warningSoft, border: theme.warningBorder, fg: theme.warningText },
    FALLIDO: { bg: theme.errorSoft, border: theme.errorBorder, fg: theme.error },
  }[estado];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <ThemedText type="small" style={[styles.badgeLabel, { color: palette.fg }]}>
        {STATUS_LABEL[estado]}
      </ThemedText>
    </View>
  );
}

/** Resumen de facturación arriba del listado (Figma 2036:2: "datos fiscales" + totales).
 * ponytail: el MCP de Figma llegó al rate limit a mitad del relevamiento de este nodo — layout
 * y colores exactos pendientes de re-extraer; por ahora usa `SectionCard` genérico + tokens de
 * `theme.ts`, sin inventar textos fiscales que el Figma no confirmó. */
export function BillingSummaryCard({
  companyName,
  rfc,
  totalPagado,
  totalPendiente,
}: {
  companyName: string;
  rfc: string;
  totalPagado: number;
  totalPendiente: number;
}) {
  return (
    <SectionCard eyebrow="DATOS FISCALES" title={companyName}>
      <ThemedText type="small" themeColor="textMuted">
        RFC {rfc}
      </ThemedText>
      <View style={styles.summaryRow}>
        <SummaryStat label="Pagado a la fecha" value={currency.format(totalPagado)} color="success" />
        <SummaryStat label="Pendiente" value={currency.format(totalPendiente)} color="warningText" />
      </View>
    </SectionCard>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string; color: 'success' | 'warningText' }) {
  return (
    <View style={styles.summaryStat}>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" themeColor={color}>
        {value}
      </ThemedText>
    </View>
  );
}

/** Tarjeta de transacción: fecha, concepto, monto, estado y folio/recibo. */
export function PaymentCard({ payment }: { payment: Payment }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
      accessible
      accessibilityLabel={`${payment.concepto}, ${currency.format(payment.montoMxn)}, estado ${STATUS_LABEL[payment.estado]}, ${payment.folio}`}>
      <View style={styles.headerRow}>
        <View style={styles.flex1}>
          <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={2}>
            {payment.concepto}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {dateFormatter.format(new Date(payment.fecha))}
          </ThemedText>
        </View>
        <PaymentStatusBadge estado={payment.estado} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

      <View style={styles.footerRow}>
        <ThemedText type="small" themeColor="textMuted" numberOfLines={1} style={styles.flex1}>
          {payment.folio}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="textPrimary">
          {currency.format(payment.montoMxn)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  divider: { height: 1 },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeLabel: { fontSize: 11, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: Spacing.four },
  summaryStat: { gap: Spacing.half },
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  headerRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
