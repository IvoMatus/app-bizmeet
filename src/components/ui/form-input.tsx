import { Host, TextInput, type TextInputProps as ExpoTextInputProps } from '@expo/ui';
import { StyleSheet, View } from 'react-native';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ExpoTextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'onBlur' | 'ref'> & {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
};

export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, label, rules, ...inputProps }: FormInputProps<TFieldValues, TName>) {
  const theme = useTheme();
  const { field, fieldState } = useController({ control, name, rules });
  const { ref, value, onChange, onBlur } = field;

  return (
    <View style={styles.container}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}

      <Host matchContents={{ vertical: true }}>
        <TextInput
          // ponytail: uncontrolled (defaultValue + onChangeText) — @expo/ui's TextInput only
          // reflects external value changes via an ObservableState `value` prop. If this field
          // needs to react to form.reset()/setValue() after mount, switch to useNativeState and
          // sync it from field.value in a useEffect.
          ref={ref}
          defaultValue={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholderTextColor={theme.textSecondary}
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: Spacing.two,
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.two,
          }}
          textStyle={{ color: theme.text, fontSize: 15 }}
          {...inputProps}
        />
      </Host>

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
});
