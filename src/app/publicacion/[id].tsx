import { useAuth } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { POST_TYPE_LABEL, timeAgo } from '@/components/post/post-data';
import { rubroNombre, useRubrosCatalog } from '@/components/post/use-rubros-catalog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCompany, fetchPost, type CompanyDetail, type PostView } from '@/utils/api';

export default function PublicacionDetalleScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<PostView | null>(null);
  const [author, setAuthor] = useState<CompanyDetail | null>(null);
  const { rubros: catalog } = useRubrosCatalog();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchPost(id, token).then(async (p) => {
          setPost(p);
          setError(null);
          setAuthor(await fetchCompany(p.companyId, token).catch(() => null));
        });
      })
      .catch((e: Error) => {
        setPost(null);
        setError(e.message);
      });
  }, [getToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Reintentar">
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center', marginTop: Spacing.five }}>
              {error} Tocá para reintentar.
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!post) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <ActivityIndicator color={theme.accent} style={styles.loading} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: theme.card }]}>
            <SymbolView tintColor={theme.textPrimary} name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} />
          </Pressable>
          <View style={[styles.categoryBadge, { backgroundColor: theme.accentSoft }]}>
            <ThemedText type="small" style={{ color: theme.accent, fontWeight: '700' }}>
              {POST_TYPE_LABEL[post.tipo]}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Guardar publicación (próximamente)"
            // TODO: guardar publicación — fuera de alcance T3.1/T3.2.
            disabled
            accessibilityState={{ disabled: true }}
            style={[styles.headerButton, { backgroundColor: theme.card }]}>
            <SymbolView tintColor={theme.textPrimary} name={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark' }} size={18} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {post.adjuntos.length > 0 && (
            <View style={[styles.attachmentBanner, { backgroundColor: theme.surfaceInset }]}>
              <SymbolView tintColor={theme.textMuted} name={{ ios: 'paperclip', android: 'attach_file', web: 'attach_file' }} size={16} />
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                {post.adjuntos.length} adjunto{post.adjuntos.length === 1 ? '' : 's'}
              </ThemedText>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver empresa ${author?.name ?? post.companyId}`}
            onPress={() => router.push(`/empresa/${post.companyId}`)}
            style={[styles.card, styles.authorCard, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
            <View style={[styles.authorIcon, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
              <SymbolView tintColor={theme.textMuted} name={{ ios: 'building.2', android: 'business', web: 'business' }} size={18} />
            </View>
            <View style={styles.authorInfo}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                {author?.name ?? 'Cargando empresa…'}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                {timeAgo(post.createdAt)}
              </ThemedText>
            </View>
            <View style={[styles.verButton, { backgroundColor: theme.buttonDark }]}>
              <ThemedText type="small" style={{ color: theme.accent, fontWeight: '700' }}>
                Ver Empresa
              </ThemedText>
            </View>
          </Pressable>

          <View style={[styles.card, styles.descriptionCard, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
            <ThemedText style={[styles.title, { color: theme.textPrimary }]}>{post.titulo}</ThemedText>
            <View style={styles.chipsRow}>
              {post.rubros.map((codigo) => (
                <View key={codigo} style={[styles.chip, { backgroundColor: theme.surfaceInset }]}>
                  <ThemedText type="small" style={{ color: theme.textMuted }}>
                    {rubroNombre(catalog, codigo)}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={{ color: theme.textMuted }}>{post.descripcion}</ThemedText>
          </View>

          <View style={[styles.card, styles.reactionsCard, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
            {/* TODO T3.3: likes/comentarios reales — el backend hoy no expone contadores. */}
            <Pressable accessibilityRole="button" accessibilityLabel="Me gusta (próximamente)" disabled accessibilityState={{ disabled: true }} style={styles.reactionButton}>
              <SymbolView tintColor={theme.textMuted} name={{ ios: 'heart', android: 'favorite_border', web: 'favorite' }} size={18} />
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                Me gusta
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Comentar, próximamente"
              accessibilityState={{ disabled: true }}
              disabled
              style={styles.reactionButton}>
              <SymbolView tintColor={theme.textMuted} name={{ ios: 'bubble.right', android: 'chat_bubble_outline', web: 'chat_bubble' }} size={18} />
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                Comentar (próximamente)
              </ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Difundir" style={styles.reactionButton} onPress={() => {}}>
              <SymbolView tintColor={theme.textMuted} name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={18} />
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                Difundir
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    marginTop: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 9999,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  attachmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: {
    flex: 1,
    gap: Spacing.half,
    marginLeft: Spacing.two,
  },
  verButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  descriptionCard: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
  },
  reactionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
  },
});
