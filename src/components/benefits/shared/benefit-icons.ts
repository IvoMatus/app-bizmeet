import type { SymbolViewProps } from 'expo-symbols';

type Icono = SymbolViewProps['name'];

/** Nombres libres que manda la API (`destacados[].icono`) o el mock de eventos → símbolo nativo. */
const ICONOS: Record<string, Icono> = {
  cloud: { ios: 'cloud.fill', android: 'cloud', web: 'cloud' },
  percent: { ios: 'percent', android: 'percent', web: 'percent' },
  headset: { ios: 'headphones', android: 'headset_mic', web: 'headset_mic' },
  catering: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  certificado: { ios: 'checkmark.seal.fill', android: 'workspace_premium', web: 'workspace_premium' },
  networking: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  grabacion: { ios: 'play.rectangle.fill', android: 'video_library', web: 'video_library' },
  seguridad: { ios: 'lock.shield.fill', android: 'shield', web: 'shield' },
};

/** Valor desconocido o ausente → estrella genérica. */
const POR_DEFECTO: Icono = { ios: 'star.fill', android: 'star', web: 'star' };

export function iconoBeneficio(nombre?: string): Icono {
  return (nombre && ICONOS[nombre]) || POR_DEFECTO;
}
