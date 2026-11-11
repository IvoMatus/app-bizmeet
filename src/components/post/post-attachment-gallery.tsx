import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, View, type LayoutChangeEvent, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withStableCacheKey } from '@/utils/image';
import type { AdjuntoView } from '@/utils/api';

/** Medido sobre el screenshot del usuario (MCP de Figma limitado por plan Starter): ~226x170 ≈ 4:3. */
const ASPECT_RATIO = 4 / 3;

function AttachmentSlide({ adjunto, index, total, width, height }: { adjunto: AdjuntoView; index: number; total: number; width: number; height: number }) {
  const theme = useTheme();

  if (adjunto.tipo === 'IMAGEN' && adjunto.url) {
    return (
      <Image
        source={withStableCacheKey({ uri: adjunto.url })}
        accessibilityLabel={`Imagen ${index + 1} de ${total} adjunta a la publicación`}
        style={[styles.slide, { width, height, backgroundColor: theme.surfaceInset }]}
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
      style={[styles.slide, styles.placeholder, { width, height, backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <SymbolView
        tintColor={theme.textMuted}
        name={{
          ios: adjunto.tipo === 'VIDEO' ? 'play.fill' : 'photo',
          android: adjunto.tipo === 'VIDEO' ? 'play_arrow' : 'image',
          web: adjunto.tipo === 'VIDEO' ? 'play_arrow' : 'image',
        }}
        size={36}
      />
    </Pressable>
  );
}

/**
 * Galería hero de adjuntos del Detalle de Publicación (ocupa el ancho de la card, a diferencia
 * de `PostAttachments`, que sigue siendo la miniatura en fila del feed). Diseño sacado a ojo del
 * screenshot del usuario — MCP de Figma limitado por plan Starter. FlatList horizontal con
 * paging nativo, sin dependencia nueva. El chip "Certificación…" del screenshot no se implementa:
 * la API no tiene ese dato. RN-PUB-06: sin adjuntos no renderiza nada (SIN_DETALLE viene vacío).
 */
export function PostAttachmentGallery({ adjuntos }: { adjuntos: AdjuntoView[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width > 0) setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
    },
    [width],
  );

  if (adjuntos.length === 0) return null;

  const height = width / ASPECT_RATIO;

  return (
    <View onLayout={onLayout} style={styles.container}>
      {width > 0 && (
        <FlatList
          data={adjuntos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height }}
          keyExtractor={(adjunto, i) => `${adjunto.key}-${i}`}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item, index: i }) => <AttachmentSlide adjunto={item} index={i} total={adjuntos.length} width={width} height={height} />}
        />
      )}
      {adjuntos.length > 1 && width > 0 && (
        <View style={[styles.counter, { backgroundColor: theme.screenBackground + 'CC' }]}>
          <SymbolView tintColor={theme.textPrimary} name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} size={12} />
          <ThemedText type="small" style={{ color: theme.textPrimary }}>
            {index + 1}/{adjuntos.length}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slide: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  counter: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 9999,
  },
});
