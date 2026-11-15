import { TabStack } from '@/components/navigation/tab-stack';

// Deep link en frío a una hija (ej. /publicacion/123): el Muro queda debajo para poder volver.
export const unstable_settings = { anchor: 'index' };

export default function HomeLayout() {
  return <TabStack root="index" title="Muro General" />;
}
