import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { CompanyCard } from '@/components/company/company-card';
import { CompanyIcon } from '@/components/company/company-icons';
import { toCompany, type Company } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchMyCompanies } from '@/utils/api';

export default function EmpresaScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchMyCompanies(token);
      })
      .then((mine) => {
        setCompanies(mine.map(toCompany));
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTopBar
        avatar={MOCK_PROFILE.avatarUri}
        companyLogo={MOCK_PROFILE.companyLogoUri}
        hasUnread={MOCK_PROFILE.unreadNotifications}
        subtitle="Mis Empresas"
      />

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
          <Pressable onPress={load}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
          </Pressable>
        )}

        {!companies && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

        {companies?.length === 0 && (
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>Todavía no formás parte de ninguna empresa.</ThemedText>
        )}

        {companies?.map((company) => (
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
