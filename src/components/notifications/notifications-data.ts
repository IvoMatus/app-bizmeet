import type { NotificationItemStatus, NotificationItemType, NotificationItemView } from '@/utils/api';

export type NotificationType = NotificationItemType;
export type NotificationStatus = NotificationItemStatus;

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

/**
 * `GET /notifications` no manda `actionLabel`/`actionRoute` a propósito (el backend no se
 * acopla a la navegación del front) — se arman acá a partir de `type`/`companyId`/`invitationId`.
 * `team` queda sin acción: es informativo, no hay pantalla de detalle de un cambio de rol puntual.
 */
function actionFor(item: NotificationItemView): { actionLabel?: string; actionRoute?: string } {
  switch (item.type) {
    case 'invitation':
      return { actionLabel: 'Ver invitación', actionRoute: '/perfil/invitaciones' };
    case 'payment':
      return { actionLabel: 'Ver pagos', actionRoute: `/empresa/pagos?companyId=${item.companyId}` };
    case 'team':
      return {};
  }
}

export function toAppNotification(item: NotificationItemView): AppNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    createdAt: item.createdAt,
    read: item.read,
    status: item.status,
    ...actionFor(item),
  };
}

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}
