import { DateTimePicker, type DateTimePickerProps } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
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

export type FormDatePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  mode?: DateTimePickerProps['mode'];
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  formatValue?: (date: Date) => string;
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
};

const defaultFormat = (date: Date) => date.toLocaleDateString();

export function FormDatePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder = 'Seleccionar',
  formatValue = defaultFormat,
  rules,
}: FormDatePickerProps<TFieldValues, TName>) {
  const theme = useTheme();
  const { field, fieldState } = useController({ control, name, rules });
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);
  const value: Date = field.value ?? new Date();

  return (
    <View style={styles.container}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}

      {/* ponytail: same @expo/ui gap as form-input.tsx — DateTimePickerProps (SDK 57) only
          extends Pick<ViewProps, 'style'>, no accessibility prop exists to attach the label
          above. Not fixable from here; see form-input.tsx for the full note. */}
      {Platform.OS === 'ios' && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="compact"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, date) => field.onChange(date)}
        />
      )}

      {Platform.OS === 'android' && (
        <>
          <Pressable
            onPress={() => setAndroidPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityValue={{ text: field.value ? formatValue(value) : placeholder }}>
            <ThemedView
              type="card"
              style={[styles.androidField, { borderColor: theme.border, borderWidth: 1 }]}>
              <ThemedText themeColor={field.value ? 'text' : 'textSecondary'}>
                {field.value ? formatValue(value) : placeholder}
              </ThemedText>
            </ThemedView>
          </Pressable>
          {androidPickerOpen && (
            <DateTimePicker
              value={value}
              mode={mode}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onValueChange={(_event, date) => {
                setAndroidPickerOpen(false);
                field.onChange(date);
              }}
              onDismiss={() => setAndroidPickerOpen(false)}
            />
          )}
        </>
      )}

      {Platform.OS === 'web' && (
        // ponytail: @expo/ui's community DateTimePicker renders nothing on web (no SwiftUI/Compose
        // host there). Add a web fallback (e.g. a native <input type="date">) when the web target
        // needs this field.
        <ThemedText themeColor="textSecondary">No disponible en web todavía</ThemedText>
      )}

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
  androidField: {
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
