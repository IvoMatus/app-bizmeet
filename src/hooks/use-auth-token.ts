import { useAuth } from '@clerk/expo';
import { useCallback } from 'react';

// ponytail: módulo, no estado de React — el cache y el in-flight deben compartirse entre los
// ~18 call-sites de la app (cada uno llama a su propio `useAuth()`, pero todos apuntan a la
// misma sesión singleton de Clerk). Confirmado con logs del backend: ráfagas de ~20 requests
// simultáneas llegaban con el MISMO JWT ya vencido — `getToken()` sin `skipCache` devuelve el
// token cacheado como truthy aunque esté vencido, así que nuestro primer intento (sin forzar
// skipCache) nunca detectaba el problema y jamás llegaba al retry. Solución: forzar siempre
// `skipCache: true` (nunca confiar en el cache interno del SDK) y cachear el resultado nosotros
// mismos por una ventana corta para no pegarle a la red en cada fetch de la app.
const TOKEN_TTL_MS = 30_000; // bien debajo de la vida del JWT de Clerk (~60s)
let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string | null> | null = null;

/**
 * Reemplazo de `useAuth().getToken()` en toda la app. Fuerza siempre un refresh contra el
 * Frontend API de Clerk (nunca confía en el cache interno del SDK, que demostró devolver JWTs
 * ya vencidos como si fueran válidos) y deduplica llamadas concurrentes para que una ráfaga de
 * componentes pidiendo token al mismo tiempo dispare un solo refresh de red, no veinte. Si el
 * refresh falla (sesión realmente expirada del lado de Clerk), cierra sesión para que el
 * `AuthGuard` de `_layout.tsx` redirija a `/welcome` en vez de dejar que el error crudo del SDK
 * llegue a la pantalla.
 */
export function useAuthToken() {
  const { getToken, signOut } = useAuth();

  return useCallback(async () => {
    if (cached && cached.expiresAt > Date.now()) return cached.token;
    if (inFlight) return inFlight;

    inFlight = (async () => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) {
          await signOut();
          return null;
        }
        cached = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
        return token;
      } catch {
        await signOut();
        return null;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }, [getToken, signOut]);
}
