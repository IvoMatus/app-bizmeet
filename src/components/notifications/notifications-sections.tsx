import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AppNotification, NotificationStatus, NotificationType } from '@/components/notifications/notifications-data';
import { timeAgo } from '@/components/post/post-data';
import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TYPE_ICON: Record<NotificationType, ProfileIconName> = {
  invitation: 'network',
  payment: 'card',
  team: 'rosette',
};

const STATUS_LABEL: Record<NotificationStatus, string> = {
  pending: 'Pendiente',
  success: 'Confirmado',
  error: 'Fallido',
};

/** Badge de estado — mismos tokens `warning*`/`success*`/`error*` que ya usa
 * `PaymentStatusBadge` (payments-sections.tsx), sin agregar variante nueva a `StatusPill`. */
function StatusBadge({ status }: { status: NotificationStatus }) {
  const theme = useTheme();
  const palette = {
    pending: { bg: theme.warningSoft, border: theme.warningBorder, fg: theme.warningText },
    success: { bg: theme.successSurface, border: theme.successBorder, fg: theme.success },
    error: { bg: theme.errorSoft, border: theme.errorBorder, fg: theme.error },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <ThemedText type="small" style={[styles.badgeLabel, { color: palette.fg }]}>
        {STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

/** Card de una notificación del feed in-app: icono por tipo, punto de no-leída, badge de
 * estado opcional, timestamp relativo y acción que navega a la pantalla relacionada. */
export function NotificationCard({ notification }: { notification: AppNotification }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
      accessible
      accessibilityLabel={`${notification.read ? '' : 'No leída. '}${notification.title}. ${notification.body}. ${timeAgo(notification.createdAt)}`}>
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
          <ProfileIcon name={TYPE_ICON[notification.type]} color={theme.accent} width={16} height={16} />
        </View>
        <View style={styles.flex1}>
          <View style={styles.titleRow}>
            {!notification.read && (
              <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            )}
            <ThemedText type="smallBold" themeColor="textPrimary" style={styles.flex1} numberOfLines={1}>
              {notification.title}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textMuted">
            {timeAgo(notification.createdAt)}
          </ThemedText>
        </View>
        {notification.status && <StatusBadge status={notification.status} />}
      </View>

      <ThemedText type="small" themeColor="textPrimary">
        {notification.body}
      </ThemedText>

      {notification.actionLabel && notification.actionRoute && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={notification.actionLabel}
          onPress={() => router.push(notification.actionRoute as Parameters<typeof router.push>[0])}
          style={({ pressed }) => [styles.outlineButton, { borderColor: theme.accent, opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="smallBold" themeColor="accent">
            {notification.actionLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  headerRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: 9999, borderWidth: 1, alignSelf: 'flex-start' },
  badgeLabel: { fontSize: 11, fontWeight: '700' },
  outlineButton: { height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: Spacing.three },
});
