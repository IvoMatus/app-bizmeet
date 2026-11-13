import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Header de pantalla de detalle: volver + título ("Detalle Convenio", "Detalle Evento"). */
export function DetailHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={() => router.back()}
        style={[styles.back, { backgroundColor: theme.surfaceInset }]}>
        <SymbolView tintColor={theme.textPrimary} name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} />
      </Pressable>
      <ThemedText type="h3" accessibilityRole="header" style={{ color: theme.textPrimary }}>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
