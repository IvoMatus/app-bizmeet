import type { ImageSourcePropType } from 'react-native';

/**
 * Las URLs prefirmadas de DO Spaces llevan firma+fecha en el query string, así que cambian en
 * cada response del backend aunque el archivo sea el mismo — `expo-image` cachea por URL
 * completa por default, entonces cada refetch de perfil/feed vuelve a descargar la misma foto.
 * `cacheKey` es un campo del objeto `source` de `expo-image` (no un prop del `<Image>`) — esto
 * le agrega uno estable sacando el query string. Pasa cualquier otra fuente (p.ej. `require(...)`
 * locales) sin tocar.
 */
export function withStableCacheKey(source: ImageSourcePropType): ImageSourcePropType {
  if (typeof source === 'object' && source !== null && 'uri' in source && typeof source.uri === 'string') {
    // `cacheKey` existe en el tipo `ImageSource` de expo-image, no en el `ImageSourcePropType`
    // de React Native que ya usan estos componentes — el cast es solo para ese desfasaje de tipos.
    return { ...source, cacheKey: source.uri.split('?')[0] } as ImageSourcePropType;
  }
  return source;
}
