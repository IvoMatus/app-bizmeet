import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withStableCacheKey } from '@/utils/image';
import type { AdjuntoView } from '@/utils/api';

/** Miniatura de un adjunto. Imagen real vía `expo-image`; video sin librería de reproducción
 * instalada todavía, así que muestra un placeholder con ícono "play" — tocarlo abre el archivo
 * en el reproductor nativo/navegador vía `Linking` en vez de reproducirlo inline.
 * ponytail: sin expo-video, abrir afuera cubre el caso; sumar reproducción inline si se pide. */
function AttachmentThumb({ adjunto, size }: { adjunto: AdjuntoView; size: number }) {
  const theme = useTheme();

  if (adjunto.tipo === 'IMAGEN' && adjunto.url) {
    return (
      <Image
        source={withStableCacheKey({ uri: adjunto.url })}
        accessibilityLabel="Imagen adjunta a la publicación"
        style={[styles.thumb, { width: size, height: size, backgroundColor: theme.surfaceInset }]}
        contentFit="cover"
        onError={(event) => console.warn('[post][diag] <Image> no pudo cargar', adjunto.url, event.error)}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={adjunto.tipo === 'VIDEO' ? 'Reproducir video adjunto' : 'Adjunto'}
      disabled={!adjunto.url}
      onPress={() => adjunto.url && Linking.openURL(adjunto.url)}
      style={[styles.thumb, styles.placeholder, { width: size, height: size, backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <SymbolView
        tintColor={theme.textMuted}
        name={{
          ios: adjunto.tipo === 'VIDEO' ? 'play.fill' : 'photo',
          android: adjunto.tipo === 'VIDEO' ? 'play_arrow' : 'image',
          web: adjunto.tipo === 'VIDEO' ? 'play_arrow' : 'image',
        }}
        size={Math.round(size * 0.3)}
      />
    </Pressable>
  );
}

/**
 * Fila de adjuntos de una publicación (`GET /posts/feed` vista COMPLETA y `GET /posts/:id`).
 * RN-PUB-06: puede venir vacía en la vista SIN_DETALLE del perfil básico — se trata como caso
 * normal sin adjuntos, no como error.
 */
export function PostAttachments({ adjuntos, size = 80 }: { adjuntos: AdjuntoView[]; size?: number }) {
  if (adjuntos.length === 0) return null;
  return (
    <View style={styles.row}>
      {adjuntos.map((adjunto, index) => (
        <AttachmentThumb key={`${adjunto.key}-${index}`} adjunto={adjunto} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  thumb: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
