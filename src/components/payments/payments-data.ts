import { fetchCompanyPayments, type CobroView } from '@/utils/api';

export type PaymentStatus = 'PAGADO' | 'PENDIENTE' | 'FALLIDO';

export type Payment = {
  id: string;
  fecha: string; // ISO
  concepto: string;
  /** En unidades de `moneda` (no centavos). */
  monto: number;
  /** Código ISO en mayúsculas ("USD", "MXN"), listo para `Intl.NumberFormat`. */
  moneda: string;
  estado: PaymentStatus;
  /** Recibo de Stripe; null si la factura no lo trae. */
  reciboUrl: string | null;
  /** true = cobro de la empresa (plan, cupos, etc.); false = compra propia de una persona
   * dentro del contexto de esa empresa (p. ej. un upgrade individual). */
  companyWide: boolean;
};

function toPayment(c: CobroView): Payment {
  return {
    id: c.stripeInvoiceId,
    fecha: c.fecha,
    concepto: c.concepto,
    monto: c.montoCentavos / 100,
    moneda: c.moneda.toUpperCase(),
    estado: c.estado,
    reciboUrl: c.reciboUrl,
    companyWide: true,
  };
}

/**
 * Pagos de la vista: cobros reales de la empresa (GET /companies/:id/payments, solo si el rol
 * puede verlos — el backend responde 403 si no) + compras propias de la persona.
 *
 * ponytail: "Mis compras" (compras individuales, `companyWide: false`) no tiene endpoint todavía,
 * así que hoy solo vuelven los cobros de la empresa. Cuando backend-dev publique el contrato, se
 * suma aquí y la pantalla no cambia.
 */
export async function fetchPayments(companyId: string, token: string, canViewCompanyPayments: boolean): Promise<Payment[]> {
  if (!canViewCompanyPayments) return [];
  return (await fetchCompanyPayments(companyId, token)).map(toPayment);
}

export function sortByDateDesc(payments: Payment[]): Payment[] {
  return [...payments].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function totalByStatus(payments: Payment[], estado: PaymentStatus): number {
  return payments.filter((p) => p.estado === estado).reduce((sum, p) => sum + p.monto, 0);
}

/** Monto con su moneda real (los planes se cobran en USD). */
export function formatMonto(monto: number, moneda: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(monto);
}
