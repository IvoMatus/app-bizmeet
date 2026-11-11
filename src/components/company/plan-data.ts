import type { PlanCatalogEntry } from '@/utils/api';

export type CheckoutSession = { url: string };

/**
 * Mock de la creación de la Checkout Session de Stripe. El backend YA tiene
 * `POST /companies/:companyId/billing/checkout` real (Sprint 3) — sigue bloqueado por decisión
 * de producto hasta esa etapa, así que esta pantalla sigue usando el mock a propósito.
 *
 * TODO(backend, bloqueado a Sprint 3): reemplazar por
 *   POST /companies/:companyId/billing/checkout { plan }
 *   headers: { Authorization: `Bearer ${token}` }
 * devolviendo `{ url }` de la Checkout Session real.
 */
export async function createMockCheckoutSession(companyId: string, planCode: PlanCatalogEntry['code']): Promise<CheckoutSession> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const params = new URLSearchParams({ companyId, planCode });
  return { url: `https://checkout.stripe.com/mock?${params.toString()}` };
}
