import { TabStack } from '@/components/navigation/tab-stack';

// Deep link en frío a una hija (ej. el regreso de Stripe a /empresa/billing-return): Mis Empresas
// queda debajo para poder volver.
export const unstable_settings = { anchor: 'company' };

export default function CompanyLayout() {
  return <TabStack root="company" title="Mis Empresas" />;
}
