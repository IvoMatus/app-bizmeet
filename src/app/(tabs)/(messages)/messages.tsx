import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ConversationRow, ConversationRowSkeleton } from '@/components/messages/conversation-row';
import { QuotaCard } from '@/components/messages/quota-card';
import { StatusPill } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SkeletonGroup } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import { fetchConversations, type Bandeja } from '@/utils/api';

type Filter = 'todas' | 'no-leidos';

/** Bandeja de Mensajes (Figma 2046:1122 claro / 2046:1696 oscuro). Se refresca al tomar foco y
 * con pull-to-refresh; el polling vive solo en la conversación abierta. */
export default function MensajesScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { active } = useActiveCompany();
  const companyId = active?.company.id;
  // De qué empresa es la bandeja cargada: al cambiar la empresa activa no se muestra la anterior.
  const [loaded, setLoaded] = useState<{ companyId: string; bandeja: Bandeja } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const load = useCallback(async () => {
    if (!companyId) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      setLoaded({ companyId, bandeja: await fetchConversations(companyId, token) });
      setError(null);
    } catch (e) {
      // Si falla un refresco, la bandeja ya cargada se queda: solo se muestra el error.
      setError((e as Error).message);
    }
  }, [companyId, getToken]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function onRefresh() {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }

  const bandeja = loaded && loaded.companyId === companyId ? loaded.bandeja : null;
  const all = bandeja?.items ?? [];
  const unread = all.reduce((sum, item) => sum + item.noLeidos, 0);
  const q = query.trim().toLowerCase();
  const items = all.filter(
    (item) =>
      (filter === 'todas' || item.noLeidos > 0) &&
      (!q || [item.contraparte.empresa?.name, item.contraparte.nombre, item.ultimoMensaje.vistaPrevia].some((s) => s?.toLowerCase().includes(q)))
  );

  if (active === null) {
    return (
      <View style={[styles.screen, styles.padded, { backgroundColor: theme.screenBackground }]}>
        <ThemedText style={[styles.centered, { color: theme.textMuted }]}>Crea tu empresa para conversar con otras empresas del club.</ThemedText>
        <Pressable accessibilityRole="link" onPress={() => router.push('/empresa/crear')} style={styles.link}>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>
            Crear empresa
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  const header = (
    <View style={styles.header}>
      <View>
        <View style={styles.titleRow}>
          <ThemedText type="h1" accessibilityRole="header" style={{ color: theme.textPrimary }}>
            Mensajes
          </ThemedText>
          {unread > 0 && <StatusPill label={`${unread} sin leer`} variant="accent" />}
        </View>
        <ThemedText type="small" style={{ color: theme.textMuted }}>
          Comunicaciones Corporativas Verificadas
        </ThemedText>
      </View>
      {bandeja && <QuotaCard cupo={bandeja.cupo} />}
      <SearchField value={query} onChangeText={setQuery} placeholder="Buscar conversaciones" />
      <SegmentedControl<Filter>
        accessibilityLabel="Filtrar conversaciones"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'todas', label: 'Todas', badge: all.length ? String(all.length) : undefined },
          {
            value: 'no-leidos',
            label: 'No leídos',
            icon: unread > 0 ? <View style={[styles.dot, { backgroundColor: filter === 'no-leidos' ? theme.onButtonDark : theme.accent }]} /> : undefined,
          },
        ]}
      />
      {error && (
        <Pressable onPress={load} accessibilityRole="button" accessibilityLabel={`${error} Reintentar`} accessibilityLiveRegion="polite">
          <ThemedText style={[styles.centered, { color: theme.textMuted }]}>{error} Toca para reintentar.</ThemedText>
        </Pressable>
      )}
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      style={[styles.screen, { backgroundColor: theme.screenBackground }]}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} progressBackgroundColor={theme.surface} />
      }
      ListEmptyComponent={
        !bandeja ? (
          error ? null : (
            <SkeletonGroup label="Cargando conversaciones" style={styles.skeletons}>
              <ConversationRowSkeleton />
              <ConversationRowSkeleton />
              <ConversationRowSkeleton />
            </SkeletonGroup>
          )
        ) : all.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary, textAlign: 'center' }}>
              Aún no tienes conversaciones
            </ThemedText>
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/')} style={styles.link}>
              <ThemedText type="small" style={{ color: theme.accentText, textAlign: 'center' }}>
                Contacta a una empresa desde una publicación del Muro
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <ThemedText accessibilityLiveRegion="polite" style={[styles.centered, { color: theme.textMuted }]}>
            No hay conversaciones con este filtro
          </ThemedText>
        )
      }
      renderItem={({ item }) => (
        <ConversationRow item={item} onPress={() => router.push({ pathname: '/conversacion/[id]', params: { id: item.id } })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  padded: {
    padding: Spacing.three,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skeletons: {
    gap: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  centered: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
