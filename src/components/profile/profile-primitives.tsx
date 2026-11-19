import { StyleSheet, View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon, type ProfileIconName } from '@/components/profile/profile-icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatusVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

/** Colores (fondo, borde, texto) de cada variante de `StatusPill` — exportado para que otros
 * elementos (p.ej. el avatar de la tarjeta del muro) usen la misma paleta que su pill. */
export function useStatusPalette(variant: StatusVariant) {
  const theme = useTheme();
  return {
    neutral: { bg: theme.surfaceInset, border: theme.surfaceBorder, fg: theme.textMuted },
    // fg `accentText`/`successText`: `accent`/`success` no llegan a 4.5:1 sobre su fondo en claro.
    accent: { bg: theme.accentSoft, border: theme.accentSoft, fg: theme.accentText },
    success: { bg: theme.successSurface, border: theme.successBorder, fg: theme.successText },
    warning: { bg: theme.warningSoft, border: theme.warningBorder, fg: theme.warningText },
    error: { bg: theme.errorSoft, border: theme.errorBorder, fg: theme.error },
  }[variant];
}

/** Pill de estado: "SOCIO ACTIVO", "IA Verified", "Verificado", "WhatsApp". `style`/`labelStyle`
 * opcionales para ajustar tamaño y padding (p.ej. chip de rubro del muro) sin tocar el default. */
export function StatusPill({
  label,
  variant = 'neutral',
  icon,
  style,
  labelStyle,
}: {
  label: string;
  variant?: StatusVariant;
  icon?: ProfileIconName;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const palette = useStatusPalette(variant);
  const iconColor = variant === 'success' ? theme.success : palette.fg;

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      {icon && <ProfileIcon name={icon} color={iconColor} width={12} height={12} />}
      <ThemedText type="small" style={[styles.pillLabel, { color: palette.fg }, labelStyle]} numberOfLines={1}>
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
