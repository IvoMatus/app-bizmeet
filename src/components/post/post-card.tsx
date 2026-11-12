import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { POST_TYPE_LABEL, timeAgo } from '@/components/post/post-data';
import { PostAttachments } from '@/components/post/post-attachments';
import { rubroNombre } from '@/components/post/use-rubros-catalog';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PostSinDetalleView, PostView, Rubro } from '@/utils/api';

/** Colores de badge por tipo, reusando los tokens offer/seek ya definidos en el tema. */
function useTypeBadgeColors(tipo: PostView['tipo']) {
  const theme = useTheme();
  if (tipo === 'OFERTA') return { bg: theme.offerSoft, fg: theme.accentStrong };
  if (tipo === 'REQUERIMIENTO') return { bg: theme.seekSoft, fg: theme.success };
  return { bg: theme.accentSoft, fg: theme.accent };
}

function TypeBadge({ tipo }: { tipo: PostView['tipo'] }) {
  const { bg, fg } = useTypeBadgeColors(tipo);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText style={[styles.badgeLabel, { color: fg }]}>{POST_TYPE_LABEL[tipo]}</ThemedText>
    </View>
  );
}

function IndustryBadge({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.surfaceInset }]}>
      <ThemedText style={[styles.badgeLabel, { color: theme.textMuted }]}>{label}</ThemedText>
    </View>
  );
}

/** Tarjeta completa del feed (vista "COMPLETA" de GET /posts/feed): autor, título, copy,
 * adjuntos reales (ver `post-attachments.tsx`) y barra de interacciones estática. */
export function PostCard({ post, rubros }: { post: PostView; rubros: Rubro[] | null }) {
  const theme = useTheme();
  const companyName = post.empresa.name;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver publicación: ${post.titulo}`}
      onPress={() => router.push(`/publicacion/${post.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder, opacity: pressed ? 0.95 : 1 },
      ]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'building.2', android: 'business', web: 'business' }} size={16} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {companyName}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            {timeAgo(post.createdAt)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <TypeBadge tipo={post.tipo} />
        {post.rubros.map((codigo) => (
          <IndustryBadge key={codigo} label={rubroNombre(rubros, codigo)} />
        ))}
      </View>

      <ThemedText style={[styles.title, { color: theme.textPrimary }]}>{post.titulo}</ThemedText>
      <ThemedText type="small" numberOfLines={3} style={{ color: theme.textMuted }}>
        {post.descripcion}
      </ThemedText>

      <PostAttachments adjuntos={post.adjuntos} />

      <View style={[styles.footer, { borderTopColor: theme.surfaceBorder }]}>
        {/* TODO T3.3: likes/comentarios reales — el backend hoy no expone contadores. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Me gusta (próximamente)"
          disabled
          accessibilityState={{ disabled: true }}
          style={styles.footerAction}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'heart', android: 'favorite_border', web: 'favorite' }} size={16} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Comentar (próximamente)"
          disabled
          accessibilityState={{ disabled: true }}
          style={styles.footerAction}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'bubble.right', android: 'chat_bubble_outline', web: 'chat_bubble' }} size={16} />
        </Pressable>
        <View style={styles.footerSpacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Guardar publicación (próximamente)"
          // TODO: guardar publicación — fuera de alcance T3.1/T3.2.
          disabled
          accessibilityState={{ disabled: true }}
          style={styles.footerAction}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark' }} size={16} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compartir publicación (próximamente)"
          // TODO: compartir publicación — fuera de alcance T3.1/T3.2.
          disabled
          accessibilityState={{ disabled: true }}
          style={styles.footerAction}>
          <SymbolView tintColor={theme.textMuted} name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={16} />
        </Pressable>
      </View>
    </Pressable>
  );
}

/**
 * RN-PUB-06: variante reducida para perfil básico viendo el muro de requerimientos (vista
 * "SIN_DETALLE" de GET /posts/feed) — sin imagen, sin autor, sin descripción.
 */
export function PostCardBasic({ post, rubros }: { post: PostSinDetalleView; rubros: Rubro[] | null }) {
  const theme = useTheme();

  return (
    <View style={[styles.cardBasic, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
      <View style={styles.badgeRow}>
        <TypeBadge tipo={post.tipo} />
        {post.rubros.slice(0, 1).map((codigo) => (
          <IndustryBadge key={codigo} label={rubroNombre(rubros, codigo)} />
        ))}
      </View>
      <ThemedText style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
        {post.titulo}
      </ThemedText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Crea tu empresa para ver el detalle completo"
        onPress={() => router.push('/empresa/crear')}
        style={styles.ctaRow}>
        <ThemedText type="small" style={{ color: theme.accent, fontWeight: '700' }}>
          Crea tu empresa para ver el detalle completo →
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardBasic: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    gap: Spacing.half,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  footerSpacer: {
    flex: 1,
  },
  footerAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
