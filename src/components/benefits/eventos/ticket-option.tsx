import { Pressable, StyleSheet, View } from 'react-native';

import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { precioLabel, type EntradaEvento } from '@/components/benefits/eventos/eventos-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "Selecciona tu Entrada · Paso 1 de 2" + el grupo de radio cards. */
export function TicketSelector({
  entradas,
  selectedId,
  onSelect,
}: {
  entradas: EntradaEvento[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.selector}>
      <View style={styles.heading}>
        <ThemedText type="h3" accessibilityRole="header" style={{ color: theme.textPrimary }}>
          Selecciona tu Entrada
        </ThemedText>
        {/* ponytail: el paso 2 (pago/QR) es Fase 2 — el indicador queda por fidelidad al diseño. */}
        <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
          Paso 1 de 2
        </ThemedText>
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de entrada" style={styles.selector}>
        {entradas.map((entrada) => (
          <TicketOption key={entrada.id} entrada={entrada} selected={entrada.id === selectedId} onSelect={() => onSelect(entrada.id)} />
        ))}
      </View>
    </View>
  );
}

/** Radio card de "Selecciona tu Entrada". La `popular` va con borde de acento aunque no esté elegida. */
export function TicketOption({ entrada, selected, onSelect }: { entrada: EntradaEvento; selected: boolean; onSelect: () => void }) {
  const theme = useTheme();
  const gratis = entrada.precio === 0;
  const destacada = selected || !!entrada.popular;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${entrada.nombre}, ${precioLabel(entrada.precio)}. ${entrada.descripcion}. ${entrada.cupos}`}
      onPress={onSelect}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: destacada ? theme.accentText : theme.surfaceBorder,
          borderWidth: selected ? 2 : 1,
        },
      ]}>
      {entrada.popular && (
        <BenefitPill
          label={entrada.popular}
          bg={theme.successSurface}
          fg={theme.textPrimary}
          iconColor={theme.success}
          icon={{ ios: 'rosette', android: 'military_tech', web: 'military_tech' }}
        />
      )}

      <View style={styles.row}>
        <View style={[styles.radio, { borderColor: selected ? theme.accentText : theme.textMuted }]}>
          {selected && <View style={[styles.radioDot, { backgroundColor: theme.accentText }]} />}
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold" style={[styles.name, { color: theme.textPrimary }]}>
            {entrada.nombre}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 13, lineHeight: 18 }}>
            {entrada.descripcion}
          </ThemedText>
        </View>
        <View style={styles.price}>
          {entrada.etiquetaPrecio && (
            <ThemedText type="smallBold" style={[styles.priceTag, { color: theme.accentText }]}>
              {entrada.etiquetaPrecio}
            </ThemedText>
          )}
          {entrada.precioLista !== undefined && (
            <ThemedText type="small" style={[styles.strike, { color: theme.textMuted }]}>
              MXN {entrada.precioLista}
            </ThemedText>
          )}
          <ThemedText type="h3" style={{ color: gratis ? theme.successStrong : theme.textPrimary }}>
            {precioLabel(entrada.precio)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.surfaceBorder }]}>
        <View style={[styles.cupos, { backgroundColor: theme.surfaceInset }]}>
          <View style={[styles.dot, { backgroundColor: theme.success }]} />
          <ThemedText type="small" style={[styles.small, { color: theme.textPrimary }]}>
            {entrada.cupos}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={[styles.small, styles.note, { color: theme.textMuted }]}>
          {entrada.nota}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selector: {
    gap: Spacing.three,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flex: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  price: {
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  priceTag: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'right',
  },
  strike: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  cupos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 9999,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },
  note: {
    textAlign: 'right',
  },
});
