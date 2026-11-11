import type { MyCompany, MyInvitationView, RolEmpresa } from '@/utils/api';

/** Invitación pendiente recibida por el usuario (GET /invitations/mine). El mock original del
 * Figma traía industry/location/verified/invitedByName/invitedByRole/message/privileges — nada
 * de eso existe en el backend hoy, así que la card quedó con los campos reales. */
export type PendingInvitation = {
  id: string;
  companyName: string;
  proposedRole: RolEmpresa;
  venceEn: string;
};

export function toPendingInvitation(v: MyInvitationView): PendingInvitation {
  return { id: v.id, companyName: v.companyName ?? 'Empresa', proposedRole: v.rol, venceEn: v.venceEn };
}

/** Empresa a la que el usuario está vinculado (GET /companies/mine). Sin `invitedByName` —
 * tampoco existe en el backend. */
export type LinkedCompany = {
  id: string;
  companyName: string;
  kind: 'titular' | 'invitado';
  role: RolEmpresa;
  planLabel: string;
};

export function toLinkedCompany(v: MyCompany): LinkedCompany {
  return {
    id: v.company.id,
    companyName: v.company.name,
    kind: v.rol === 'ADMINISTRADOR' ? 'titular' : 'invitado',
    role: v.rol,
    // `company.plan` es el código del plan en texto plano (confirmado con backend-dev).
    planLabel: v.company.plan as unknown as string,
  };
}
