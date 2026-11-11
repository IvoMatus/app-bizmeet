import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import type { PostAttachment } from '@/components/post/use-post-attachments';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Una miniatura de la fila de adjuntos (Figma "Thumbnails Strip", 2043:1204): estados
 * uploading/done/error, badge "Principal" en la primera, botón eliminar. */
export function AttachmentThumbnail({
  attachment,
  isMain,
  onRemove,
  onRetry,
}: {
  attachment: PostAttachment;
  isMain: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const theme = useTheme();
  const overlayBg = theme.screenBackground + 'CC'; // ~80% opacidad, confirmado en el brief.

  return (
    <View style={styles.slot}>
      <Image source={{ uri: attachment.uri }} style={styles.image} />

      {attachment.status === 'uploading' && (
        <View style={[styles.image, styles.overlay, { backgroundColor: overlayBg }]}>
          <ActivityIndicator color={theme.accent} accessibilityLabel="Subiendo foto" />
        </View>
      )}

      {attachment.status === 'error' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar subir foto"
          accessibilityHint={attachment.error}
          onPress={onRetry}
          style={[styles.image, styles.overlay, { backgroundColor: overlayBg }]}>
          <SymbolView tintColor={theme.error} name={{ ios: 'exclamationmark.triangle', android: 'error', web: 'error' }} size={20} />
          <ThemedText type="small" style={{ color: theme.error }}>
            Reintentar
          </ThemedText>
        </Pressable>
      )}

      {isMain && attachment.status === 'done' && (
        <View style={[styles.mainBadge, { backgroundColor: theme.accent }]}>
          <ThemedText type="small" style={{ color: theme.screenBackground, fontSize: 10 }}>
            Principal
          </ThemedText>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eliminar foto"
        onPress={onRemove}
        hitSlop={12}
        style={[styles.removeButton, { backgroundColor: theme.error }]}>
        <SymbolView tintColor="#fff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={12} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Spacing.two,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
