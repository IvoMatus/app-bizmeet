import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { fetchNotifications, unreadCount, type AppNotification } from '@/components/notifications/notifications-data';
import { NotificationCard } from '@/components/notifications/notifications-sections';
import { ProfileTabs } from '@/components/profile/profile-chrome';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "Centro de Notificaciones B2B" (T2.5, Figma 2046:558 claro / 2046:2 oscuro) — tab hermana de
 * Perfil/Invitaciones/Pago dentro del mismo stack/header compartido (ver perfil/_layout.tsx).
 *
 * ponytail: el MCP de Figma agotó el cupo de llamadas del plan Starter al momento de
 * implementar esta pantalla (get_design_context/get_metadata/get_screenshot con rate limit) —
 * se construyó por spec funcional + el patrón visual ya confirmado en Invitaciones/Equipo
 * (mismo header, mismos tokens de theme.ts). Verificar pixel-a-pixel contra 2046:558/2046:2
 * cuando vuelva el cupo: layout exacto, copy literal y si aparece un toggle de
 * push/correo (fuera de alcance de esta fase, no conectar a nada real si aparece).
 *
 * Alcance: solo feed in-app (invitaciones, pagos, cambios de rol/equipo). Push/correo y sus
 * settings son Fase 2, explícitamente fuera de alcance acá.
 */
export default function NotificacionesScreen() {
  const theme = useTheme();
  // TODO(backend): mock — ver notifications-data.ts; sin fetch real el estado de error es
  // inalcanzable hoy, se deja el flujo listo para cuando exista el endpoint.
  const [notifications, setNotifications] = useState<AppNotification[] | null>(() => fetchNotifications());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setNotifications(fetchNotifications());
    setError(null);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTabs activeKey="notif" />

      {error && !notifications && (
        <Pressable onPress={load} style={styles.center}>
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
});
