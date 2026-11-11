import { useAuth } from '@clerk/expo';
import { useCallback } from 'react';

/**
 * Reemplazo de `useAuth().getToken()` en toda la app. El SDK de Clerk en RN a veces falla al
 * refrescar el JWT contra su Frontend API cuando el token cacheado expiró tras unos minutos de
 * inactividad o con la app en background — eso burbujea como un error crudo del SDK ("JSON Parse
 * error: Unexpected end of input", por una respuesta vacía del lado de Clerk, no de nuestra API)
 * en vez de devolver `null` prolijamente. Reintentamos una vez forzando `skipCache` y, si sigue
 * fallando, cerramos la sesión para que el `AuthGuard` de `_layout.tsx` redirija a `/welcome` en
 * vez de dejar que ese error crudo llegue a la pantalla.
 */
export function useAuthToken() {
  const { getToken, signOut } = useAuth();

  return useCallback(async () => {
    try {
      const token = await getToken();
      if (token) return token;
    } catch {
      // cae al retry con skipCache
    }
    try {
      return await getToken({ skipCache: true });
    } catch {
      await signOut();
      return null;
    }
  }, [getToken, signOut]);
}
