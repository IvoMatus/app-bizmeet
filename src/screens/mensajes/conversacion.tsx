import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatInputDock } from '@/components/messages/chat-input-dock';
import { ConversationAvatar } from '@/components/messages/conversation-avatar';
import { DateSeparator, differentDay, MessageBubble } from '@/components/messages/message-bubble';
import { personaLine, type ConversationParams } from '@/components/messages/messages-data';
import { PlanNotice } from '@/components/messages/quota-card';
import { useConversationMessages } from '@/components/messages/use-conversation-messages';
import { DetailHeader } from '@/components/navigation/detail-header';
import { StatusPill } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import { startConversation, type AdjuntoMensaje, type MensajeInput } from '@/utils/api';

const READ_ONLY = 'Tu empresa no puede enviar mensajes con su plan actual.';

/** showAlert como Promise: true = "Enviar". */
function confirmFirstMessage(saldo: string | undefined): Promise<boolean> {
  return new Promise((resolve) =>
    showAlert('Iniciar conversación', `Se usará 1 cupo de conversación.${saldo ? ` Te quedan ${saldo} este mes.` : ''}`, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Enviar', onPress: () => resolve(true) },
    ])
  );
}

/**
 * Conversación (Figma 2046:1408 claro / 2046:1552 oscuro). Vive en el Stack de Mensajes y en el de
 * Inicio ("Contactar" desde una publicación), re-exportada como empresa/plan. `id = nueva`: todavía
 * no hay conversación — el primer envío la crea (POST /conversations) y reemplaza la ruta.
 */
export default function ConversacionScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const params = useLocalSearchParams<ConversationParams>();
  const { active, context, reload } = useActiveCompany();
  const companyId = active?.company.id;
  const isNew = params.id === 'nueva';
  const { messages, leidoHasta, contraparte, error, hasOlder, loadOlder, send, isMine, retry, attachmentUrl } = useConversationMessages(
    isNew ? null : params.id,
    companyId
  );
  // Lo que respondió el backend al enviar: 409 (sin cupo) / 403 (solo lectura).
  const [noQuota, setNoQuota] = useState(false);
  const [forbidden, setForbidden] = useState<string | null>(null);

  // Cabecera: la nueva, con los datos del post (params); la existente, con la contraparte que trae
  // GET /conversations/:id/messages (logo/foto firmados: vencen a los 15 min).
  const header = isNew
    ? { empresa: params.empresa, verificada: params.verificada === '1', persona: params.persona, logo: null, foto: params.foto }
    : contraparte && {
        empresa: contraparte.empresa?.name ?? 'Empresa no disponible',
        verificada: !!contraparte.empresa?.verified,
        persona: personaLine(contraparte.nombre, contraparte.cargo),
        logo: contraparte.empresa?.logoUrl,
        foto: contraparte.fotoUrl,
      };
  const empresa = header?.empresa || 'Conversación';
  const readOnly = forbidden ?? (context?.derechos['receive-conversations']?.permitida === false ? READ_ONLY : null);
  const requiresQuota = isNew && params.requiereCupo === '1' && !noQuota;

  async function onSend(input: MensajeInput): Promise<boolean> {
    if (!companyId) return false;
    try {
      if (!isNew) {
        await send(input);
        return true;
      }
      if (requiresQuota && !(await confirmFirstMessage(params.saldo))) return false;
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      const result = await startConversation(companyId, { userId: params.destUserId ?? '', companyId: params.destCompanyId ?? '' }, input, token);
      if (result.cupoConsumido) reload();
      router.replace({ pathname: '/conversacion/[id]', params: { id: result.conversationId } });
      return true;
    } catch (e) {
      const { status, message } = e as Error & { status?: number };
      if (status === 409) setNoQuota(true);
      else if (status === 403 && !isNew) setForbidden(message);
      else showAlert('No se pudo enviar', message);
      return false;
    }
  }

  async function openAttachment(messageId: string, adjunto: AdjuntoMensaje) {
    try {
      await Linking.openURL((await attachmentUrl(messageId, adjunto.key)) ?? adjunto.url);
    } catch (e) {
      showAlert('No se pudo abrir el archivo', (e as Error).message);
    }
  }

  const notice = readOnly ? (
    <PlanNotice message={readOnly} planCta />
  ) : noQuota ? (
    <PlanNotice message="Sin cupos de conversación este mes." planCta />
  ) : requiresQuota && active ? (
    <PlanNotice
      message={`Al enviar el primer mensaje se usará 1 cupo de conversación de ${active.company.name}.${params.saldo ? ` Te quedan ${params.saldo} este mes.` : ''}`}
    />
  ) : null;

  // Lista invertida: el más nuevo abajo y anclado al llegar mensajes; "arriba" = historial.
  const data = [...(messages ?? [])].reverse();

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <DetailHeader title={empresa} />
        {header && (
          <View style={[styles.context, { borderBottomColor: theme.surfaceBorder }]}>
            <ConversationAvatar logoUrl={header.logo} fotoUrl={header.foto} size={40} />
            <View style={styles.contextText}>
              <View style={styles.contextName}>
                <ThemedText numberOfLines={1} style={[styles.company, { color: theme.textPrimary }]}>
                  {empresa}
                </ThemedText>
                {header.verificada && <StatusPill label="Verificada" variant="success" />}
              </View>
              {header.persona ? (
                <ThemedText numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>
                  {header.persona}
                </ThemedText>
              ) : null}
            </View>
          </View>
        )}

        {!isNew && error && messages === null ? (
          <Pressable onPress={retry} accessibilityRole="button" accessibilityLabel="Reintentar" style={styles.flex}>
            <ThemedText style={[styles.centered, { color: theme.textMuted }]}>{error} Toca para reintentar.</ThemedText>
          </Pressable>
        ) : !isNew && messages === null ? (
          <ActivityIndicator color={theme.accent} accessibilityLabel="Cargando mensajes" style={styles.flex} />
        ) : (
          <FlatList
            inverted
            data={data}
            keyExtractor={(m) => m.id}
            style={styles.flex}
            contentContainerStyle={styles.list}
            onEndReached={loadOlder}
            onEndReachedThreshold={0.3}
            ListFooterComponent={hasOlder ? <ActivityIndicator color={theme.accent} /> : null}
            renderItem={({ item, index }) => {
              const older = data[index + 1];
              const mine = isMine(item);
              return (
                <View style={styles.item}>
                  {(!older || differentDay(older.createdAt, item.createdAt)) && <DateSeparator iso={item.createdAt} />}
                  <MessageBubble
                    message={item}
                    mine={mine}
                    read={mine && leidoHasta !== null && item.id <= leidoHasta}
                    fotoUrl={header?.foto}
                    onDownload={(adjunto) => openAttachment(item.id, adjunto)}
                  />
                </View>
              );
            }}
          />
        )}

        {notice && <View style={styles.notices}>{notice}</View>}
        {companyId && <ChatInputDock companyId={companyId} disabled={!!readOnly || noQuota} onSend={onSend} />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingVertical: Spacing.two + Spacing.half,
    borderBottomWidth: 1,
  },
  contextText: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  contextName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  company: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  centered: {
    textAlign: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  list: {
    padding: Spacing.four - Spacing.one,
    gap: Spacing.three - Spacing.half,
  },
  item: {
    gap: Spacing.three - Spacing.half,
  },
  notices: {
    paddingHorizontal: Spacing.four - Spacing.one,
    paddingBottom: Spacing.two,
  },
});
