import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Card dashed de la sección "Activos Multimedia" (Figma 2043:1204) — toca para abrir la galería. */
export function AttachmentDropzone({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Agregar foto"
      accessibilityHint="Abre la galería para elegir una imagen"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.zone, { backgroundColor: theme.cardElevated, borderColor: theme.accent, opacity: disabled ? 0.5 : 1 }]}>
      <SymbolView tintColor={theme.accent} name={{ ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' }} size={28} />
      <ThemedText type="small" style={{ color: theme.textPrimary, textAlign: 'center' }}>
        Toca para agregar fotos
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textMuted, textAlign: 'center', fontSize: 11 }}>
        PNG, JPG o WEBP (hasta 10MB c/u)
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: {
    minHeight: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
  },
});
