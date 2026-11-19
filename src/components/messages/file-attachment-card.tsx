import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AdjuntoMensaje } from '@/utils/api';

const sizeFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });

/** "PDF · 2.4 MB": extensión del nombre (o subtipo del MIME) + tamaño. */
export function fileMeta({ nombre, contentType, bytes }: Pick<AdjuntoMensaje, 'nombre' | 'contentType' | 'bytes'>): string {
  const ext = (nombre?.includes('.') ? nombre.split('.').pop() : contentType.split('/').pop()) ?? '';
  const size = bytes >= 1024 * 1024 ? `${sizeFormatter.format(bytes / (1024 * 1024))} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${ext.toUpperCase()} · ${size}`;
}

type FileAttachmentCardProps = {
  file: Pick<AdjuntoMensaje, 'nombre' | 'contentType' | 'bytes'>;
  /** En un mensaje: botón descargar. */
  onDownload?: () => void;
  /** Pendiente de envío (dock): quitar, estado de subida y reintento. */
  onRemove?: () => void;
  uploading?: boolean;
  error?: string;
  onRetry?: () => void;
};

/** Documento adjunto (Figma 284x64): ícono 40 + nombre + "PDF · 2.4 MB" + acción a la derecha. */
export function FileAttachmentCard({ file, onDownload, onRemove, uploading, error, onRetry }: FileAttachmentCardProps) {
  const theme = useTheme();
  const name = file.nombre ?? 'Documento';

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <Pressable
        accessibilityRole={error ? 'button' : undefined}
        accessibilityLabel={error ? `Reintentar subir ${name}` : `${name}, ${fileMeta(file)}`}
        accessibilityHint={error}
        disabled={!error}
        onPress={onRetry}
        style={styles.main}>
        <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
          <SymbolView tintColor={theme.accentText} name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={20} />
        </View>
        <View style={styles.text}>
          <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.textPrimary }}>
            {name}
          </ThemedText>
          <ThemedText numberOfLines={1} style={[styles.meta, { color: error ? theme.error : theme.textMuted }]}>
            {error ? `${error} Toca para reintentar.` : uploading ? 'Subiendo…' : fileMeta(file)}
          </ThemedText>
        </View>
      </Pressable>
      {uploading ? (
        <ActivityIndicator color={theme.accent} style={styles.action} />
      ) : onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Quitar ${name}`} onPress={onRemove} style={styles.action}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
        </Pressable>
      ) : onDownload ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Descargar ${name}`} onPress={onDownload} style={styles.action}>
          <SymbolView tintColor={theme.accentText} name={{ ios: 'arrow.down.circle', android: 'download', web: 'download' }} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 284,
    maxWidth: '100%',
    minHeight: 64,
    paddingLeft: Spacing.two + Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    minWidth: 0,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  // 44 de área táctil.
  action: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
