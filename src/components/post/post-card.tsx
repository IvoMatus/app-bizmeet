import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type TextLayoutEventData, type ViewStyle } from 'react-native';

import { POST_TYPE_LABEL, timeAgo } from '@/components/post/post-data';
import { PostMediaHero } from '@/components/post/post-attachments';
import { rubroNombre } from '@/components/post/use-rubros-catalog';
import { StatusPill, useStatusPalette, type StatusVariant } from '@/components/profile/profile-primitives';
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

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** Paleta del chip de rubro y del avatar (Figma: cian / ámbar / verde). Los rubros SCIAN no traen
 * color, así que sale determinística del código del primer rubro — mismo rubro, mismo color.
 * ponytail: suma de char codes mod 3; mapear sector → color si diseño lo define. */
const RUBRO_PALETTES = ['accent', 'warning', 'success'] as const;
function rubroPalette(codigo: string | undefined): StatusVariant {
  if (!codigo) return 'accent';
  let sum = 0;
  for (const ch of codigo) sum += ch.charCodeAt(0);
  return RUBRO_PALETTES[sum % RUBRO_PALETTES.length];
}

// ponytail: el slop de like/comentario se pisa en los 16px de gap entre ellos — inofensivo
// mientras estén deshabilitados; al habilitarlos con contadores el ancho crece y deja de pisarse.
const ACTION_HIT_SLOP = 15; // ícono de 15 + 2×15 ≈ 44 de target sin inflar la barra

/** Acción de la barra social — deshabilitada hasta que existan likes/comentarios/guardar/compartir. */
function BarAction({ label, icon, text, style }: { label: string; icon: SymbolName; text?: string; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled
      accessibilityState={{ disabled: true }}
      hitSlop={ACTION_HIT_SLOP}
      style={[styles.barAction, style]}>
      <SymbolView tintColor={theme.textMuted} name={icon} size={15} />
      {text && <ThemedText style={[styles.barActionLabel, { color: theme.textMuted }]}>{text}</ThemedText>}
    </Pressable>
  );
}

const DESCRIPTION_LINES = 3;
const MORE_SUFFIX = '… ver más';

/** Primeras DESCRIPTION_LINES líneas del texto medido, con la última recortada (a palabra entera)
 * para que "… ver más" entre en la misma línea. null si el texto no llega a truncarse. */
function collapseDescription(lines: TextLayoutEventData['lines']): string | null {
  if (lines.length <= DESCRIPTION_LINES) return null;
  const last = lines[DESCRIPTION_LINES - 1];
  const lastText = last.text.trimEnd();
  // ponytail: ancho promedio por carácter de la línea, no glifo a glifo. Si un caso raro se pasa,
  // numberOfLines corta con "…" y se pierde el "ver más" (como antes); medir el sufijo con otro
  // Text oculto si pasa en la práctica.
  const charWidth = last.width / Math.max(lastText.length, 1);
  const lineWidth = Math.max(...lines.map((l) => l.width)); // ≈ ancho del contenedor
  const room = Math.floor(lineWidth / charWidth) - MORE_SUFFIX.length - 1;
  // +1: si el corte cae justo en un espacio la última palabra queda entera; si no, se descarta a medias.
  const cut = room >= lastText.length ? lastText : lastText.slice(0, room + 1).replace(/\s*\S*$/, '');
  return lines.slice(0, DESCRIPTION_LINES - 1).map((l) => l.text).join('') + cut;
}

/** Descripción truncada con "ver más"/"ver menos" inline. El truncado se detecta midiendo una
 * copia invisible sin límite de líneas (onTextLayout del texto visible, con numberOfLines, en
 * Android solo reporta las líneas visibles). En web no hay onTextLayout: queda el corte con "…". */
function PostDescription({ text }: { text: string }) {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Text anidado con onPress: toma el toque él mismo, así que no dispara la navegación de la tarjeta.
  const toggle = (
    <ThemedText
      type="smallBold"
      accessibilityRole="button"
      accessibilityLabel={expanded ? 'Ver menos texto' : 'Ver texto completo'}
      onPress={() => setExpanded(!expanded)}
      style={{ color: theme.accentText }}>
      {expanded ? 'ver menos' : 'ver más'}
    </ThemedText>
  );

  return (
    <View>
      <ThemedText
        type="small"
        numberOfLines={expanded ? undefined : DESCRIPTION_LINES}
        style={[styles.description, { color: theme.textBody }]}>
        {collapsed === null ? text : expanded ? <>{text} {toggle}</> : <>{collapsed}{'… '}{toggle}</>}
      </ThemedText>
      <View aria-hidden style={styles.measure}>
        <ThemedText
          type="small"
          onTextLayout={(e) => setCollapsed(collapseDescription(e.nativeEvent.lines))}
          style={styles.description}>
          {text}
        </ThemedText>
      </View>
    </View>
  );
}

