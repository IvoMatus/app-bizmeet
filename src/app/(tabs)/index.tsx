import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { CategoryPills, GENERAL_FEED } from '@/components/post/category-pills';
import { PostCard, PostCardBasic } from '@/components/post/post-card';
import { EMPTY_FILTERS, PostFiltersSheet, type AppliedFilters } from '@/components/post/post-filters-sheet';
import { useCompanyBlocked } from '@/components/post/use-company-blocked';
import { useRubrosCatalog } from '@/components/post/use-rubros-catalog';
import { showAlert } from '@/components/ui/app-alert';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchMyCompanies, fetchPostsFeed, type FeedView, type MyCompany, type PostSinDetalleView, type PostView } from '@/utils/api';

/** Empresa activa del usuario. TODO: reemplazar por el selector real de "empresa activa"
 * (T1.3/T1.4) — hoy se usa la primera membership de GET /companies/mine como estándar. */
function useActiveCompany() {
  const { getToken } = useAuth();
  const [company, setCompany] = useState<MyCompany | null | undefined>(undefined); // undefined = cargando
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchMyCompanies(token);
      })
      .then((mine) => {
        setCompany(mine[0] ?? null);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken]);

  useEffect(load, [load]);

  return { company, error, reload: load };
}

export default function InicioScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { company: activeCompany, error: companyError, reload: reloadCompany } = useActiveCompany();
  const { rubros: catalog } = useRubrosCatalog();
  const { blocked } = useCompanyBlocked(activeCompany?.company.id);

  const [category, setCategory] = useState(GENERAL_FEED);
  const [filters, setFilters] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [feed, setFeed] = useState<FeedView | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const companyId = activeCompany?.company.id;

  const loadFeed = useCallback(
    (cursor?: string) => {
      getToken()
        .then((token) => {
          if (!token) throw new Error('No se pudo obtener la sesión.');
          return fetchPostsFeed({ companyId, rubro: category === GENERAL_FEED ? undefined : category, cursor, limit: 20 }, token);
        })
        .then((next) => {
          setFeed((prev) =>
            prev && cursor
              ? ({ ...next, items: [...prev.items, ...next.items] } as FeedView)
              : next
          );
          setFeedError(null);
        })
        .catch((e: Error) => setFeedError(e.message))
        .finally(() => setLoadingMore(false));
    },
    [category, companyId, getToken]
  );

  // activeCompany pasa de undefined (cargando) a null (perfil básico) o a un valor concreto.
  useEffect(() => {
    if (activeCompany === undefined) return;
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany, category]);

  const items = useMemo(() => {
    if (!feed) return [];
    return feed.items.filter((item) => {
      if (filters.query && !item.titulo.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.industries.length && !filters.industries.some((i) => item.rubros.includes(i))) return false;
      return true;
    });
  }, [feed, filters]);

  function onEndReached() {
    if (feed?.nextCursor && !loadingMore) {
      setLoadingMore(true);
      loadFeed(feed.nextCursor);
    }
  }

  function onPublish() {
    if (!activeCompany) {
      showAlert('Creá tu empresa', 'Necesitás una empresa activa para publicar en el muro.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear empresa', onPress: () => router.push('/empresa/crear') },
      ]);
      return;
    }
    if (blocked) {
      showAlert('Empresa bloqueada', 'Tu empresa está bloqueada y no puede publicar en el muro.');
      return;
    }
    router.push({ pathname: '/publicacion/crear', params: { companyId: activeCompany.company.id } });
  }

  const error = companyError ?? feedError;
  const onRetry = () => (companyError ? reloadCompany() : loadFeed());
  const loadingInitial = activeCompany === undefined || (!feed && !error);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTopBar
        avatar={MOCK_PROFILE.avatarUri}
        companyLogo={MOCK_PROFILE.companyLogoUri}
        hasUnread={MOCK_PROFILE.unreadNotifications}
        subtitle={activeCompany?.company.name ?? 'Muro General'}
      />

      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 28, color: theme.textPrimary }}>
            Muro General
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            {activeCompany ? 'Publicaciones de todo el club' : 'Requerimientos disponibles para tu perfil'}
          </ThemedText>
        </View>
        <View style={styles.titleActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mis publicaciones"
            onPress={() => router.push('/publicacion/mis-publicaciones')}
            style={[styles.iconButton, { backgroundColor: theme.surfaceInset }]}>
            <SymbolView tintColor={theme.textMuted} name={{ ios: 'list.bullet', android: 'list', web: 'list' }} size={18} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtrar publicaciones"
            onPress={() => setFiltersOpen(true)}
            style={[styles.iconButton, { backgroundColor: theme.surfaceInset }]}>
            <SymbolView
              tintColor={theme.textMuted}
              name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      {activeCompany !== undefined && activeCompany && <CategoryPills industries={catalog} selected={category} onSelect={setCategory} />}

      {error && (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar">
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center', marginTop: Spacing.three }}>
            {error} Tocá para reintentar.
          </ThemedText>
        </Pressable>
      )}

      {loadingInitial && !error && <ActivityIndicator color={theme.accent} style={styles.initialLoading} />}

      {!loadingInitial && (
        <FlatList
          data={items}
          keyExtractor={(post) => post.id}
          accessible={false}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          ListEmptyComponent={
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center', marginTop: Spacing.five }}>
              Todavía no hay publicaciones en este rubro.
            </ThemedText>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.accent} style={styles.footerLoading} /> : null}
          renderItem={({ item, index }) =>
            feed?.vista === 'COMPLETA' ? (
              <PostCard post={item as PostView} rubros={catalog} />
            ) : (
              <View accessibilityLabel={`Publicación ${index + 1} de ${items.length}`}>
                <PostCardBasic post={item as PostSinDetalleView} rubros={catalog} />
              </View>
            )
          }
        />
      )}

      {activeCompany !== undefined && activeCompany && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={blocked ? 'Publicar (empresa bloqueada)' : 'Publicar'}
          accessibilityHint={blocked ? 'Tu empresa está bloqueada y no puede publicar' : 'Abre el formulario para crear una nueva publicación'}
          onPress={onPublish}
          style={[styles.fab, { backgroundColor: blocked ? theme.textMuted : theme.accent, bottom: BottomTabInset + Spacing.three }]}>
          <SymbolView tintColor={theme.screenBackground} name={{ ios: 'plus', android: 'add', web: 'add' }} size={24} />
        </Pressable>
      )}

      <PostFiltersSheet
        visible={filtersOpen}
        initial={filters}
        industries={catalog}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  titleText: {
    flex: 1,
    gap: Spacing.half,
  },
  titleActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  initialLoading: {
    marginTop: Spacing.five,
  },
  footerLoading: {
    marginVertical: Spacing.three,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
