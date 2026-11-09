import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';

import { fetchRubros, type Rubro } from '@/utils/api';

// Cache en memoria compartida entre pantallas — el catálogo SCIAN (PA-10) es el mismo para
// todos, así que una sola pantalla lo pide y el resto lo reusa en vez de refetchear.
let cached: Rubro[] | null = null;
let pending: Promise<Rubro[]> | null = null;

function load(token: string): Promise<Rubro[]> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetchRubros(token)
      .then((rubros) => {
        cached = rubros;
        return rubros;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

/** Catálogo de rubros/sectores (PA-10): código + nombre, nunca texto libre. */
export function useRubrosCatalog() {
  const { getToken } = useAuth();
  const [rubros, setRubros] = useState<Rubro[] | null>(cached);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    cached = null;
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return load(token);
      })
      .then((next) => {
        setRubros(next);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken]);

  useEffect(() => {
    if (cached) return;
    reload();
  }, [reload]);

  return { rubros, error, reload };
}

/** Resuelve el nombre legible de un código — si el catálogo no cargó todavía, muestra el código. */
export function rubroNombre(rubros: Rubro[] | null, codigo: string): string {
  return rubros?.find((r) => r.codigo === codigo)?.nombre ?? codigo;
}
