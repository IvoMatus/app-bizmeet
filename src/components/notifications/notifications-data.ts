// TODO(backend): mock — el feed de notificaciones in-app se desarrolla en paralelo en
// api-bizmeet. Reemplazar por GET /users/me/notifications cuando el contrato esté confirmado.
// Fase 2 (push/correo y sus settings) está fuera de alcance de esta pantalla — ver T2.5.

export type NotificationType = 'invitation' | 'payment' | 'team';

export type NotificationStatus = 'pending' | 'success' | 'error';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** ISO — se formatea con `timeAgo` (ver post-data.ts) en la card. */
  createdAt: string;
  read: boolean;
  status?: NotificationStatus;
  actionLabel?: string;
  actionRoute?: string;
};

// ponytail: copy en español B2B razonable; verificar texto exacto contra Figma 2046:558/2046:2
// cuando vuelva el cupo del MCP (rate limit agotado hoy).
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'invitation',
    title: 'Invitación corporativa',
    body: 'Fernanda Castro te invitó a unirte a Pacífico Logística S.A. como Contacto Comercial.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    status: 'pending',
    actionLabel: 'Ver invitación',
    actionRoute: '/perfil/invitaciones',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Pago confirmado',
    body: 'Tu plan Premium se renovó correctamente.',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: false,
    status: 'success',
    actionLabel: 'Ver pagos',
    actionRoute: '/empresa/pagos?companyId=c1',
  },
  {
    id: 'n3',
    type: 'team',
    title: 'Cambio de rol',
    body: 'Fuiste asignado como Director Financiero en Andes Capital SpA.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionLabel: 'Ver equipo',
    actionRoute: '/empresa/equipo?companyId=c1',
  },
  {
    id: 'n4',
    type: 'payment',
    title: 'Pago pendiente',
    body: 'Hay un pago pendiente de tu suscripción. Revísalo para evitar la suspensión del plan.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'pending',
    actionLabel: 'Ver pagos',
    actionRoute: '/empresa/pagos?companyId=c1',
  },
];

export function fetchNotifications(): AppNotification[] {
  return MOCK_NOTIFICATIONS;
}

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}
