import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { withStableCacheKey } from '@/utils/image';

/** Imagen redonda o, sin URL, el ícono en `surfaceInset` (también el avatar de 28 de las burbujas). */
export function AvatarSlot({ uri, size, icon }: { uri: string | null | undefined; size: number; icon: 'company' | 'person' }) {
  const theme = useTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={withStableCacheKey({ uri })} style={[shape, { backgroundColor: theme.surfaceInset }]} contentFit="cover" />;
  return (
    <View style={[shape, styles.fallback, { backgroundColor: theme.surfaceInset }]}>
      <SymbolView
        tintColor={theme.textMuted}
        name={icon === 'company' ? { ios: 'building.2', android: 'business', web: 'business' } : { ios: 'person.fill', android: 'person', web: 'person' }}
        size={size / 2}
      />
    </View>
  );
}

/**
 * Logo de la empresa + avatar de la persona superpuesto abajo a la derecha (Figma: 48 + 24 en
 * (28,28) en la bandeja, 40 + 20 en la cabecera de la conversación). Decorativo: el nombre ya lo
 * lee la fila/cabecera que lo contiene.
 */
export function ConversationAvatar({ logoUrl, fotoUrl, size = 48 }: { logoUrl?: string | null; fotoUrl?: string | null; size?: number }) {
  const theme = useTheme();
  const small = size / 2;
  const offset = size - small + 4;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: offset + small, height: offset + small }}>
      <AvatarSlot uri={logoUrl} size={size} icon="company" />
      <View style={[styles.person, { top: offset, left: offset, borderRadius: small / 2 + 2, backgroundColor: theme.feedCard }]}>
        <AvatarSlot uri={fotoUrl} size={small} icon="person" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  person: {
    position: 'absolute',
    padding: 2,
    marginTop: -2,
    marginLeft: -2,
  },
});
