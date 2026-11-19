import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ConversationAvatar } from '@/components/messages/conversation-avatar';
import { personaLine } from '@/components/messages/messages-data';
import { timeAgo } from '@/components/post/post-data';
import { ThemedText } from '@/components/themed-text';
import { SkeletonBlock, skeletonLine } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ConversacionEnBandeja } from '@/utils/api';

/** Fila de la bandeja (Figma 2046:1122 / 2046:1696): misma tarjeta que PostCard. */
export function ConversationRow({ item, onPress }: { item: ConversacionEnBandeja; onPress: () => void }) {
  const theme = useTheme();
  const { contraparte, ultimoMensaje, noLeidos } = item;
  const empresa = contraparte.empresa?.name ?? 'Empresa no disponible';
  const persona = personaLine(contraparte.nombre, contraparte.cargo);
  const unread = noLeidos > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        `Conversación con ${empresa}`,
        contraparte.empresa?.verified ? 'verificada' : null,
        persona,
        unread ? `${noLeidos} sin leer` : null,
        `${ultimoMensaje.esMio ? 'Tú: ' : ''}${ultimoMensaje.vistaPrevia}`,
        timeAgo(ultimoMensaje.createdAt),
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.feedCard, borderColor: theme.surfaceBorder, shadowColor: theme.cardShadow, opacity: pressed ? 0.95 : 1 },
      ]}>
      <ConversationAvatar logoUrl={contraparte.empresa?.logoUrl} fotoUrl={contraparte.fotoUrl} />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.nameWrap}>
            <ThemedText numberOfLines={1} style={[styles.name, { color: theme.textPrimary }]}>
              {empresa}
            </ThemedText>
            {contraparte.empresa?.verified && (
              <SymbolView tintColor={theme.accent} name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={14} />
            )}
          </View>
          <ThemedText style={[styles.meta, { color: theme.textMuted }]}>{timeAgo(ultimoMensaje.createdAt)}</ThemedText>
        </View>
        {persona ? (
          <ThemedText type="small" numberOfLines={1} style={{ color: theme.textMuted }}>
            {persona}
          </ThemedText>
        ) : null}
        <View style={styles.row}>
          <ThemedText
            type={unread ? 'smallBold' : 'small'}
            numberOfLines={1}
            style={[styles.preview, { color: unread ? theme.textPrimary : theme.textMuted }]}>
            {ultimoMensaje.vistaPrevia}
          </ThemedText>
          {/* La bandeja no trae si la contraparte leyó lo mío: sin check acá (contrato d2bb99a). */}
          {unread && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
        </View>
      </View>
    </Pressable>
  );
}

/** Esqueleto de ConversationRow (dentro de un SkeletonGroup), mismas medidas. */
export function ConversationRowSkeleton() {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.feedCard, borderColor: theme.surfaceBorder, shadowColor: theme.cardShadow }]}>
      <SkeletonBlock style={styles.skeletonAvatar} />
      <View style={styles.body}>
        <SkeletonBlock style={skeletonLine(24, '55%')} />
        <SkeletonBlock style={skeletonLine(20, '40%')} />
        <SkeletonBlock style={skeletonLine(20, '85%')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.two + Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
  },
  name: {
    flexShrink: 1,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  preview: {
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
