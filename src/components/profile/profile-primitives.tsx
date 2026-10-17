import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatusVariant = 'neutral' | 'accent' | 'success';

/** Pill de estado: "SOCIO ACTIVO", "IA Verified", "Verificado", "WhatsApp". */
export function StatusPill({
  label,
  variant = 'neutral',
  icon,
}: {
  label: string;
  variant?: StatusVariant;
  icon?: ProfileIconName;
}) {
  const theme = useTheme();
  const palette = {
    neutral: { bg: theme.surfaceInset, border: theme.surfaceBorder, fg: theme.textMuted },
    accent: { bg: theme.accentSoft, border: theme.accentSoft, fg: theme.accent },
    success: { bg: theme.successSurface, border: theme.successBorder, fg: theme.success },
  }[variant];
  const iconColor = variant === 'success' ? theme.success : palette.fg;

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      {icon && <ProfileIcon name={icon} color={iconColor} width={12} height={12} />}
      <ThemedText type="small" style={[styles.pillLabel, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

/** Tarjeta de sección: eyebrow en mayúsculas + título + contenido. `kyc` agrega borde izquierdo verde. */
export function SectionCard({
  eyebrow,
  title,
  kyc,
  children,
  style,
  ...rest
}: ViewProps & { eyebrow?: string; title?: string; kyc?: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
        kyc && { borderLeftWidth: 4, borderLeftColor: theme.success },
        style,
      ]}
      {...rest}>
      {(eyebrow || title) && (
        <View style={styles.cardHeader}>
          {eyebrow && (
            <ThemedText style={[styles.eyebrow, { color: theme.eyebrow }]}>{eyebrow}</ThemedText>
          )}
          {title && <ThemedText style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</ThemedText>}
        </View>
      )}
      {children}
    </View>
  );
}

/** Fila con icono, label, valor y elemento final opcional (badge, link, icono). */
export function InfoRow({
  icon,
  label,
  value,
  trailing,
  bordered = true,
}: {
  icon?: ProfileIconName;
  label: string;
  value?: string;
  trailing?: React.ReactNode;
  bordered?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder },
        !bordered && styles.rowUnbordered,
      ]}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: theme.accentSoft }]}>
          <ProfileIcon name={icon} color={theme.accent} width={16} height={16} />
        </View>
      )}
      <View style={styles.rowBody}>
        <ThemedText style={[styles.label, { color: theme.textMuted }]} numberOfLines={1}>
          {label}
        </ThemedText>
        {value && (
          <ThemedText style={[styles.value, { color: theme.textPrimary }]} numberOfLines={1}>
            {value}
          </ThemedText>
        )}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half + 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half + 2,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    gap: Spacing.one,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two + Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowUnbordered: {
    borderWidth: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
