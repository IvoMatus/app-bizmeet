import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthToken } from '@/hooks/use-auth-token';

import { PLAN_LABEL } from '@/components/company/company-card';
import { CompanyIcon } from '@/components/company/company-icons';
import { RegisterHeader } from '@/components/register/register-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCompany, fetchPlans, type CompanyDetail, type PlanCatalogEntry } from '@/utils/api';

const TIPO_LABEL: Record<CompanyDetail['tipo'], string> = {
  CLUB: 'Club',
  CLIENTE: 'Cliente',
  PARTNER: 'Partner',
};

const FORMA_JURIDICA_LABEL: Record<NonNullable<CompanyDetail['formaJuridica']>, string> = {
  JURIDICA: 'Jurídica',
  NATURAL: 'Natural',
};

function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText style={[styles.badgeLabel, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.dataRow}>
      <ThemedText style={[styles.dataLabel, { color: theme.textMuted }]}>{label}</ThemedText>
      <ThemedText style={[styles.dataValue, { color: theme.textPrimary }]}>{value}</ThemedText>
    </View>
  );
}

export default function EmpresaDetalleScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [plans, setPlans] = useState<PlanCatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then(async (token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        const [company, plans] = await Promise.all([fetchCompany(id, token), fetchPlans(token)]);
        setCompany(company);
        setPlans(plans);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  const breadcrumb = company ? `Empresas / ${company.name}` : 'Empresas';

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <RegisterHeader title={breadcrumb} onBack={() => router.back()} />

        {error && (
          <Pressable onPress={load}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Toca para reintentar.</ThemedText>
          </Pressable>
        )}

        {!company && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {company && (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
              <ThemedText style={[styles.name, { color: theme.textPrimary }]}>{company.name}</ThemedText>
              <View style={styles.badgeRow}>
                {company.verified && <Badge label="Verificado" bg={theme.seekIconSoft} fg={theme.success} />}
                <Badge label={`Plan ${PLAN_LABEL[company.plan]}`} bg={theme.buttonDark} fg={theme.accent} />
                {company.formaJuridica && (
                  <Badge label={FORMA_JURIDICA_LABEL[company.formaJuridica]} bg={theme.buttonDark} fg={theme.accent} />
                )}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textPrimary }]}>Datos Corporativos & Fiscales</ThemedText>
              <DataRow label="RFC" value={company.rfc} />
              <DataRow label="Industria" value={company.industry} />
              <DataRow label="Tipo" value={TIPO_LABEL[company.tipo]} />
              <DataRow label="Plan" value={PLAN_LABEL[company.plan]} />
              {company.estado === 'PENDIENTE_PAGO' ? (
                <ThemedText style={{ color: theme.warningText }}>
                  El pago todavía no se confirma: hasta que se acredite, la empresa opera con los derechos de perfil
                  básico aunque el plan elegido sea {PLAN_LABEL[company.plan]}.
                </ThemedText>
              ) : (
                (() => {
                  // `plans` no trae RED_PRIVADA (no es contratable) — ahí no hay catálogo que mostrar.
                  const catalog = plans?.find((p) => p.code === company.plan);
                  if (!catalog) return null;
                  return (
                    <>
                      <DataRow label="Precio mensual" value={`$${catalog.precioUsdMes} USD`} />
                      <DataRow label="Publicaciones por tipo al mes" value={String(catalog.cupos.publicacionesPorTipoMes)} />
                      <DataRow label="Conversaciones iniciadas al mes" value={String(catalog.cupos.iniciarConversacionesMes)} />
                      <DataRow label="Sugerencias al mes" value={String(catalog.cupos.sugerenciasMes)} />
                      <DataRow label="Contactos de equipo" value={String(catalog.cupos.contactos)} />
                    </>
                  );
                })()
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar plan"
                onPress={() => router.push(`/empresa/plan?companyId=${company.id}`)}
                style={({ pressed }) => [styles.detailsButton, { backgroundColor: theme.buttonDark, opacity: pressed ? 0.85 : 1 }]}>
                <ThemedText style={[styles.detailsLabel, { color: theme.accent }]}>Cambiar plan</ThemedText>
                <CompanyIcon name="arrow-right" color={theme.accent} width={12} height={12} />
              </Pressable>
            </View>

            {company.documentos.length > 0 && (
              <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
                <ThemedText style={[styles.sectionTitle, { color: theme.textPrimary }]}>Documentos</ThemedText>
                {company.documentos.map((doc, index) => (
                  <View key={`${doc.tipo}-${index}`} style={styles.docRow}>
                    <CompanyIcon name="tag" color={theme.accent} width={13} height={13} />
                    <ThemedText style={[styles.docLabel, { color: theme.textPrimary }]}>{doc.tipo}</ThemedText>
                  </View>
                ))}
              </View>
            )}
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
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  loading: {
    marginTop: Spacing.four,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  dataLabel: {
    fontSize: 13,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  docLabel: {
    fontSize: 13,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 44,
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  detailsLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
