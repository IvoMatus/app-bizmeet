import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CompanyIcon } from '@/components/company/company-icons';
import type { Company } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const PLAN_LABEL: Record<Company['planType'], string> = {
  EMPRENDIMIENTO: 'Emprendimiento',
  EMPRESA: 'Empresa',
  PREMIUM: 'Premium',
};

export const TIPO_LABEL: Record<Company['tipo'], string> = {
  CLUB: 'Club',
  CLIENTE: 'Cliente',
  PARTNER: 'Partner',
};

/** Badge pequeño con ícono + texto (Verificado, Titular · Admin, Invitado). Ícono opcional
 * para reusarlo en badges de texto solo (ACTIVO, MÁS POPULAR, PLAN ACTUAL en Planes). */
export function Badge({
  icon,
  label,
  bg,
  fg,
}: {
  icon?: Parameters<typeof CompanyIcon>[0]['name'];
  label: string;
  bg: string;
  fg: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <CompanyIcon name={icon} color={fg} width={11} height={11} />}
      <ThemedText style={[styles.badgeLabel, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

/** Tarjeta de empresa del listado "Mis Empresas": nombre, badges, meta y acciones. */
export function CompanyCard({ company }: { company: Company }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
      <View style={styles.headerText}>
        <ThemedText style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
          {company.name}
        </ThemedText>
        <View style={styles.badgeRow}>
          {company.verified && <Badge icon="verified-check" label="Verificado" bg={theme.seekIconSoft} fg={theme.success} />}
          <Badge icon={company.roleBadge.icon} label={company.roleBadge.label} bg={theme.buttonDark} fg={theme.accent} />
        </View>
      </View>

      <ThemedText style={[styles.meta, { color: theme.textMuted }]}>
        {TIPO_LABEL[company.tipo]} · {company.industry} · Plan {PLAN_LABEL[company.planType]}
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${company.name}`}
        onPress={() => router.push(`/empresa/${company.id}`)}
        style={({ pressed }) => [styles.detailsButton, { backgroundColor: theme.buttonDark, opacity: pressed ? 0.85 : 1 }]}>
        <ThemedText style={[styles.detailsLabel, { color: theme.accent }]}>Ver detalles de empresa</ThemedText>
        <CompanyIcon name="arrow-right" color={theme.accent} width={12} height={12} />
      </Pressable>

      {company.isTitular && (
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${company.name}`}
            onPress={() => {
              // TODO: navegar a editar empresa cuando exista la ruta
            }}
            style={({ pressed }) => [styles.secondaryButton, { backgroundColor: theme.surfaceInset, opacity: pressed ? 0.85 : 1 }]}>
            <CompanyIcon name="edit" color={theme.textMuted} width={12} height={12} />
            <ThemedText style={[styles.secondaryLabel, { color: theme.textMuted }]}>Editar</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Gestionar equipo de ${company.name}`}
            onPress={() => {
              // TODO: navegar a gestión de equipo cuando exista la ruta
            }}
            style={({ pressed }) => [styles.secondaryButton, { backgroundColor: theme.surfaceInset, opacity: pressed ? 0.85 : 1 }]}>
            <CompanyIcon name="team" color={theme.textMuted} width={13} height={11} />
            <ThemedText style={[styles.secondaryLabel, { color: theme.textMuted }]}>Gestionar equipo</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerText: {
    gap: Spacing.two,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half + 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 44,
    borderRadius: 8,
  },
  detailsLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half + 2,
    height: 40,
    borderRadius: 8,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
