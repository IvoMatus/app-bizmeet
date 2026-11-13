import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { BenefitCover } from '@/components/benefits/shared/benefit-cover';
import { CapacityBar } from '@/components/benefits/eventos/capacity-bar';
import { EventoPills } from '@/components/benefits/eventos/evento-pills';
import { fechaCorta, type Evento } from '@/components/benefits/eventos/eventos-data';
import { PriceSplit } from '@/components/benefits/eventos/price-split';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Card grande de "Destacado de la semana": foto, precios, cupos y "Reservar Cupo". */
export function EventoDestacadoCard({ evento, onPress }: { evento: Evento; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Evento destacado: ${evento.titulo}. ${evento.lugar}, ${fechaCorta(evento.fecha)}`}
      accessibilityHint="Abre el detalle del evento"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, opacity: pressed ? 0.95 : 1 },
      ]}>
      <BenefitCover
        uri={evento.imagenUrl}
        height={170}
        fallbackIcon={{ ios: 'person.3.fill', android: 'groups', web: 'groups' }}
        top={<EventoPills evento={evento} onImage />}
      />
      <View style={styles.body}>
        <ThemedText type="h3" style={{ color: theme.textPrimary }}>
          {evento.titulo}
        </ThemedText>
        <View style={styles.meta}>
          <SymbolView tintColor={theme.accentText} name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={14} />
          <ThemedText type="small" style={[styles.flex, { color: theme.textMuted }]}>
            {evento.lugar} • {fechaCorta(evento.fecha)}
          </ThemedText>
        </View>
        {evento.destacado && (
          <PriceSplit
            miembro={{ label: 'MEMBRESÍA BIZAINET', valor: evento.destacado.precioMiembro }}
            publico={{ label: 'PÚBLICO GENERAL', valor: evento.destacado.precioPublico }}
          />
        )}
        <CapacityBar reservados={evento.cupos.reservados} total={evento.cupos.total} />
        <BenefitButton label="Reservar Cupo" arrow onPress={onPress} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  flex: {
    flex: 1,
  },
});
