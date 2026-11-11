import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { fetchCompanyContext, fetchMyCompanies, type CompanyContext, type MyCompany } from '@/utils/api';

type ActiveCompanyState = {
  /** Empresas del usuario (GET /companies/mine). `null` mientras carga. */
  companies: MyCompany[] | null;
  /** Empresa activa. `undefined` = cargando, `null` = el usuario no tiene empresas. */
  active: MyCompany | null | undefined;
  /** GET /companies/:id/context de la empresa activa — menú y permisos según tipo/plan/rol/derechos. */
  context: CompanyContext | null;
  /** `active.company.estado === 'PENDIENTE_PAGO'` — atajo para que el resto de la app no lea
   * ese campo a mano. No confundir con `context.contexto.bloqueada` (otra cosa). */
  pendingPayment: boolean;
  error: string | null;
  setActiveCompanyId: (id: string) => void;
  reload: () => void;
};

const ActiveCompanyContext = createContext<ActiveCompanyState | null>(null);

/**
 * Empresa activa compartida por toda la app (T2.5). Carga `GET /companies/mine` una sola vez,
 * deja elegir cuál queda activa (por defecto la primera membership) y vuelve a pedir
 * `GET /companies/:id/context` cada vez que cambia, para que el resto de la app recalcule menú
 * y permisos (tipo, plan, rol, derechos) a partir de esa empresa.
 *
 * ponytail: la elección no persiste entre reinicios de la app (vuelve a la primera empresa al
 * reabrir) — agregar expo-secure-store si el usuario pide recordarla entre sesiones.
 */
export function ActiveCompanyProvider({ children }: { children: ReactNode }) {
  const getToken = useAuthToken();
  const [companies, setCompanies] = useState<MyCompany[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [context, setContext] = useState<CompanyContext | null>(null);
  // Para qué empresa vale `context` — si no coincide con `activeId` todavía no llegó la
  // respuesta nueva; evita exponer el contexto de la empresa anterior mientras carga la nueva,
  // sin necesitar un setContext(null) síncrono dentro del efecto (lint react-hooks/set-state-in-effect).
  const [contextCompanyId, setContextCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchMyCompanies(token);
      })
      .then((mine) => {
        setCompanies(mine);
        setError(null);
        setActiveId((current) => (current && mine.some((m) => m.company.id === current) ? current : mine[0]?.company.id ?? null));
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken]);

  useEffect(load, [load]);

  // Recalcula menú/permisos (contexto) cada vez que cambia la empresa activa.
  useEffect(() => {
    if (!activeId) return;
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchCompanyContext(activeId, token);
      })
      .then((next) => {
        setContext(next);
        setContextCompanyId(activeId);
      })
      .catch((e: Error) => setError(e.message));
  }, [activeId, getToken]);

  const active = companies === null ? undefined : companies.find((m) => m.company.id === activeId) ?? null;
  // Mientras llega el context de la nueva empresa activa, no exponer el de la anterior.
  const safeContext = contextCompanyId === activeId ? context : null;

  const pendingPayment = active?.company.estado === 'PENDIENTE_PAGO';

  return (
    <ActiveCompanyContext.Provider
      value={{ companies, active, context: safeContext, pendingPayment, error, setActiveCompanyId: setActiveId, reload: load }}>
      {children}
    </ActiveCompanyContext.Provider>
  );
}

export function useActiveCompany() {
  const ctx = useContext(ActiveCompanyContext);
  if (!ctx) throw new Error('useActiveCompany debe usarse dentro de <ActiveCompanyProvider>.');
  return ctx;
}
