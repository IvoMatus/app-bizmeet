import type { CompanyInvitationView, MiembroView, RolEmpresa } from '@/utils/api';

/** Roles reales de empresa (ver `api.ts`/`permission-engine.ts`). El Figma original mockeaba
 * roles de negocio (Comercial/Operativo/Financiero/Observador) que el backend no tiene. */
export type RoleOption = { label: string; value: RolEmpresa };

export const ROLE_OPTIONS: RoleOption[] = [
  { label: 'Administrador', value: 'ADMINISTRADOR' },
  { label: 'Invitado (colaborador)', value: 'INVITADO' },
];

export const ROLE_LABEL: Record<RolEmpresa, string> = {
  ADMINISTRADOR: 'Administrador',
  INVITADO: 'Invitado',
};

/** ponytail: catálogo estático de cupos por plan — no hay endpoint que lo exponga hoy, solo se
 * infiere indirectamente al tope del 409 en POST invitations. Mismos valores que
 * `plan-catalog.ts` en api-bizmeet; actualizar ambos si cambia la matriz de planes. */
const MAX_CONTACTS_BY_PLAN: Record<string, number> = {
  EMPRENDIMIENTO: 3,
  EMPRESA: 5,
  PREMIUM: 10,
};

export function maxContactsForPlan(planCode: string | null | undefined): number {
  return (planCode ? MAX_CONTACTS_BY_PLAN[planCode] : undefined) ?? 0;
}

export type Owner = {
  name: string;
  title: string;
};

export type ConfirmedMember = {
  id: string;
  status: 'confirmed';
  name: string;
  role: string;
};

export type PendingMember = {
  id: string;
  status: 'pending';
  email: string;
  role: string;
};

export type TeamMember = ConfirmedMember | PendingMember;

export type TeamQuota = {
  planLabel: string;
  totalSlots: number;
};

export type TeamData = {
  companyName: string;
  quota: TeamQuota;
  /** null si todavía no hay ningún Administrador identificable (no debería pasar en la práctica). */
  owner: Owner | null;
  members: TeamMember[];
};

/** Arma el `TeamData` de la pantalla a partir de miembros activos + invitaciones vigentes
 * (GET /companies/:id/members y GET /companies/:id/invitations). El backend no distingue un
 * "Titular" dedicado: se toma el primer Administrador como referencia. Tampoco expone `email`
 * de los miembros activos — se omite en vez de inventarlo. */
export function buildTeamData(
  companyName: string,
  planCode: string | null | undefined,
  planLabel: string,
  miembros: MiembroView[],
  invitaciones: CompanyInvitationView[],
): TeamData {
  const admins = miembros.filter((m) => m.rol === 'ADMINISTRADOR');
  const owner: Owner | null = admins[0] ? { name: admins[0].nombre ?? admins[0].userId, title: ROLE_LABEL.ADMINISTRADOR } : null;

  const confirmed: ConfirmedMember[] = miembros
    .filter((m) => !owner || m.userId !== admins[0]?.userId)
    .map((m) => ({ id: m.userId, status: 'confirmed', name: m.nombre ?? 'Sin nombre registrado', role: ROLE_LABEL[m.rol] }));

  const pending: PendingMember[] = invitaciones
    .filter((i) => i.estado === 'PENDIENTE')
    .map((i) => ({ id: i.id, status: 'pending', email: i.correo, role: ROLE_LABEL[i.rol] }));

  return {
    companyName,
    quota: { planLabel, totalSlots: maxContactsForPlan(planCode) },
    owner,
    members: [...confirmed, ...pending],
  };
}

export function activeCount(members: TeamMember[]) {
  return members.filter((m) => m.status === 'confirmed').length;
}

export function pendingCount(members: TeamMember[]) {
  return members.filter((m) => m.status === 'pending').length;
}
