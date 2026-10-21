import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FormSelectOption<TValue extends string | number> = {
  label: string;
  value: TValue;
};

export type FormSelectProps<
  TFieldValues extends FieldValues,
  TValue extends string | number,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  options: FormSelectOption<TValue>[];
  enabled?: boolean;
  placeholder?: string;
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
};

/**
 * Custom dropdown, styled to match the app's card/border theme on every platform.
 * ponytail: replaces @expo/ui's Picker, which on Android renders an unstyled Material 3
 * dropdown with no color/border props — no escape hatch to match the design there.
 */
export function FormSelect<
  TFieldValues extends FieldValues,
  TValue extends string | number,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  options,
  enabled = true,
  placeholder = 'Seleccionar',
  rules,
}: FormSelectProps<TFieldValues, TValue, TName>) {
  const theme = useTheme();
  const { field, fieldState } = useController({ control, name, rules });
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((option) => option.value === field.value)?.label;

  return (
    <View style={styles.container}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}

      <Pressable
        disabled={!enabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selectedLabel ?? placeholder }}
        accessibilityState={{ disabled: !enabled }}
      >
        <ThemedView type="card" style={[styles.trigger, { borderColor: theme.border }]}>
          <ThemedText themeColor={selectedLabel ? 'text' : 'textSecondary'}>
            {selectedLabel ?? placeholder}
          </ThemedText>
        </ThemedView>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}}>
            <ThemedView type="card" style={[styles.sheet, { borderColor: theme.border }]}>
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      field.onChange(item.value);
                      setOpen(false);
                    }}
                    style={styles.option}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: item.value === field.value }}
                    accessibilityLabel={item.label}>
                    <ThemedText themeColor={item.value === field.value ? 'accent' : 'text'}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                )}
              />
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>

      {fieldState.error?.message && (
        <ThemedText type="small" themeColor="error">
          {fieldState.error.message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  trigger: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderWidth: 1,
    maxHeight: '60%',
    paddingVertical: Spacing.two,
  },
  option: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
