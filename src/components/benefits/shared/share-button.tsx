import { SymbolView } from 'expo-symbols';
import { Pressable, Share, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Botón redondo de compartir (hoja nativa de RN). */
export function ShareButton({ message, label }: { message: string; label: string }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => Share.share({ message }).catch(() => {})}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, opacity: pressed ? 0.85 : 1 },
      ]}>
      <SymbolView tintColor={theme.textPrimary} name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
