// TODO(backend): el módulo de roles e invitaciones está en desarrollo en paralelo en
// api-bizmeet — confirmar contrato con el equipo de backend antes de reemplazar estos
// mocks por un fetch real (GET /companies/:id/team, POST /companies/:id/invitations, etc.).

export type RoleOption = { label: string; value: string };

export const ROLE_OPTIONS: RoleOption[] = [
  { label: 'Contacto Comercial (Ventas y Negociación)', value: 'COMERCIAL' },
  { label: 'Contacto Operativo (Logística y Soporte)', value: 'OPERATIVO' },
  { label: 'Contacto Financiero (Pagos y Facturación)', value: 'FINANCIERO' },
  { label: 'Observador (Solo lectura)', value: 'OBSERVADOR' },
];

export type Owner = {
  name: string;
  title: string;
  email: string;
  phoneVerified: boolean;
};

export type ConfirmedMember = {
  id: string;
  status: 'confirmed';
  name: string;
  role: string;
  email: string;
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
  owner: Owner;
  members: TeamMember[];
};

export const MOCK_TEAM: TeamData = {
  companyName: 'Andes Capital SpA',
  quota: { planLabel: 'Empresa', totalSlots: 8 },
  owner: {
    name: 'Rodrigo Fuentes',
    title: 'Director General',
    email: 'rodrigo.fuentes@andescapital.cl',
    phoneVerified: true,
  },
  members: [
    { id: 'm1', status: 'confirmed', name: 'Camila Rojas', role: 'Contacto Comercial', email: 'camila.rojas@andescapital.cl' },
    { id: 'm2', status: 'confirmed', name: 'Diego Araya', role: 'Contacto Financiero', email: 'diego.araya@andescapital.cl' },
    { id: 'm3', status: 'pending', email: 'pendiente@andescapital.cl', role: 'Contacto Operativo' },
  ],
};

export function activeCount(members: TeamMember[]) {
  return members.filter((m) => m.status === 'confirmed').length;
}

export function pendingCount(members: TeamMember[]) {
  return members.filter((m) => m.status === 'pending').length;
}
