import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { CompanyIcon } from '@/components/company/company-icons';
import type { Company } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Badge pequeño con ícono + texto (Verificado IA, Titular · Admin, Empresa Invitada, Rol). */
function Badge({ icon, label, bg, fg }: { icon: Parameters<typeof CompanyIcon>[0]['name']; label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <CompanyIcon name={icon} color={fg} width={11} height={11} />
      <ThemedText style={[styles.badgeLabel, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

/** Pastilla de métrica: ícono circular + label + valor (Ofrecemos/Buscamos), o + avatares (Contactos). */
function MetricPill({
  icon,
  label,
  value,
  bg,
  iconBg,
  fg,
  children,
}: {
  icon: Parameters<typeof CompanyIcon>[0]['name'];
  label: string;
  value?: string;
  bg: string;
  iconBg: string;
  fg: string;
  children?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.metricPill, { backgroundColor: bg }]}>
      <View style={styles.metricLeft}>
        <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
          <CompanyIcon name={icon} color={fg} width={14} height={14} />
        </View>
        <ThemedText style={[styles.metricLabel, { color: theme.textMuted }]}>{label}</ThemedText>
      </View>
      {value ? (
        <ThemedText style={[styles.metricValue, { color: fg }]}>{value}</ThemedText>
      ) : (
        children
      )}
    </View>
  );
}

/** Tarjeta de empresa del listado "Mis Empresas": encabezado, resumen, métricas y acciones. */
export function CompanyCard({ company }: { company: Company }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.surfaceBorder }]}>
      <View style={styles.header}>
        <Image source={company.logoUri} accessibilityLabel={`Logo de ${company.name}`} style={styles.logo} contentFit="cover" />
        <View style={styles.headerText}>
          <ThemedText style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
            {company.name}
          </ThemedText>
          <View style={styles.badgeRow}>
            {company.verifiedScore && (
              <Badge icon="verified-check" label={company.verifiedScore} bg={theme.seekIconSoft} fg={theme.success} />
            )}
            {company.invitedBadge && (
              <Badge icon="invited-badge" label={company.invitedBadge} bg={theme.offerIconSoft} fg={theme.accent} />
            )}
            <Badge icon={company.roleBadge.icon} label={company.roleBadge.label} bg={theme.buttonDark} fg={theme.accent} />
          </View>
        </View>
      </View>

      <View style={[styles.whatWeDo, { backgroundColor: theme.surfaceInset }]}>
        <View style={styles.whatWeDoLabel}>
          <CompanyIcon name="info" color={theme.textMuted} width={12} height={12} />
          <ThemedText style={[styles.whatWeDoLabelText, { color: theme.textMuted }]}>¿Qué hacemos?</ThemedText>
        </View>
        <ThemedText style={[styles.description, { color: theme.textPrimary }]}>{company.description}</ThemedText>
      </View>

      <View style={styles.metrics}>
        <MetricPill icon="tag" label="Ofrecemos:" value={company.offerValue} bg={theme.offerSoft} iconBg={theme.offerIconSoft} fg={theme.accent} />
        <MetricPill icon={company.seekIcon} label={company.seekLabel} value={company.seekValue} bg={theme.seekSoft} iconBg={theme.seekIconSoft} fg={theme.success} />
        <MetricPill icon={company.contactsIcon} label="Contactos:" bg={theme.surfaceInset} iconBg={theme.buttonDark} fg={theme.accent}>
          <View style={styles.contacts}>
            <View style={styles.avatarStack}>
              {company.contactAvatars.map((avatar, index) => (
                <Image
                  key={index}
                  source={avatar}
                  accessibilityLabel="Contacto"
                  style={[styles.contactAvatar, { marginLeft: index === 0 ? 0 : -8, borderColor: theme.surfaceInset }]}
                  contentFit="cover"
                />
              ))}
            </View>
            <View style={[styles.contactsCountBadge, { backgroundColor: theme.buttonDark }]}>
              <ThemedText style={[styles.contactsCountLabel, { color: theme.textMuted }]}>{company.contactsLabel}</ThemedText>
            </View>
          </View>
        </MetricPill>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${company.name}`}
        onPress={() => {
          // TODO: navegar al detalle de empresa cuando exista la ruta
        }}
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
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  headerText: {
    flex: 1,
    gap: Spacing.two,
    minWidth: 0,
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
  whatWeDo: {
    borderRadius: 8,
    padding: Spacing.two + Spacing.half,
    gap: Spacing.half + 2,
  },
  whatWeDoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half + 2,
  },
  whatWeDoLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 19,
  },
  metrics: {
    gap: Spacing.two,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.two + 2,
    borderRadius: 8,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  contacts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactsCountBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 9999,
  },
  contactsCountLabel: {
    fontSize: 11,
    fontWeight: '600',
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