/** Tarjeta completa del feed (vista "COMPLETA" de GET /posts/feed, Figma 2043:1778 / 2043:3343):
 * autor + chip de rubro, título, copy, hero con el primer adjunto (ver `post-attachments.tsx`) y
 * barra social estática. Regla del usuario: la escala tipográfica es la del "Nuevo Modo Oscuro"
 * en los dos modos; solo los colores cambian por modo. */
export function PostCard({ post, rubros }: { post: PostView; rubros: Rubro[] | null }) {
  const theme = useTheme();
  // Figma muestra un solo chip: el primer rubro manda (chip y color del avatar).
  const firstRubro = post.rubros[0];
  const variant = rubroPalette(firstRubro);
  const palette = useStatusPalette(variant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver publicación: ${post.titulo}`}
      onPress={() => router.push(`/publicacion/${post.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.feedCard, borderColor: theme.surfaceBorder, shadowColor: theme.cardShadow, opacity: pressed ? 0.95 : 1 },
      ]}>
      <View style={styles.author}>
        <View style={[styles.avatar, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <SymbolView tintColor={palette.fg} name={{ ios: 'building.2', android: 'business', web: 'business' }} size={17} />
        </View>
        <View style={styles.authorText}>
          <View style={styles.nameRow}>
            <View style={styles.nameWrap}>
              <ThemedText numberOfLines={1} style={[styles.companyName, { color: theme.textPrimary }]}>
                {post.empresa.name}
              </ThemedText>
              {/* Decisión pendiente (brief): check solo si la empresa está verificada. */}
              {post.empresa.verified && (
                <SymbolView
                  accessibilityLabel="Empresa verificada"
                  tintColor={theme.accent}
                  name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
                  size={14}
                />
              )}
            </View>
            {firstRubro && (
              <StatusPill
                label={rubroNombre(rubros, firstRubro)}
                variant={variant}
                style={styles.rubroChip}
                labelStyle={styles.rubroChipLabel}
              />
            )}
          </View>
          <View style={styles.metaRow}>
            <ThemedText numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>
              {timeAgo(post.createdAt)}
            </ThemedText>
            <ThemedText style={[styles.metaDot, { color: theme.textMuted }]}>•</ThemedText>
            {/* Slot "Proyecto Alpha" de Figma: la API no tiene proyecto/división, va el tipo. */}
            <ThemedText numberOfLines={1} style={[styles.metaSecondary, { color: theme.textBody }]}>
              {POST_TYPE_LABEL[post.tipo]}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.copy}>
        <ThemedText numberOfLines={2} style={[styles.feedTitle, { color: theme.textPrimary }]}>
          {post.titulo}
        </ThemedText>
        <PostDescription text={post.descripcion} />
      </View>

      <PostMediaHero adjuntos={post.adjuntos} />

      {/* TODO T3.3: contadores de likes/comentarios — el backend hoy no los expone, así que van
          solo los íconos (sin "0" ni números falsos). Guardar/Compartir sin endpoint todavía. */}
      <View style={[styles.socialBar, { borderTopColor: theme.surfaceInset }]}>
        <View style={styles.socialLeft}>
          <BarAction label="Me gusta (próximamente)" icon={{ ios: 'heart', android: 'favorite_border', web: 'favorite' }} />
          <BarAction
            label="Comentar (próximamente)"
            icon={{ ios: 'bubble.right', android: 'chat_bubble_outline', web: 'chat_bubble' }}
          />
        </View>
        <View style={styles.socialRight}>
          {/* Decisión pendiente (brief): Guardar siempre visible, deshabilitado. */}
          <BarAction
            label="Guardar publicación (próximamente)"
            icon={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark' }}
            style={styles.saveAction}
          />
          <BarAction
            label="Compartir publicación (próximamente)"
            icon={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
            text="Compartir"
          />
        </View>
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
  // Radio 12 (frame oscuro, el más nuevo; el claro usa 16) — decisión del brief.
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two + Spacing.one,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardBasic: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: 320,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorText: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
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
  companyName: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  rubroChip: {
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    maxWidth: '50%',
  },
  rubroChipLabel: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  metaDot: {
    fontSize: 8,
    lineHeight: 16,
    fontWeight: '400',
  },
  metaSecondary: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  copy: {
    gap: Spacing.one,
  },
  feedTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  description: {
    fontWeight: '400',
  },
  // Copia de medición: mismo ancho que la descripción, fuera del flujo, invisible y sin toques.
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  socialBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one + Spacing.half,
    borderTopWidth: 1,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  socialRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
  },
  barAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  barActionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  saveAction: {
    padding: Spacing.one,
    borderRadius: 6,
  },
  // PostCardBasic (sin cambios)
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
  ctaRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
