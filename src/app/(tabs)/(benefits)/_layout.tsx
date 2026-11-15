import { TabStack } from '@/components/navigation/tab-stack';

// Deep link en frío a un detalle (convenio/evento): Beneficios queda debajo para poder volver.
export const unstable_settings = { anchor: 'benefits' };

export default function BenefitsLayout() {
  return <TabStack root="benefits" title="Beneficios" />;
}
