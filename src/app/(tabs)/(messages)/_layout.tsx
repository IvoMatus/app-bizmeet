import { TabStack } from '@/components/navigation/tab-stack';

// Raíz `messages` y no `index`: `(home)/index` ya es `/`. Deep link en frío a una conversación
// (ej. un push) o "Contactar" desde Inicio sin haber abierto Mensajes: la bandeja queda debajo
// para poder volver.
export const unstable_settings = { anchor: 'messages' };

export default function MessagesLayout() {
  return <TabStack root="messages" title="Mensajes" />;
}
