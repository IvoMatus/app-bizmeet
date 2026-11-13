import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { BenefitButton, type BenefitButtonVariant } from '@/components/benefits/shared/benefit-button';
import { EventoPills } from '@/components/benefits/eventos/evento-pills';
import { fechaCorta, type AccesoEvento, type Evento } from '@/components/benefits/eventos/eventos-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** El pie sale de `acceso`: una sola card, tres variantes de CTA. */
const CTA: Record<AccesoEvento, { label: string; variant: BenefitButtonVariant; icon?: SymbolViewProps['name']; arrow?: boolean }> = {
  GRATIS: { label: 'Inscribirme Gratis', variant: 'success' },
  PAGO: { label: 'Comprar Entrada', variant: 'dark', icon: { ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' } },
  RESERVA: { label: 'Reservar Lugar', variant: 'primary', arrow: true },
};

/** Card de "Próximos Eventos". */
export function EventoCard({ evento, onPress }: { evento: Evento; onPress: () => void }) {
  const theme = useTheme();
  const cta = CTA[evento.acceso];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${evento.titulo}. ${fechaCorta(evento.fecha)}. ${evento.accesoLabel}`}
      accessibilityHint="Abre el detalle del evento"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, opacity: pressed ? 0.95 : 1 },
      ]}>
      <View style={styles.pills}>
        <EventoPills evento={evento} />
      </View>

      <ThemedText type="h3" style={[styles.title, { color: theme.textPrimary }]}>
        {evento.titulo}
      </ThemedText>

      <View style={styles.metaList}>
        <View style={styles.meta}>
          <SymbolView tintColor={theme.accentText} name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={14} />
          <ThemedText type="small" style={[styles.flex, { color: theme.textMuted }]}>
            {fechaCorta(evento.fecha)}
          </ThemedText>
        </View>
        <View style={styles.meta}>
          <SymbolView
            tintColor={evento.metaUrgente ? theme.warningAccent : theme.accentText}
            name={
              evento.metaUrgente
                ? { ios: 'hourglass', android: 'hourglass_top', web: 'hourglass_top' }
                : { ios: 'person.2.fill', android: 'group', web: 'group' }
            }
            size={14}
          />
          <ThemedText
            type={evento.metaUrgente ? 'smallBold' : 'small'}
            style={[styles.flex, { color: evento.metaUrgente ? theme.textPrimary : theme.textMuted }]}>
            {evento.meta}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.surfaceBorder }]}>
        <View style={styles.flex}>
          {evento.acceso === 'PAGO' && evento.precio !== undefined ? (
            <View style={styles.price}>
              <ThemedText type="h3" style={{ color: theme.textPrimary }}>
                MXN {evento.precio}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
                IVA incl.
              </ThemedText>
            </View>
          ) : (
            evento.pie && (
              <View style={styles.meta}>
                <View style={[styles.dot, { backgroundColor: theme.success }]} />
                <View style={styles.flex}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary, fontSize: 13 }}>
                    {evento.pie.titulo}
                  </ThemedText>
                  {evento.pie.texto && (
                    <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
                      {evento.pie.texto}
                    </ThemedText>
                  )}
                </View>
              </View>
            )
          )}
        </View>
        <BenefitButton label={cta.label} variant={cta.variant} icon={cta.icon} arrow={cta.arrow} onPress={onPress} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  metaList: {
    gap: Spacing.one,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  price: {
    gap: 0,
  },
});
