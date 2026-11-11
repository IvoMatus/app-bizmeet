import { getClerkInstance } from '@clerk/expo';
import { useCallback } from 'react';

// ponytail: módulo, no estado de React — el cache, el in-flight y el contador de 401
// consecutivos deben compartirse entre los ~18 call-sites de la app (cada uno llama al hook,
// pero todos apuntan a la misma sesión singleton de Clerk) Y con `api.ts`, que es quien de
// verdad sabe si el backend aceptó el token o no. `getClerkInstance()` (export oficial de
// @clerk/expo para acceso fuera de React) es la forma de que ambos lados toquen la misma
// sesión sin pasarse callbacks.
//
// Historial de este bug (3 vueltas):
// 1. `getToken()` sin `skipCache` devuelve el JWT cacheado vencido como string válido (no null,
//    no throw) — nunca se detectaba como problema.
// 2. Forzar siempre `skipCache` arregló la ráfaga de 20 requests simultáneas (confirmado por
//    backend-dev), pero el token que devuelve el retry puede seguir siendo inválido del lado
//    del backend (`token-invalid`, no `token-expired`) — la sesión de Clerk en el dispositivo
//    puede estar genuinamente rota, no solo cacheada. Ahí ni retry ni cache ayudan.
// 3. Por eso `reportAuthOutcome` cierra el loop: lo llama `api.ts` con el status de CADA
//    response. Dos 401 reales consecutivos (no dos intentos de refresh — dos respuestas reales
//    del backend) fuerzan sign-out, en vez de reintentar para siempre con una sesión rota.
const TOKEN_TTL_MS = 30_000; // bien debajo de la vida del JWT de Clerk (~60s)
let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string | null> | null = null;
let consecutive401s = 0;

async function refreshToken(): Promise<string | null> {
  try {
    const token = await getClerkInstance().session?.getToken({ skipCache: true });
    if (!token) return null;
    cached = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  } catch (err) {
    if (__DEV__) console.warn('[auth][diag] getToken() reventó, se trata como sesión no disponible', err);
    return null;
  }
}

async function getAuthToken(): Promise<string | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  if (!inFlight) {
    inFlight = refreshToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Llamar con el `status` de cada response de la API (ver el wrapper de `fetch` en `api.ts`).
 * Invalida el cache ante cualquier 401 — el backend ya lo rechazó, no sirve reusarlo — y si
 * pasan dos 401 reales seguidos sin un 2xx en el medio, fuerza sign-out: en ese punto la sesión
 * está rota del lado del servidor, no es un problema de cache local.
 */
export function reportAuthOutcome(status: number) {
  if (status === 401) {
    cached = null;
    consecutive401s += 1;
    if (consecutive401s >= 2) {
      consecutive401s = 0;
      getClerkInstance().signOut();
    }
    return;
  }
  if (status >= 200 && status < 300) {
    consecutive401s = 0;
  }
}

export function useAuthToken() {
  return useCallback(() => getAuthToken(), []);
}
