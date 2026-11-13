import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BenefitButtonVariant = 'primary' | 'outline' | 'success' | 'dark';

type BenefitButtonProps = {
  label: string;
  onPress: () => void;
  variant?: BenefitButtonVariant;
  /** Ícono antes del texto (ticket, rayo, apretón de manos...). */
  icon?: SymbolViewProps['name'];
  /** Flecha "→" después del texto. */
  arrow?: boolean;
  loading?: boolean;
  /** Bloqueado por plan: candado, no presionable. */
  locked?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

/** CTA de Beneficios: "Canjear Código →", "Ver & Cotizar →", "Inscribirme Gratis", "Comprar Entrada"... */
export function BenefitButton({ label, onPress, variant = 'primary', icon, arrow, loading, locked, accessibilityHint, style }: BenefitButtonProps) {
  const theme = useTheme();
  // Pares con contraste ≥ 4.5:1 en claro y oscuro (por eso el verde lleva texto oscuro y no blanco).
  const colors = locked
    ? { bg: theme.surfaceInset, fg: theme.textMuted, border: theme.surfaceBorder }
    : {
        primary: { bg: theme.accentStrong, fg: theme.screenBackground, border: theme.accentStrong },
        outline: { bg: 'transparent', fg: theme.accentText, border: theme.accentText },
        success: { bg: theme.success, fg: theme.buttonDark, border: theme.success },
        dark: { bg: theme.buttonDark, fg: theme.onButtonDark, border: theme.buttonDark },
      }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label}, bloqueado` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: locked || loading, busy: loading }}
      disabled={locked || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.bg, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        style,
      ]}>
      {locked ? (
        <SymbolView tintColor={colors.fg} name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={16} />
      ) : (
        icon && <SymbolView tintColor={colors.fg} name={icon} size={16} />
      )}
      <ThemedText type="smallBold" style={[styles.label, { color: colors.fg }]}>
        {label}
      </ThemedText>
      {loading ? (
        <ActivityIndicator size="small" color={colors.fg} />
      ) : (
        arrow && !locked && <SymbolView tintColor={colors.fg} name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }} size={14} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  label: {
    textAlign: 'center',
    flexShrink: 1,
  },
});
