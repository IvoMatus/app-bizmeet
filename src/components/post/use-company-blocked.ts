import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';

import { fetchCompanyContext } from '@/utils/api';

/** `contexto.bloqueada` de GET /companies/:id/context — fuente real para "empresa bloqueada
 * no publica" en el FAB "Publicar" y en Crear Publicación. */
export function useCompanyBlocked(companyId: string | undefined) {
  const { getToken } = useAuth();
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!companyId) return;
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchCompanyContext(companyId, token);
      })
      .then((context) => {
        setBlocked(context.contexto.bloqueada);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [companyId, getToken]);

  useEffect(() => {
    if (companyId) load();
  }, [companyId, load]);

  return { blocked, error, reload: load };
}
