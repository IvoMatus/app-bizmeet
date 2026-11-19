import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AvatarSlot } from '@/components/messages/conversation-avatar';
import { FileAttachmentCard, fileMeta } from '@/components/messages/file-attachment-card';
import { PostAttachmentGallery } from '@/components/post/post-attachment-gallery';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AdjuntoMensaje, MensajeView } from '@/utils/api';

const timeFormatter = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

const dayKey = (iso: string) => new Date(iso).toDateString();

/** ¿`a` y `b` caen en días distintos? (separador de fecha entre mensajes). */
export function differentDay(a: string, b: string): boolean {
  return dayKey(a) !== dayKey(b);
}

/** Pill centrada "Hoy" / "Ayer" / "12 nov". */
export function DateSeparator({ iso }: { iso: string }) {
  const theme = useTheme();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const label =
    dayKey(iso) === new Date().toDateString() ? 'Hoy' : dayKey(iso) === yesterday.toDateString() ? 'Ayer' : dayFormatter.format(new Date(iso));
  return (
    <View style={[styles.separator, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <ThemedText accessibilityRole="header" style={[styles.meta, { color: theme.textMuted }]}>
        {label}
      </ThemedText>
    </View>
  );
}

type MessageBubbleProps = {
  message: MensajeView;
  mine: boolean;
  /** Solo para los míos: la contraparte ya lo leyó (doble check). */
  read: boolean;
  /** Foto de la contraparte (avatar 28 de los recibidos). */
  fotoUrl?: string | null;
  /** Quién escribió los recibidos, para el lector de pantalla. */
  autorNombre?: string;
  onDownload: (adjunto: AdjuntoMensaje) => void;
};

/** Burbuja de mensaje (Figma 2046:1408 / 2046:1552): recibido a la izquierda con avatar, enviado a
 * la derecha en `accentSolid` con hora y check de leído. Imágenes en galería, documentos en
 * FileAttachmentCard. */
export function MessageBubble({ message, mine, read, fotoUrl, autorNombre, onDownload }: MessageBubbleProps) {
  const theme = useTheme();
  const images = message.adjuntos.filter((a) => a.tipo === 'IMAGEN').map((a) => ({ tipo: 'IMAGEN' as const, key: a.key, url: a.url }));
  const docs = message.adjuntos.filter((a) => a.tipo === 'DOCUMENTO');
  const time = timeFormatter.format(new Date(message.createdAt));
  const fg = mine ? theme.onButtonDark : theme.textPrimary;

  return (
    // Un solo elemento para el lector de pantalla (autor, texto, adjuntos, hora y leído juntos).
    // "Descargar" va como acción de accesibilidad: un padre `accessible` oculta el botón en iOS.
    <View
      accessible
      accessibilityLabel={[
        mine ? 'Tú' : autorNombre || 'Recibido',
        message.texto,
        images.length ? `${images.length} imagen${images.length === 1 ? '' : 'es'}` : null,
        ...docs.map((d) => `Documento ${d.nombre ?? ''}, ${fileMeta(d)}`),
        time,
        mine ? (read ? 'Leído' : 'Enviado') : null,
      ]
        .filter(Boolean)
        .join(', ')}
      accessibilityActions={docs.map((d) => ({ name: d.key, label: `Descargar ${d.nombre ?? 'documento'}` }))}
      onAccessibilityAction={({ nativeEvent }) => {
        const doc = docs.find((d) => d.key === nativeEvent.actionName);
        if (doc) onDownload(doc);
      }}
      style={[styles.row, mine && styles.rowMine]}>
      {!mine && <AvatarSlot uri={fotoUrl} size={28} icon="person" />}
      <View
        style={[
          styles.bubble,
          mine
            ? [styles.bubbleMine, { backgroundColor: theme.accentSolid }]
            : [styles.bubbleTheirs, { backgroundColor: theme.feedCard, borderColor: theme.surfaceBorder, shadowColor: theme.cardShadow }],
          message.adjuntos.length > 0 && { width: mine ? 287 : 265 },
        ]}>
        {images.length > 0 && <PostAttachmentGallery adjuntos={images} />}
        {docs.map((doc) => (
          <FileAttachmentCard key={doc.key} file={doc} onDownload={() => onDownload(doc)} />
        ))}
        {message.texto ? (
          <ThemedText type="body" style={{ color: fg }}>
            {message.texto}
          </ThemedText>
        ) : null}
        <View style={styles.footer}>
          <ThemedText style={[styles.meta, { color: mine ? theme.onButtonDark : theme.textMuted }]}>{time}</ThemedText>
          {mine && (
            <SymbolView
              tintColor={theme.onButtonDark}
              name={read ? { ios: 'checkmark.circle.fill', android: 'done_all', web: 'done_all' } : { ios: 'checkmark', android: 'done', web: 'done' }}
              size={14}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    padding: Spacing.three - Spacing.half,
    borderRadius: 16,
    gap: Spacing.two,
  },
  bubbleTheirs: {
    maxWidth: 265,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleMine: {
    maxWidth: 287,
    borderBottomRightRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.one,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  separator: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 9999,
    borderWidth: 1,
  },
});
