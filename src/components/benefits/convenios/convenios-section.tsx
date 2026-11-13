import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ConvenioCard } from '@/components/benefits/convenios/convenio-card';
import { coincide, loadConvenios, normalizar } from '@/components/benefits/convenios/convenios-data';
import { PartnerCtaCard } from '@/components/benefits/convenios/partner-cta-card';
import { SectionIntro } from '@/components/ui/section-intro';
import { StatTile } from '@/components/benefits/convenios/stat-tile';
import { CategoryPills, GENERAL_FEED } from '@/components/post/category-pills';
import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio } from '@/utils/api';

/** Segmento Convenios de Beneficios: intro, buscador, categorías y listado. */
export function ConveniosSection() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { active } = useActiveCompany();
  const companyId = active?.company.id;

  const [convenios, setConvenios] = useState<Convenio[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState(GENERAL_FEED);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return loadConvenios(token, companyId);
      })
      .then((lista) => {
        setConvenios(lista);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken, companyId]);

  // `active` pasa de undefined (cargando) a null (perfil básico) o a la empresa activa: sin
  // esperar, el primer pedido saldría sin companyId y todo vendría bloqueado.
  useEffect(() => {
    if (active === undefined) return;
    load();
  }, [active, load]);

  // Chips = categorías presentes en la lista, sin endpoint aparte.
  const categorias = useMemo(
    () => [...new Set(convenios?.map((c) => c.categoria))].map((c) => ({ codigo: c, nombre: c })),
    [convenios]
  );

  // ponytail: filtro en memoria (catálogo chico); pasar `categoria`/`q` a la API si la lista crece.
  const visibles = useMemo(() => {
    const q = normalizar(query.trim());
    return (convenios ?? []).filter((c) => (categoria === GENERAL_FEED || c.categoria === categoria) && coincide(c, q));
  }, [convenios, categoria, query]);

  const header = (
    <View style={styles.header}>
      <View style={styles.inset}>
        <SectionIntro
          overline="ALIANZAS CORPORATIVAS"
          title="Convenios Estratégicos"
          highlight="Estratégicos"
          description="Descuentos exclusivos y beneficios comerciales negociados para la red federada BizAInet.">
          {convenios && <StatTile value={String(convenios.length)} label="Activos" />}
        </SectionIntro>
      </View>
      <View style={styles.inset}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Buscar convenio, software, insumos..." />
      </View>
      <CategoryPills industries={categorias} selected={categoria} onSelect={setCategoria} allLabel="Todos los convenios" />
      {error && (
        <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Reintentar">
          <ThemedText style={[styles.message, { color: theme.textMuted }]}>{error} Toca para reintentar.</ThemedText>
        </Pressable>
      )}
      {!convenios && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}
    </View>
  );

  return (
    <FlatList
      data={visibles}
      keyExtractor={(c) => c.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      ListEmptyComponent={
        convenios ? (
          <ThemedText style={[styles.message, { color: theme.textMuted }]}>No hay convenios que coincidan con tu búsqueda.</ThemedText>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.inset}>
          <ConvenioCard convenio={item} onPress={() => router.push({ pathname: '/beneficios/convenio/[id]', params: { id: item.id } })} />
        </View>
      )}
      ListFooterComponent={
        convenios ? (
          <View style={styles.inset}>
            <PartnerCtaCard />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.three,
  },
  inset: {
    paddingHorizontal: Spacing.three,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  loading: {
    marginTop: Spacing.five,
  },
});
