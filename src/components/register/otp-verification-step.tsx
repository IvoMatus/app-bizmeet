import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OtpInput } from '@/components/register/otp-input';
import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibilityFocusOnMount } from '@/hooks/use-accessibility-focus-on-mount';
import { useTheme } from '@/hooks/use-theme';

type OtpVerificationStepProps = {
  icon: SymbolViewProps['name'];
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  target: string;
  targetActionLabel: string;
  onTargetAction: () => void;
  secureChannelLabel: string;
  resendLabel: string;
  onResend: () => void;
  ctaLabel: string;
  onSubmit: (code: string) => void;
  submitting?: boolean;
  footer: string;
};

/**
 * Shared UI for Paso 3A (correo) and Paso 3B (celular) — same layout, different
 * copy/icon/target, per the design ("Parte 1 de 2" / "Parte 2 de 2" of the same Paso 3).
 */
export function OtpVerificationStep({
  icon,
  titlePrefix,
  titleHighlight,
  subtitle,
  target,
  targetActionLabel,
  onTargetAction,
  secureChannelLabel,
  resendLabel,
  onResend,
  ctaLabel,
  onSubmit,
  submitting,
  footer,
}: OtpVerificationStepProps) {
  const theme = useTheme();
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const headingRef = useAccessibilityFocusOnMount();

  return (
    <ThemedView type="card" style={[styles.card, { borderColor: theme.border }]}>
      <View
        style={[styles.iconCircle, { backgroundColor: theme.cardElevated }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <SymbolView tintColor={theme.accent} name={icon} size={28} />
        <View style={[styles.iconBadge, { backgroundColor: theme.success }]}>
          <SymbolView
            tintColor={theme.background}
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={10}
          />
        </View>
      </View>

      <View style={styles.headingBlock}>
        <ThemedText ref={headingRef} type="subtitle" style={styles.centerText} accessibilityRole="header">
          {titlePrefix} <ThemedText type="subtitle" themeColor="accent">{titleHighlight}</ThemedText>
        </ThemedText>
        <ThemedText type="default" themeColor="textMuted" style={styles.centerText}>
          {subtitle}
        </ThemedText>
      </View>

      <Pressable
        onPress={onTargetAction}
        style={[styles.pill, { backgroundColor: theme.cardElevated }]}
        accessibilityRole="button"
        accessibilityLabel={`${target}. ${targetActionLabel}`}
      >
        <ThemedText type="small">{target}</ThemedText>
        <ThemedText type="small" themeColor="accent">
          {targetActionLabel}
        </ThemedText>
      </Pressable>

      <OtpInput value={otp} onChange={setOtp} />

      <View style={styles.secureRow}>
        <SymbolView
          tintColor={theme.success}
          name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
          size={12}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <ThemedText type="small" themeColor="success">
          {secureChannelLabel}
        </ThemedText>
      </View>

      <Pressable
        onPress={onResend}
        style={styles.resendRow}
        accessibilityRole="button"
        accessibilityLabel={resendLabel}
      >
        <SymbolView
          tintColor={theme.accent}
          name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
          size={14}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <ThemedText type="link" themeColor="accent">
          {resendLabel}
        </ThemedText>
      </Pressable>

      <PrimaryButton
        label={ctaLabel}
        icon={{ ios: 'checkmark', android: 'check', web: 'check' }}
        onPress={() => onSubmit(otp.join(''))}
        disabled={submitting || otp.some((digit) => !digit)}
      />

      <ThemedText type="small" themeColor="textMuted" style={styles.centerText}>
        {footer}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: {
    gap: Spacing.one,
  },
  centerText: {
    textAlign: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
