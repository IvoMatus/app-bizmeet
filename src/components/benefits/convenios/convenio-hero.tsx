import { StyleSheet } from 'react-native';

import { BenefitCover } from '@/components/benefits/shared/benefit-cover';
import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { ProviderBadge } from '@/components/benefits/convenios/provider-badge';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio } from '@/utils/api';

/** Hero del detalle: portada con destacado + "ACTIVO <año de vigencia>" y caja de proveedor. */
export function ConvenioHero({ convenio }: { convenio: Convenio }) {
  const theme = useTheme();
  const anio = new Date(convenio.vigenciaHasta).getUTCFullYear();

  return (
    <BenefitCover
      uri={convenio.imagenUrl}
      height={210}
      style={styles.hero}
      fallbackIcon={{ ios: 'briefcase.fill', android: 'business_center', web: 'business_center' }}
      top={
        <>
          {convenio.destacado && (
            <BenefitPill
              label={convenio.destacado}
              bg={theme.surface}
              fg={theme.textPrimary}
              iconColor={theme.accentText}
              icon={{ ios: 'star.circle.fill', android: 'stars', web: 'stars' }}
            />
          )}
          <BenefitPill
            label={`ACTIVO ${anio}`}
            bg={theme.surface}
            fg={theme.textPrimary}
            iconColor={theme.success}
            icon={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
          />
        </>
      }
      bottom={<ProviderBadge proveedor={convenio.proveedor} logoUrl={convenio.logoUrl} caption={convenio.etiquetaPartner} />}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 16,
  },
});
