import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type TextInputProps } from 'react-native';

import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = Pick<TextInputProps, 'value' | 'onChangeText'> & { placeholder: string };

/** Buscador de una línea con lupa (Convenios, Eventos). */
export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const theme = useTheme();

  return (
    <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      <SymbolView tintColor={theme.textMuted} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={18} />
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        style={[styles.input, { color: theme.textPrimary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.two,
  },
});
