import { useAuth } from '@clerk/expo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { fetchUnreadNotificationsCount } from '@/utils/api';

type UnreadNotifications = { unread: number; setUnread: (unread: number) => void };

const UnreadNotificationsContext = createContext<UnreadNotifications>({ unread: 0, setUnread: () => {} });

/**
 * Badge de la campana (GET /notifications/unread-count), compartido por los topbars de Tabs y de
 * Perfil y por la vista Notificaciones, que lo actualiza con la respuesta de POST /notifications/read.
 * ponytail: se pide al iniciar sesión y al abrir Notificaciones; no hace polling ni push. Si hace
 * falta que se actualice solo, refrescar al volver la app a primer plano (AppState).
 */
export function UnreadNotificationsProvider({ children }: { children: ReactNode }) {
  const getToken = useAuthToken();
  const { userId } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;
    getToken()
      .then((token) => (token ? fetchUnreadNotificationsCount(token) : 0))
      .then(setUnread)
      .catch(() => {
        // Sin badge si falla: no bloquea nada.
      });
  }, [userId, getToken]);

  // Sin sesión no hay badge (evita mostrar el de la cuenta anterior hasta que llegue el nuevo).
  return (
    <UnreadNotificationsContext.Provider value={{ unread: userId ? unread : 0, setUnread }}>
      {children}
    </UnreadNotificationsContext.Provider>
  );
}

export function useUnreadNotifications() {
  return useContext(UnreadNotificationsContext);
}
