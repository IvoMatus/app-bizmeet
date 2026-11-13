import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Sello bajo el CTA final ("Verificación instantánea BizAInet Partner Trust"). */
export function TrustSeal({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <SymbolView tintColor={theme.success} name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }} size={14} />
      <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
