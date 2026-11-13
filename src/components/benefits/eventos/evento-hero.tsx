import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { BenefitCover } from '@/components/benefits/shared/benefit-cover';
import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { partesFecha, type Evento } from '@/components/benefits/eventos/eventos-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Caja de fecha "DIC / 14 / 2026". */
export function DateBadge({ iso }: { iso: string }) {
  const theme = useTheme();
  const { mes, dia, anio } = partesFecha(iso);

  return (
    <View accessible accessibilityLabel={`${dia} ${mes} ${anio}`} style={[styles.date, { backgroundColor: theme.surface }]}>
      <ThemedText type="smallBold" style={[styles.month, { color: theme.accentText }]}>
        {mes}
      </ThemedText>
      <ThemedText type="h2" style={{ color: theme.textPrimary }}>
        {dia}
      </ThemedText>
      <ThemedText type="small" style={[styles.year, { color: theme.textMuted }]}>
        {anio}
      </ThemedText>
    </View>
  );
}

/** Hero del detalle de evento: foto, "INSCRIPCIONES ABIERTAS", fecha y aforo. */
export function EventoHero({ evento }: { evento: Evento }) {
  const theme = useTheme();
  const quedan = evento.cupos.total - evento.cupos.reservados;
  const aforo = evento.modalidad === 'PRESENCIAL' ? 'Aforo Presencial Limitado' : 'Cupos Online Limitados';

  return (
    <BenefitCover
      uri={evento.imagenUrl}
      height={230}
      style={styles.hero}
      fallbackIcon={{ ios: 'person.3.fill', android: 'groups', web: 'groups' }}
      top={
        <View style={styles.topRow}>
          <BenefitPill label="INSCRIPCIONES ABIERTAS" bg={theme.surface} fg={theme.textPrimary} dot={theme.success} />
          <DateBadge iso={evento.fecha} />
        </View>
      }
      bottom={
        <View style={[styles.aforo, { backgroundColor: theme.navBackground }]}>
          <SymbolView tintColor={theme.accentText} name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }} size={14} />
          <ThemedText type="smallBold" style={[styles.flex, { color: theme.textPrimary }]}>
            {aforo} • Quedan {quedan} cupos
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 16,
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  date: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  month: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
  },
  year: {
    fontSize: 12,
    lineHeight: 16,
  },
  aforo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  flex: {
    flex: 1,
  },
});
