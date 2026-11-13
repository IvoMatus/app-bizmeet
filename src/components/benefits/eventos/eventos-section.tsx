import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { EventoCard } from '@/components/benefits/eventos/evento-card';
import { EventoDestacadoCard } from '@/components/benefits/eventos/evento-destacado-card';
import { buscarEventos, FILTROS_EVENTO } from '@/components/benefits/eventos/eventos-data';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CategoryPills, GENERAL_FEED } from '@/components/post/category-pills';
import { ThemedText } from '@/components/themed-text';
import { SearchField } from '@/components/ui/search-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const abrirEvento = (id: string) => router.push({ pathname: '/beneficios/evento/[id]', params: { id } });

/** Segmento Eventos de Beneficios (mock): buscador, filtros, destacado y próximos. */
export function EventosSection() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState(GENERAL_FEED);

  const eventos = useMemo(() => buscarEventos(filtro, query), [filtro, query]);
  const destacado = eventos.find((e) => e.destacado);
  const proximos = eventos.filter((e) => e !== destacado);

  const header = (
    <View style={styles.header}>
      <View style={styles.inset}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Buscar conferencias, cumbres, webinars..." />
      </View>
      <CategoryPills industries={FILTROS_EVENTO} selected={filtro} onSelect={setFiltro} allLabel="Todos" />

      {destacado?.destacado && (
        <View style={[styles.inset, styles.block]}>
          <View style={styles.headingRow}>
            <Eyebrow label="DESTACADO DE LA SEMANA" color={theme.accentText} />
            <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
              {destacado.destacado.edicion}
            </ThemedText>
          </View>
          <EventoDestacadoCard evento={destacado} onPress={() => abrirEvento(destacado.id)} />
        </View>
      )}

      <View style={[styles.inset, styles.headingRow]}>
        <ThemedText type="h3" accessibilityRole="header" style={{ color: theme.textPrimary }}>
          Próximos Eventos
        </ThemedText>
        <BenefitPill label={`${proximos.length} Disponibles`} bg={theme.accentSoft} fg={theme.accentText} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={proximos}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <ThemedText style={[styles.inset, styles.empty, { color: theme.textMuted }]}>
          No hay eventos que coincidan con tu búsqueda.
        </ThemedText>
      }
      renderItem={({ item }) => (
        <View style={styles.inset}>
          <EventoCard evento={item} onPress={() => abrirEvento(item.id)} />
        </View>
      )}
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
  block: {
    gap: Spacing.two,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  empty: {
    textAlign: 'center',
  },
});
