import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { FileAttachmentCard } from '@/components/messages/file-attachment-card';
import { AttachmentThumbnail } from '@/components/post/attachment-thumbnail';
import type { AttachmentStatus } from '@/components/post/use-post-attachments';
import { showAlert } from '@/components/ui/app-alert';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Spacing } from '@/constants/theme';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import { uploadConversationMedia, type MensajeInput } from '@/utils/api';

/** Mismos tipos y tope que valida POST /conversations/media (413/415 si no). */
export const MESSAGE_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];
const MAX_BYTES = 10 * 1024 * 1024;

type Picked = { uri: string; nombre: string | null; mimeType: string; bytes: number };
type Pending = Picked & { status: AttachmentStatus; adjunto?: NonNullable<MensajeInput['adjuntos']>[number]; error?: string };

type ChatInputDockProps = {
  companyId: string;
  disabled?: boolean;
  /** true = enviado (limpia el dock). Los errores los muestra quien llama. */
  onSend: (input: MensajeInput) => Promise<boolean>;
};

/**
 * Dock fijo de la conversación (Figma: 60 de alto, adjuntar 40 + input + enviar 40). Sube el
 * adjunto apenas se elige (mismos estados que AttachmentThumbnail) y lo manda sin `url`.
 * ponytail: un adjunto por mensaje (el backend acepta 5) — sumar una fila si producto lo pide.
 * El teclado lo resuelve el KeyboardAvoidingView global de _layout.tsx.
 */
export function ChatInputDock({ companyId, disabled, onSend }: ChatInputDockProps) {
  const theme = useTheme();
  const getToken = useAuthToken();
  const [text, setText] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [sending, setSending] = useState(false);

  async function upload(file: Picked) {
    setPending({ ...file, status: 'uploading' });
    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      const { tipo, key, nombre, bytes, contentType } = await uploadConversationMedia(companyId, file, token);
      const adjunto = { tipo, key, nombre, bytes, contentType };
      setPending((cur) => (cur?.uri === file.uri ? { ...file, status: 'done', adjunto } : cur));
    } catch (e) {
      setPending((cur) => (cur?.uri === file.uri ? { ...file, status: 'error', error: (e as Error).message } : cur));
    }
  }

  function accept(file: Picked) {
    if (!MESSAGE_ATTACHMENT_TYPES.includes(file.mimeType)) {
      showAlert('Formato no admitido', 'Puedes adjuntar imágenes JPG, PNG o WebP y documentos PDF, Word, Excel, PowerPoint, TXT o CSV.');
      return;
    }
    if (file.bytes > MAX_BYTES) {
      showAlert('Archivo demasiado grande', 'El archivo debe pesar 10 MB o menos.');
      return;
    }
    upload(file);
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para adjuntar imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    accept({ uri: asset.uri, nombre: asset.fileName ?? null, mimeType: asset.mimeType ?? 'image/jpeg', bytes: asset.fileSize ?? 0 });
  }

  async function pickDocument() {
    const picked = await File.pickFileAsync({ mimeTypes: MESSAGE_ATTACHMENT_TYPES });
    if (picked.canceled) return;
    const file = picked.result;
    accept({ uri: file.uri, nombre: file.name, mimeType: file.type, bytes: file.size });
  }

  const ready = pending === null || pending.status === 'done';
  const canSend = !disabled && !sending && ready && (text.trim().length > 0 || pending !== null);

  async function send() {
    if (!canSend) return;
    setSending(true);
    const ok = await onSend({ texto: text.trim() || undefined, adjuntos: pending?.adjunto ? [pending.adjunto] : undefined });
    setSending(false);
    if (ok) {
      setText('');
      setPending(null);
    }
  }

  return (
    <View style={[styles.dock, { backgroundColor: theme.feedCard, borderTopColor: theme.surfaceBorder }]}>
      {pending && (
        <View style={styles.pending}>
          {pending.mimeType.startsWith('image/') ? (
            <AttachmentThumbnail
              attachment={{ uri: pending.uri, key: pending.adjunto?.key ?? null, status: pending.status, error: pending.error }}
              isMain={false}
              onRemove={() => setPending(null)}
              onRetry={() => upload(pending)}
            />
          ) : (
            <FileAttachmentCard
              file={{ nombre: pending.nombre, contentType: pending.mimeType, bytes: pending.bytes }}
              uploading={pending.status === 'uploading'}
              error={pending.error}
              onRetry={() => upload(pending)}
              onRemove={() => setPending(null)}
            />
          )}
        </View>
      )}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adjuntar archivo"
          accessibilityState={{ disabled: !!disabled || pending !== null }}
          disabled={disabled || pending !== null}
          hitSlop={Spacing.one}
          onPress={() =>
            showAlert('Adjuntar', undefined, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Documento', onPress: pickDocument },
              { text: 'Imagen', onPress: pickImage },
            ])
          }
          style={[styles.round, { backgroundColor: theme.surfaceInset, opacity: disabled || pending ? 0.5 : 1 }]}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'paperclip', android: 'attach_file', web: 'attach_file' }} size={20} />
        </Pressable>
        <ThemedTextInput
          value={text}
          onChangeText={setText}
          editable={!disabled}
          multiline
          maxLength={4000}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Escribe un mensaje"
          style={[styles.input, { backgroundColor: theme.surfaceInset, color: theme.textPrimary }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          accessibilityState={{ disabled: !canSend, busy: sending }}
          disabled={!canSend}
          hitSlop={Spacing.one}
          onPress={send}
          style={[styles.round, { backgroundColor: theme.accent, opacity: canSend ? 1 : 0.5 }]}>
          {sending ? (
            <ActivityIndicator color={theme.screenBackground} />
          ) : (
            <SymbolView tintColor={theme.screenBackground} name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }} size={18} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingVertical: Spacing.two + Spacing.half,
    gap: Spacing.two,
  },
  pending: {
    // Deja lugar a la "x" de AttachmentThumbnail, que sobresale 6px arriba.
    paddingTop: Spacing.two,
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  // 40 visibles + hitSlop={Spacing.one} = 48 de área táctil.
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + Spacing.half,
    paddingBottom: Spacing.two + Spacing.half,
    fontSize: 14,
    lineHeight: 20,
  },
});
