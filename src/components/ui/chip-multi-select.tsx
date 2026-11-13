import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipMultiSelectProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

/** Chips de selección múltiple (cada chip es un checkbox). Sin label: lo pone quien lo usa. */
export function ChipMultiSelect({ options, value, onChange }: ChipMultiSelectProps) {
  const theme = useTheme();

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => toggle(option)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={option}>
            <ThemedView
              style={[
                styles.chip,
                { backgroundColor: active ? theme.accent : theme.card, borderColor: active ? theme.accent : theme.border },
              ]}>
              <ThemedText type="small" themeColor={active ? 'background' : 'text'}>
                {option}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
});
