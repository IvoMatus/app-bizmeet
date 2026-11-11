// TODO(backend): mock — el módulo de roles e invitaciones se está desarrollando en paralelo
// en api-bizmeet. Reemplazar por GET /users/me/invitations y GET /users/me/companies cuando
// el contrato esté confirmado con backend.

export type PendingInvitation = {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  verified: boolean;
  proposedRole: string;
  invitedByName: string;
  invitedByRole: string;
  message: string;
  privileges: string[];
};

export type LinkedCompany = {
  id: string;
  companyName: string;
  kind: 'titular' | 'invitado';
  role: string;
  planLabel: string;
  invitedByName?: string;
};

export const MOCK_PENDING_INVITATIONS: PendingInvitation[] = [
  {
    id: 'inv1',
    companyName: 'Pacífico Logística S.A.',
    industry: 'Transporte y Logística',
    location: 'Valparaíso, Chile',
    verified: true,
    proposedRole: 'Contacto Comercial',
    invitedByName: 'Fernanda Castro',
    invitedByRole: 'Directora Comercial',
    message: 'Nos encantaría contar contigo como enlace comercial para coordinar las próximas negociaciones del club.',
    privileges: ['Ver oportunidades del muro', 'Contactar empresas del club', 'Representar a la empresa en reuniones'],
  },
];

export const MOCK_LINKED_COMPANIES: LinkedCompany[] = [
  { id: 'c1', companyName: 'Andes Capital SpA', kind: 'titular', role: 'Director General', planLabel: 'Empresa' },
  {
    id: 'c2',
    companyName: 'Nortec Minería Ltda.',
    kind: 'invitado',
    role: 'Contacto Financiero',
    planLabel: 'Premium',
    invitedByName: 'Mauricio Lira',
  },
];
