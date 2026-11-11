import { useAuth } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { showAlert } from '@/components/ui/app-alert';
import { uploadPostMedia } from '@/utils/api';

export type AttachmentStatus = 'uploading' | 'done' | 'error';

export type PostAttachment = {
  uri: string;
  key: string | null;
  url?: string;
  status: AttachmentStatus;
  error?: string;
};

/**
 * Estado de los adjuntos de una publicación en progreso. A diferencia del `PhotoPicker`
 * original, un fallo de `POST /posts/media` (p.ej. 404 mientras no exista en backend-dev) NO
 * borra la foto de la UI — queda con `status: 'error'` para mostrar retry, en vez de desaparecer.
 */
export function usePostAttachments(companyId: string, max: number) {
  const { getToken } = useAuth();
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);

  const upload = useCallback(
    async (uri: string, mimeType: string) => {
      setAttachments((prev) => prev.map((a) => (a.uri === uri ? { ...a, status: 'uploading', error: undefined } : a)));
      try {
        const token = await getToken();
        if (!token) throw new Error('No se pudo obtener la sesión.');
        const adjunto = await uploadPostMedia(companyId, uri, mimeType, token);
        setAttachments((prev) =>
          prev.map((a) => (a.uri === uri ? { ...a, key: adjunto.key, url: adjunto.url, status: 'done' } : a))
        );
      } catch (e) {
        setAttachments((prev) =>
          prev.map((a) => (a.uri === uri ? { ...a, status: 'error', error: (e as Error).message } : a))
        );
      }
    },
    [companyId, getToken]
  );

  const add = useCallback(async () => {
    if (attachments.length >= max) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir imágenes a la publicación.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setAttachments((prev) => [...prev, { uri: asset.uri, key: null, status: 'uploading' }]);
    upload(asset.uri, asset.mimeType ?? 'image/jpeg');
  }, [attachments.length, max, upload]);

  const remove = useCallback((uri: string) => {
    setAttachments((prev) => prev.filter((a) => a.uri !== uri));
  }, []);

  const retry = useCallback(
    (uri: string) => {
      const attachment = attachments.find((a) => a.uri === uri);
      if (attachment) upload(attachment.uri, 'image/jpeg');
    },
    [attachments, upload]
  );

  return {
    attachments,
    add,
    remove,
    retry,
    uploading: attachments.some((a) => a.status === 'uploading'),
  };
}
