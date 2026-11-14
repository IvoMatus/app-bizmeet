import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withStableCacheKey } from '@/utils/image';
import type { AdjuntoView } from '@/utils/api';

/**
 * Hero de media de la tarjeta del muro (Figma 2043:1778): solo el **primer** adjunto, a ancho
 * completo 16:9, con "+N" si hay más. La galería completa con swipe vive en el detalle
 * (`PostAttachmentGallery`) — no se reusa acá porque es un FlatList horizontal dentro del
 * FlatList del feed. Imagen vía `expo-image`; video sin librería de reproducción instalada, así
 * que muestra un placeholder "play" que abre el archivo afuera vía `Linking`.
 * ponytail: sin expo-video, abrir afuera cubre el caso; sumar reproducción inline si se pide.
 * RN-PUB-06: sin adjuntos (p.ej. vista SIN_DETALLE) no renderiza nada.
 */
export function PostMediaHero({ adjuntos }: { adjuntos: AdjuntoView[] }) {
  const theme = useTheme();
  const first = adjuntos[0];
  if (!first) return null;
  const extra = adjuntos.length - 1;

  return (
    <View style={[styles.hero, { backgroundColor: theme.surfaceInset }]}>
      {first.tipo === 'IMAGEN' && first.url ? (
        <Image
          source={withStableCacheKey({ uri: first.url })}
          accessibilityLabel="Imagen adjunta a la publicación"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          onError={(event) => console.warn('[post][diag] <Image> no pudo cargar', first.url, event.error)}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={first.tipo === 'VIDEO' ? 'Reproducir video adjunto' : 'Adjunto'}
          disabled={!first.url}
          onPress={() => first.url && Linking.openURL(first.url)}
          style={styles.placeholder}>
          <SymbolView
            tintColor={theme.textMuted}
            name={{
              ios: first.tipo === 'VIDEO' ? 'play.fill' : 'photo',
              android: first.tipo === 'VIDEO' ? 'play_arrow' : 'image',
              web: first.tipo === 'VIDEO' ? 'play_arrow' : 'image',
            }}
            size={36}
          />
        </Pressable>
      )}
      {extra > 0 && (
        <View style={[styles.moreBadge, { backgroundColor: theme.mediaScrim }]} accessibilityLabel={`${extra} adjuntos más`}>
          <ThemedText style={[styles.moreLabel, { color: theme.onMedia }]}>+{extra}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadge: {
    position: 'absolute',
    bottom: Spacing.two + Spacing.half,
    right: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
  moreLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
});
