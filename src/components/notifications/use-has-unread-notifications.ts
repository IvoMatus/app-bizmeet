import { useEffect, useState } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { fetchNotifications } from '@/utils/api';

/**
 * ¿Hay notificaciones sin leer? (punto del ícono de campana en el topbar).
 *
 * ponytail: el backend no tiene contador (GET /notifications solo pagina), así que se aproxima
 * con la primera página: si hay no leídas más viejas que eso, el punto no aparece. Cuando
 * backend-dev publique el contador, se cambia esta función y nada más.
 */
export async function fetchHasUnreadNotifications(token: string): Promise<boolean> {
  const page = await fetchNotifications(token, { limit: 20 });
  return page.items.some((n) => !n.read);
}

/** Se pide al montar el topbar; si falla, el punto queda apagado (no bloquea nada). */
export function useHasUnreadNotifications(): boolean {
  const getToken = useAuthToken();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    getToken()
      .then((token) => (token ? fetchHasUnreadNotifications(token) : false))
      .then(setHasUnread)
      .catch(() => setHasUnread(false));
  }, [getToken]);

  return hasUnread;
}
