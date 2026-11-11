// TODO(backend): el registro de cobros (módulo de pagos) se está desarrollando en paralelo en
// api-bizmeet — no hay endpoint real todavía. Sustituir `MOCK_PAYMENTS`/`fetchCompanyPayments`
// por `GET /companies/:id/payments` (o el contrato que confirme backend-dev) cuando esté listo.

export type PaymentStatus = 'PAGADO' | 'PENDIENTE' | 'FALLIDO';

export type Payment = {
  id: string;
  fecha: string; // ISO
  concepto: string;
  montoMxn: number;
  estado: PaymentStatus;
  /** Folio/recibo fiscal, p. ej. "Folio SAT: BIZ-2024-88419X" (formato tomado del relevamiento
   * de Figma, nodo 2036:2 — confirmar el formato exacto cuando se pueda re-extraer el nodo). */
  folio: string;
  /** true = cobro de la empresa (plan, cupos, etc.); false = compra propia de una persona
   * dentro del contexto de esa empresa (p. ej. un upgrade individual). */
  companyWide: boolean;
};

export type PaymentsData = {
  payments: Payment[];
};

export const MOCK_PAYMENTS: PaymentsData = {
  payments: [
    {
      id: 'p1',
      fecha: '2024-11-01',
      concepto: 'Suscripción Plan Empresa — Noviembre',
      montoMxn: 2499,
      estado: 'PAGADO',
      folio: 'Folio SAT: BIZ-2024-88419X',
      companyWide: true,
    },
    {
      id: 'p2',
      fecha: '2024-10-01',
      concepto: 'Suscripción Plan Empresa — Octubre',
      montoMxn: 2499,
      estado: 'PAGADO',
      folio: 'Folio SAT: BIZ-2024-77302A',
      companyWide: true,
    },
    {
      id: 'p3',
      fecha: '2024-09-01',
      concepto: 'Cupo adicional de publicaciones',
      montoMxn: 399,
      estado: 'FALLIDO',
      folio: 'Folio SAT: BIZ-2024-65210B',
      companyWide: true,
    },
    {
      id: 'p4',
      fecha: '2024-11-05',
      concepto: 'Upgrade individual a Perfil PRO',
      montoMxn: 149,
      estado: 'PENDIENTE',
      folio: 'Folio SAT: BIZ-2024-90112C',
      companyWide: false,
    },
  ],
};

/** ponytail: mock sincrónico (igual que `MOCK_TEAM` en team-data.ts) — se reemplaza por el
 * fetch real cuando exista el endpoint; mientras tanto no hay forma de que falle. */
export function fetchCompanyPayments(_companyId: string): PaymentsData {
  return MOCK_PAYMENTS;
}

export function sortByDateDesc(payments: Payment[]): Payment[] {
  return [...payments].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function totalByStatus(payments: Payment[], estado: PaymentStatus): number {
  return payments.filter((p) => p.estado === estado).reduce((sum, p) => sum + p.montoMxn, 0);
}
