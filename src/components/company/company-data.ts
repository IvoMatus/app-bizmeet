import type { CompanyIconName } from '@/components/company/company-icons';
import type { MyCompany } from '@/utils/api';

export type Company = {
  id: string;
  name: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  planType: 'BASICO' | 'EMPRESA' | 'PREMIUM';
  verified: boolean;
  roleBadge: { label: string; icon: CompanyIconName };
  /** Solo el titular (rol ADMINISTRADOR) puede editar la empresa o gestionar su equipo. */
  isTitular: boolean;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
};

/** Mapea la respuesta real de GET /companies/mine a lo que `CompanyCard` necesita. */
export function toCompany({ company, rol }: MyCompany): Company {
  const isTitular = rol === 'ADMINISTRADOR';
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    tipo: company.tipo,
    planType: company.plan.type,
    verified: company.verified,
    roleBadge: isTitular ? { label: 'Titular · Admin', icon: 'titular-badge' } : { label: 'Invitado', icon: 'role-badge' },
    isTitular,
    estado: company.estado,
  };
}
