import { StyleSheet, View } from 'react-native';

import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { DetailCard } from '@/components/benefits/shared/detail-card';
import { HighlightedTitle } from '@/components/ui/highlighted-title';
import { HighlightTile } from '@/components/benefits/convenios/highlight-tile';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio } from '@/utils/api';

/** Card principal del detalle: etiquetas, título (proveedor resaltado), descripción y destacados. */
export function ConvenioSummaryCard({ convenio }: { convenio: Convenio }) {
  const theme = useTheme();
  const etiquetas = [convenio.categoria.toUpperCase(), ...(convenio.etiquetas ?? [])];

  return (
    <DetailCard>
      <View style={styles.wrap}>
        {etiquetas.map((etiqueta) => (
          <BenefitPill key={etiqueta} label={etiqueta} bg={theme.accentSoft} fg={theme.accentText} />
        ))}
      </View>
      <View style={styles.titles}>
        <HighlightedTitle type="h2" text={convenio.nombre} highlight={convenio.proveedor} />
        <ThemedText type="smallBold" style={{ color: theme.accentText }}>
          {convenio.subtitulo}
        </ThemedText>
      </View>
      <ThemedText type="body" style={{ color: theme.textMuted }}>
        {convenio.descripcionLarga ?? convenio.descripcion}
      </ThemedText>
      {convenio.destacados && (
        <View style={styles.wrap}>
          {convenio.destacados.map((d) => (
            <HighlightTile key={d.label} icono={d.icono} label={d.label} valor={d.valor} />
          ))}
        </View>
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  titles: {
    gap: Spacing.one,
  },
});
