import {
  Host,
  TextInput,
  type TextInputProps as ExpoTextInputProps,
  type TextInputRef,
} from '@expo/ui';
import { semantics } from '@expo/ui/jetpack-compose/modifiers';
import { accessibilityLabel } from '@expo/ui/swift-ui/modifiers';
import { type Ref, type RefCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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

// @expo/ui's TextInput has no accessibilityLabel prop — it's a SwiftUI/Jetpack Compose
// view, not a standard RN host component. The `modifiers` escape hatch is the real way
// in, confirmed against @expo/ui 57.0.25's source (the version this bumped to; 57.0.20
// had no `contentDescription` on Android's `semantics` modifier at all).
function accessibilityModifiers(label?: string) {
  if (!label) return [];
  return Platform.OS === 'ios'
    ? [accessibilityLabel(label)]
    : [semantics({ contentDescription: label })];
}

// RHF needs the native ref to manage focus-on-error; callers need it to call
// `.focus()` (e.g. moving to the next field on the keyboard's "next"/"done" key).
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (instance) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(instance);
      else if (ref) (ref as { current: T | null }).current = instance;
    }
  };
}

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ExpoTextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'onBlur' | 'ref'> & {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
  ref?: Ref<TextInputRef>;
};

export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, label, rules, ref, ...inputProps }: FormInputProps<TFieldValues, TName>) {
  const theme = useTheme();
  const { field, fieldState } = useController({ control, name, rules });
  const { ref: fieldRef, value, onChange, onBlur } = field;
  const { modifiers: callerModifiers, ...restInputProps } = inputProps;

  return (
    <View style={styles.container}>
      {label && <ThemedText type="smallBold">{label}</ThemedText>}

      <Host matchContents={{ vertical: true }}>
        <TextInput
          // ponytail: uncontrolled (defaultValue + onChangeText) — @expo/ui's TextInput only
          // reflects external value changes via an ObservableState `value` prop. If this field
          // needs to react to form.reset()/setValue() after mount, switch to useNativeState and
          // sync it from field.value in a useEffect.
          ref={mergeRefs(fieldRef, ref)}
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
          modifiers={[...accessibilityModifiers(label), ...(callerModifiers ?? [])]}
          {...restInputProps}
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
