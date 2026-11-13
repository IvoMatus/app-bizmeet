import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivationCodeCard } from '@/components/benefits/convenios/activation-code-card';
import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { ConvenioHero } from '@/components/benefits/convenios/convenio-hero';
import { ConvenioSummaryCard } from '@/components/benefits/convenios/convenio-summary-card';
import { avisoBloqueo, loadConvenio } from '@/components/benefits/convenios/convenios-data';
import { DetailCard } from '@/components/benefits/shared/detail-card';
import { DetailList } from '@/components/benefits/shared/detail-list';
import { Eyebrow } from '@/components/ui/eyebrow';
import { ShareButton } from '@/components/benefits/shared/share-button';
import { TrustSeal } from '@/components/benefits/convenios/trust-seal';
import { useRevelarConvenio } from '@/components/benefits/convenios/use-revelar-convenio';
import { DetailHeader } from '@/components/navigation/detail-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio } from '@/utils/api';

export default function ConvenioDetalleScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { active } = useActiveCompany();
  const companyId = active?.company.id;
  const [convenio, setConvenio] = useState<Convenio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { secreto, loading, usar } = useRevelarConvenio(convenio);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return loadConvenio(id, token, companyId);
      })
      .then((next) => {
        setConvenio(next);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken, id, companyId]);

  useEffect(() => {
    if (active === undefined) return;
    load();
  }, [active, load]);

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <DetailHeader title="Detalle Convenio" />

        {error && (
          <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Reintentar">
            <ThemedText style={[styles.message, { color: theme.textMuted }]}>{error} Toca para reintentar.</ThemedText>
          </Pressable>
        )}
        {!convenio && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {convenio && (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.topRow}>
              <Eyebrow label="Canje oficial verificado" />
              <ShareButton
                label="Compartir convenio"
                message={`${convenio.nombre} (${convenio.proveedor}): ${convenio.descripcion} Convenio exclusivo de la red BizAInet.`}
              />
            </View>

            <ConvenioHero convenio={convenio} />
            <ConvenioSummaryCard convenio={convenio} />
            <ActivationCodeCard convenio={convenio} secreto={secreto} loading={loading} onUsar={usar} />

            {convenio.elegibilidad && (
              <DetailCard title="Condiciones de Elegibilidad" icon={{ ios: 'checklist', android: 'fact_check', web: 'fact_check' }}>
                <DetailList marker="bullet" items={convenio.elegibilidad} />
              </DetailCard>
            )}
            {convenio.pasos && (
              <DetailCard title="¿Cómo activar tu convenio?" icon={{ ios: 'point.topleft.down.to.point.bottomright.curvepath', android: 'route', web: 'route' }}>
                <DetailList marker="number" items={convenio.pasos} />
              </DetailCard>
            )}

            <BenefitButton
              label="Solicitar Acreditación Directa"
              icon={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
              loading={loading}
              locked={convenio.bloqueado}
              accessibilityHint={convenio.bloqueado ? avisoBloqueo(convenio) : undefined}
              onPress={usar}
              style={styles.cta}
            />
            <TrustSeal text="Verificación instantánea BizAInet Partner Trust" />
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cta: {
    minHeight: 52,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  loading: {
    marginTop: Spacing.five,
  },
});
