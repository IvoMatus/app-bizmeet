import type { CompanyPlanDetail } from '@/utils/api';

export type BillingCycle = 'MENSUAL' | 'ANUAL';

export type PlanOption = {
  type: CompanyPlanDetail['type'];
  label: string;
  description: string;
  priceMxnMonthly: number;
  features: string[];
};

/**
 * Catálogo de planes (mock) — el backend todavía no expone un endpoint de catálogo de
 * Products/Prices de Stripe (T2.3 se está desarrollando en paralelo). Precios y features son
 * placeholder, tomados de los límites ya visibles en `CompanyDetail.plan` (`/empresa/[id]`),
 * NO de un diseño de Figma confirmado — reemplazar por el catálogo real cuando exista
 * GET /billing/plans (o similar).
 */
export const PLAN_CATALOG: PlanOption[] = [
  {
    type: 'EMPRENDIMIENTO',
    label: 'Emprendimiento',
    description: 'Para empezar a conectar con el club de negocios.',
    priceMxnMonthly: 499,
    features: ['Chats limitados por mes', 'Publicaciones básicas en el muro'],
  },
  {
    type: 'EMPRESA',
    label: 'Empresa',
    description: 'Más cupos de chats, matches y publicaciones.',
    priceMxnMonthly: 999,
    features: ['Más chats y matches activos', 'Descuento en eventos'],
  },
  {
    type: 'PREMIUM',
    label: 'Premium',
    description: 'Todo lo del plan Empresa, sin límites de uso.',
    priceMxnMonthly: 1999,
    features: ['Chats y publicaciones ilimitadas', 'Mayor descuento en eventos'],
  },
];

/** ponytail: anual = 10 meses al precio mensual (2 meses gratis) — regla de negocio placeholder,
 * no confirmada por producto/Figma. Ajustar junto con el catálogo real de Stripe. */
export function priceForCycle(plan: PlanOption, cycle: BillingCycle): number {
  return cycle === 'ANUAL' ? plan.priceMxnMonthly * 10 : plan.priceMxnMonthly;
}

export type CheckoutSession = { url: string };

/**
 * Mock de la creación de la Checkout Session de Stripe. HOY no existe el endpoint real
 * (backend-dev lo está construyendo en paralelo: Product/Price + Checkout Session + webhook
 * de activación, RN-ACC-01 — el Customer de Stripe es la empresa, no el usuario).
 *
 * TODO(backend): reemplazar por
 *   POST /companies/:companyId/billing/checkout-session { planType, cycle }
 *   headers: { Authorization: `Bearer ${token}` }
 * devolviendo `{ url }` de la Checkout Session real.
 */
export async function createMockCheckoutSession(
  companyId: string,
  planType: PlanOption['type'],
  cycle: BillingCycle,
): Promise<CheckoutSession> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const params = new URLSearchParams({ companyId, planType, cycle });
  return { url: `https://checkout.stripe.com/mock?${params.toString()}` };
}
