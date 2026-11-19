import { useAuth } from '@clerk/expo';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ConversationParams } from '@/components/messages/messages-data';
import { PlanNotice } from '@/components/messages/quota-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import { previewConversation, type PostView, type PreviewConversation } from '@/utils/api';

const NO_QUOTA = 'Sin cupos de conversación este mes.';

/**
 * "Contactar" al autor de una publicación (sin diseño en Figma). Oculto si el post es de la
 * empresa activa, del propio usuario o de una empresa que ya no existe (`empresa` null). Se habilita según GET /conversations/preview (no según
 * `derechos`: con saldo 0 igual se puede contactar a la 2ª/3ª persona de una empresa ya pagada);
 * se vuelve a pedir al tomar foco, así al volver de iniciarla abre la existente.
 */
export function ContactButton({ post }: { post: PostView }) {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { userId } = useAuth();
  const { active, context } = useActiveCompany();
  const companyId = active?.company.id;
  const empresa = post.empresa;
  const hidden = !companyId || !empresa || post.companyId === companyId || post.autor.userId === userId;
  const [preview, setPreview] = useState<PreviewConversation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (hidden) return;
      let cancelled = false;
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return previewConversation(companyId, { userId: post.autor.userId, companyId: post.companyId }, token);
        })
        .then((next) => {
          if (cancelled) return;
          setPreview(next);
          setError(null);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
      return () => {
        cancelled = true;
      };
    }, [hidden, companyId, post.autor.userId, post.companyId, getToken])
  );

  if (hidden) return null;

  const enabled = !!preview?.puedeIniciar && !error;
  const noQuota = !!preview && !preview.puedeIniciar;

  function onPress() {
    if (!preview || !empresa) return;
    const params: ConversationParams = preview.conversationId
      ? { id: preview.conversationId }
      : {
          id: 'nueva',
          // Cabecera de la conversación nueva: todavía no hay GET de mensajes que la traiga.
          empresa: empresa.name,
          verificada: empresa.verified ? '1' : '',
          persona: post.autor.nombre ?? '',
          foto: post.autor.fotoUrl ?? '',
          destUserId: post.autor.userId,
          destCompanyId: post.companyId,
          requiereCupo: preview.requiereCupo ? '1' : '',
          saldo: preview.saldo === null ? '' : String(preview.saldo),
        };
    router.push({ pathname: '/conversacion/[id]', params });
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Contactar a ${empresa.name}`}
        accessibilityHint={error ?? (noQuota ? NO_QUOTA : undefined)}
        accessibilityState={{ disabled: !enabled, busy: !preview && !error }}
        disabled={!enabled}
        hitSlop={Spacing.half}
        onPress={onPress}
        style={[styles.button, { borderColor: theme.accentText, opacity: enabled ? 1 : 0.5 }]}>
        <SymbolView tintColor={theme.accentText} name={{ ios: 'bubble.left', android: 'chat_bubble_outline', web: 'chat_bubble' }} size={18} />
        <ThemedText type="smallBold" style={{ color: theme.accentText }}>
          Contactar
        </ThemedText>
      </Pressable>
      {error ? (
        // 403 del preview: plan sin el derecho → CTA de plan; fuera de red / destinatario no recibe → solo el mensaje.
        <PlanNotice message={error} planCta={context?.derechos['start-conversation']?.motivo === 'PLAN'} />
      ) : noQuota ? (
        <PlanNotice message={NO_QUOTA} planCta />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1.5,
  },
});
