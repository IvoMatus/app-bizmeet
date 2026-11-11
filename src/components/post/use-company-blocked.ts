import { useActiveCompany } from '@/hooks/use-active-company';

/**
 * `contexto.bloqueada` de `GET /companies/:id/context` — fuente real para "empresa bloqueada no
 * publica" en el FAB "Publicar" del Muro y en Crear Publicación.
 *
 * Antes este hook hacía su propio `fetch` independiente del mismo endpoint que ya pide
 * `ActiveCompanyProvider` (T2.5) para toda la app. Como `companyId` siempre es la empresa
 * activa en los dos lugares que usan este hook, el resultado eran dos `GET
 * /companies/:id/context` en paralelo al abrir Crear Publicación (el del Muro, que sigue
 * montado debajo, + el propio) — la carrera entre esas dos respuestas es la causa real del
 * "JSON Parse error: Unexpected end of input" visto en QA, no un bug de parseo en sí. La fija
 * leyendo del contexto ya cargado por el provider en vez de volver a pedirlo.
 */
export function useCompanyBlocked(companyId: string | undefined) {
  const { active, context, error, reload } = useActiveCompany();
  const matchesActive = !!companyId && active?.company.id === companyId;
  const blocked = matchesActive ? context?.contexto.bloqueada ?? null : null;

  return { blocked, error: matchesActive ? error : null, reload };
}
