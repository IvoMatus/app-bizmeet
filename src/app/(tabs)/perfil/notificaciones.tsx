import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useAuthToken } from '@/hooks/use-auth-token';

import { toAppNotification, unreadCount, type AppNotification } from '@/components/notifications/notifications-data';
import { NotificationCard } from '@/components/notifications/notifications-sections';
import { ProfileTabs } from '@/components/profile/profile-chrome';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchNotifications } from '@/utils/api';

/** "Centro de Notificaciones B2B" (T2.5, Figma 2046:558 claro / 2046:2 oscuro) — tab hermana de
 * Perfil/Invitaciones/Pago dentro del mismo stack/header compartido (ver perfil/_layout.tsx).
 *
 * Alcance: solo feed in-app (invitaciones, pagos, cambios de rol/equipo). Push/correo y sus
 * settings son Fase 2, explícitamente fuera de alcance acá. El feed arranca desde que se creó
 * el endpoint — no hay eventos históricos. Tampoco hay "marcar leído" server-side todavía.
 */
export default function NotificacionesScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    (cursor?: string) => {
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return fetchNotifications(token, { cursor });
        })
        .then((page) => {
          const mapped = page.items.map(toAppNotification);
          setNotifications((prev) => (cursor ? [...(prev ?? []), ...mapped] : mapped));
          setNextCursor(page.nextCursor);
          setError(null);
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoadingMore(false));
    },
    [getToken],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    load(nextCursor);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTabs activeKey="notif" />

      {error && !notifications && (
        <Pressable onPress={() => load()} style={styles.center}>
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
        </Pressable>
      )}

      {!notifications && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

      {notifications && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleBlock}>
            <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
              ACTIVIDAD DE LA CUENTA
            </ThemedText>
            <ThemedText type="subtitle" themeColor="textPrimary">
              Centro de <ThemedText type="subtitle" themeColor="accent">Notificaciones</ThemedText>
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              Invitaciones, pagos y cambios de rol dentro de tus empresas, en un solo lugar.
            </ThemedText>
            {notifications.length > 0 && (
              <View style={[styles.counterBadge, { backgroundColor: theme.accentSoft }]}>
                <ThemedText type="smallBold" themeColor="accent">
                  {unreadCount(notifications)} SIN LEER
                </ThemedText>
              </View>
            )}
          </View>

          {notifications.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
              No tenés notificaciones por el momento.
            </ThemedText>
          ) : (
            notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
          )}

          {nextCursor && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cargar más notificaciones"
              onPress={handleLoadMore}
              disabled={loadingMore}
              style={({ pressed }) => [styles.loadMoreButton, { borderColor: theme.accent, opacity: pressed || loadingMore ? 0.7 : 1 }]}>
              {loadingMore ? (
                <ActivityIndicator color={theme.accent} />
              ) : (
                <ThemedText type="smallBold" themeColor="accent">
                  Cargar más
                </ThemedText>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  loading: { marginTop: Spacing.four },
  content: { padding: Spacing.three, gap: Spacing.three },
  titleBlock: { gap: Spacing.one, marginBottom: Spacing.two },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  counterBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half + 2, borderRadius: 9999, marginTop: Spacing.two },
  emptyText: { textAlign: 'center', paddingVertical: Spacing.four },
  loadMoreButton: { height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
