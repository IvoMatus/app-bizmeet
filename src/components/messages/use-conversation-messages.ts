import { useAuth } from '@clerk/expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

import { useAuthToken } from '@/hooks/use-auth-token';
import {
  fetchConversationMessages,
  markConversationRead,
  sendConversationMessage,
  type Contraparte,
  type MensajeInput,
  type MensajeView,
} from '@/utils/api';

const POLL_MS = 4000;
const PAGE = 30;

/** Sin duplicados (un mensaje propio vuelve en el siguiente poll) y por id: los ObjectId ordenan
 * cronológicamente como string. */
function mergeById(prev: MensajeView[] | null, items: MensajeView[]): MensajeView[] {
  const byId = new Map((prev ?? []).map((m) => [m.id, m]));
  for (const m of items) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}

/**
 * Mensajes de una conversación abierta. ÚNICO punto del transporte: hoy polling cada 4 s con
 * `after=<último id>` (solo con la pantalla en foco y la app en primer plano); para pasar a socket
 * se cambia este hook y las pantallas no se tocan. Marca leída al abrir y cuando llegan mensajes
 * de la contraparte.
 */
export function useConversationMessages(conversationId: string | null, companyId: string | undefined) {
  const getToken = useAuthToken();
  const { userId } = useAuth();
  const [messages, setMessages] = useState<MensajeView[] | null>(null);
  const [leidoHasta, setLeidoHasta] = useState<string | null>(null);
  // Solo viene sin cursor y con `before`: el polling (`after`) no la pisa.
  const [contraparte, setContraparte] = useState<Contraparte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const lastId = useRef<string | undefined>(undefined);
  const loaded = useRef(false);
  const busy = useRef(false);
  const loadingOlder = useRef(false);

  const isMine = useCallback((m: MensajeView) => m.autor.userId === userId && m.autor.companyId === companyId, [userId, companyId]);

  const token = useCallback(async () => {
    const t = await getToken();
    if (!t) throw new Error('No se pudo obtener la sesión.');
    return t;
  }, [getToken]);

  const poll = useCallback(async () => {
    if (!conversationId || !companyId || busy.current) return;
    busy.current = true;
    try {
      const t = await token();
      const first = !loaded.current;
      const incoming: MensajeView[] = [];
      let page;
      // Primera carga: los últimos PAGE. Después: `after`, repitiendo mientras venga la página llena.
      do {
        page = await fetchConversationMessages(conversationId, companyId, t, { after: lastId.current, limit: PAGE });
        const items = page.items;
        if (page.contraparte) setContraparte(page.contraparte);
        if (items.length) {
          lastId.current = items[items.length - 1].id;
          setMessages((prev) => mergeById(prev, items));
          incoming.push(...items.filter((m) => !isMine(m)));
        }
        if (first) setHasOlder(items.length === PAGE);
      } while (!first && page.items.length === PAGE);
      loaded.current = true;
      setMessages((prev) => prev ?? []);
      setLeidoHasta(page.leidoHastaContraparte);
      setError(null);
      if (first || incoming.length) markConversationRead(conversationId, companyId, t).catch(() => {});
      // Solo lo que llegó de la contraparte después de abrir (no la carga inicial ni cada poll vacío).
      if (!first && incoming.length) {
        AccessibilityInfo.announceForAccessibility(
          incoming.length === 1 ? `Mensaje nuevo: ${incoming[0].texto ?? 'archivo adjunto'}` : `${incoming.length} mensajes nuevos`
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      busy.current = false;
    }
  }, [conversationId, companyId, token, isMine]);

  useFocusEffect(
    useCallback(() => {
      if (!conversationId || !companyId) return;
      let timer: ReturnType<typeof setInterval> | null = null;
      const start = () => {
        if (timer) return;
        poll();
        timer = setInterval(poll, POLL_MS);
      };
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };
      start();
      const sub = AppState.addEventListener('change', (state) => (state === 'active' ? start() : stop()));
      return () => {
        stop();
        sub.remove();
      };
    }, [conversationId, companyId, poll])
  );

  /** Historial hacia arriba (`before` = el más viejo cargado). */
  const loadOlder = useCallback(async () => {
    const oldest = messages?.[0]?.id;
    if (!conversationId || !companyId || !hasOlder || !oldest || loadingOlder.current) return;
    loadingOlder.current = true;
    try {
      const page = await fetchConversationMessages(conversationId, companyId, await token(), { before: oldest, limit: PAGE });
      if (page.contraparte) setContraparte(page.contraparte);
      setMessages((prev) => mergeById(prev, page.items));
      setHasOlder(page.items.length === PAGE);
    } catch {
      // ponytail: el próximo scroll hacia arriba reintenta.
    } finally {
      loadingOlder.current = false;
    }
  }, [conversationId, companyId, hasOlder, messages, token]);

  /** Responder en esta conversación (nunca consume cupo). Tira el error del backend (403 = solo lectura). */
  const send = useCallback(
    async (input: MensajeInput) => {
      if (!conversationId || !companyId) return;
      const sent = await sendConversationMessage(conversationId, companyId, input, await token());
      // No avanza `lastId`: si la contraparte escribió justo antes, el próximo poll lo trae igual.
      setMessages((prev) => mergeById(prev, [sent]));
    },
    [conversationId, companyId, token]
  );

  /**
   * URL recién firmada de un adjunto: la que vino con el mensaje vence a los 15 min y no hay forma
   * de saber si falló una descarga abierta en el navegador, así que se pide ese mensaje de nuevo
   * (rango de 1 junto a un vecino) justo antes de abrirlo.
   */
  const attachmentUrl = useCallback(
    async (messageId: string, key: string) => {
      const list = messages ?? [];
      const i = list.findIndex((m) => m.id === messageId);
      if (!conversationId || !companyId || i < 0) return null;
      const range = i < list.length - 1 ? { before: list[i + 1].id } : i > 0 ? { after: list[i - 1].id } : {};
      const page = await fetchConversationMessages(conversationId, companyId, await token(), { ...range, limit: 1 });
      return page.items.find((m) => m.id === messageId)?.adjuntos.find((a) => a.key === key)?.url ?? null;
    },
    [conversationId, companyId, messages, token]
  );

  return { messages, leidoHasta, contraparte, error, hasOlder, loadOlder, send, isMine, retry: poll, attachmentUrl };
}
