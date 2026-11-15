import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CompanyCard } from '@/components/company/company-card';
import { CompanyIcon } from '@/components/company/company-icons';
import { toCompany } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useTheme } from '@/hooks/use-theme';

export default function EmpresaScreen() {
  const theme = useTheme();
  // Comparte el mismo fetch de GET /companies/mine que el resto de la app (ver app-tabs.tsx);
  // el selector de empresa activa en sí vive en el header (CompanySwitcherSheet, T2.5), no acá.
  const { companies, error, reload } = useActiveCompany();

  const mapped = useMemo(() => companies?.map(toCompany) ?? null, [companies]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar Nueva Empresa"
          onPress={() => router.push('/empresa/crear')}
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.accentStrong, opacity: pressed ? 0.85 : 1 }]}>
          <CompanyIcon name="register" color={theme.screenBackground} width={18} height={16} />
          <ThemedText style={[styles.ctaLabel, { color: theme.screenBackground }]}>+ Registrar Nueva Empresa</ThemedText>
        </Pressable>

        {error && (
          <Pressable onPress={reload}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Toca para reintentar.</ThemedText>
          </Pressable>
        )}

        {mapped === null && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {mapped?.length === 0 && (
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>Todavía no formas parte de ninguna empresa.</ThemedText>
        )}

        {mapped?.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 48,
    borderRadius: 12,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  loading: {
    marginTop: Spacing.four,
  },
});
