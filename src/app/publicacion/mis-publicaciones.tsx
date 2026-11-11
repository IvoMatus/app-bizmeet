import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthToken } from '@/hooks/use-auth-token';

import { POST_TYPE_LABEL, timeAgo } from '@/components/post/post-data';
import { rubroNombre, useRubrosCatalog } from '@/components/post/use-rubros-catalog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchMyCompanies, fetchPostQuota, fetchPostsFeed, type PostQuotaView, type PostView, type Rubro, type TipoPublicacion } from '@/utils/api';

// Punto de entrada: botón "lista" en el header de Inicio (ver src/app/(tabs)/index.tsx).
// No hay frame de Figma para esta pantalla — extrapolada del patrón de CompanyCard/"Mis Empresas".
// No existe un endpoint "mis publicaciones": se pide el feed de la empresa activa y se filtra
// client-side por companyId (aproximación — el cupo y la propiedad son a nivel empresa, no autor).

function QuotaRow({ quota, error, onRetry }: { quota: PostQuotaView | null; error: string | null; onRetry: () => void }) {
  const theme = useTheme();

  if (error) {
    return (
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar cargar cupos" style={{ paddingHorizontal: Spacing.three }}>
        <ThemedText type="small" style={{ color: theme.error }}>
          {error} Tocá para reintentar.
        </ThemedText>
      </Pressable>
    );
  }
  if (!quota) return <ActivityIndicator color={theme.accent} style={{ marginVertical: Spacing.two }} />;

  return (
    <View style={styles.quotaRow}>
      {Object.entries(quota.cupos).map(([tipo, q]) => (
        <View key={tipo} style={[styles.quotaChip, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            {POST_TYPE_LABEL[tipo as TipoPublicacion]} {q.saldo}/{q.limite}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function MyPostCard({ post, rubros }: { post: PostView; rubros: Rubro[] | null }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
          <ThemedText type="small" style={{ color: theme.accent, fontWeight: '700' }}>
            {POST_TYPE_LABEL[post.tipo]}
          </ThemedText>
        </View>
        {post.rubros.map((codigo) => (
          <View key={codigo} style={[styles.badge, { backgroundColor: theme.surfaceInset }]}>
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              {rubroNombre(rubros, codigo)}
            </ThemedText>
          </View>
        ))}
      </View>
      <ThemedText style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
        {post.titulo}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textMuted }}>
        {timeAgo(post.createdAt)}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Editar ${post.titulo} (próximamente)`}
        // TODO: navegar a editar publicación cuando exista la ruta (RN-PUB-02: el cupo
        // consumido al crear no se devuelve, pero sí se puede editar el contenido).
        disabled
        accessibilityState={{ disabled: true }}
        style={[styles.editButton, { backgroundColor: theme.surfaceInset }]}>
        <SymbolView tintColor={theme.textMuted} name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={14} />
        <ThemedText type="small" style={{ color: theme.textMuted, fontWeight: '600' }}>
          Editar
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function MisPublicacionesScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostView[] | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [quota, setQuota] = useState<PostQuotaView | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const { rubros: catalog } = useRubrosCatalog();

  const loadQuota = useCallback(
    (id: string) => {
      setQuotaError(null);
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return fetchPostQuota(id, token);
        })
        .then(setQuota)
        .catch((e: Error) => setQuotaError(e.message));
    },
    [getToken]
  );

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchMyCompanies(token).then((mine) => {
          const active = mine[0]?.company.id ?? null;
          setCompanyId(active);
          if (!active) return [];
          loadQuota(active);
          return fetchPostsFeed({ companyId: active, limit: 50 }, token).then((feed) =>
            feed.vista === 'COMPLETA' ? feed.items.filter((item) => item.companyId === active) : []
          );
        });
      })
      .then((next) => {
        setPosts(next);
        setPostsError(null);
      })
      .catch((e: Error) => setPostsError(e.message));
  }, [getToken, loadQuota]);

  useEffect(() => {
    load();
  }, [load]);

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
          <ThemedText type="smallBold" style={{ color: theme.textPrimary, fontSize: 17 }}>
            Mis publicaciones
          </ThemedText>
          <View style={styles.headerButton} />
        </View>

        <ThemedText type="small" style={{ color: theme.textMuted, paddingHorizontal: Spacing.three }}>
          Cupos de este mes
        </ThemedText>
        {companyId && <QuotaRow quota={quota} error={quotaError} onRetry={() => loadQuota(companyId)} />}

        {postsError && (
          <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Reintentar">
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center', marginTop: Spacing.three }}>
              {postsError} Tocá para reintentar.
            </ThemedText>
          </Pressable>
        )}

        {!posts && !postsError && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {posts && (
          <FlatList
            data={posts}
            keyExtractor={(post) => post.id}
            accessible={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText style={{ color: theme.textMuted, textAlign: 'center', marginTop: Spacing.five }}>
                Todavía no publicaste nada este mes.
              </ThemedText>
            }
            renderItem={({ item }) => <MyPostCard post={item} rubros={catalog} />}
          />
        )}
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
  quotaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  quotaChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
    borderWidth: 1,
  },
  list: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
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
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
  },
});
