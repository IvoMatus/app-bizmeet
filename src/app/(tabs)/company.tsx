import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { ProfileTopBar } from '@/components/profile/profile-chrome';
import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { CompanyCard } from '@/components/company/company-card';
import { CompanyIcon } from '@/components/company/company-icons';
import { MOCK_COMPANIES } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function EmpresaScreen() {
  const theme = useTheme();

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
          onPress={() => {
            // TODO: navegar a alta de empresa cuando exista la ruta
          }}
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.accentStrong, opacity: pressed ? 0.85 : 1 }]}>
          <CompanyIcon name="register" color={theme.screenBackground} width={18} height={16} />
          <ThemedText style={[styles.ctaLabel, { color: theme.screenBackground }]}>+ Registrar Nueva Empresa</ThemedText>
        </Pressable>

        {MOCK_COMPANIES.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </ScrollView>

      <BottomTabBar avatar={MOCK_PROFILE.avatarUri} companyLogo={MOCK_PROFILE.companyLogoUri} activeKey="company" />
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
});
