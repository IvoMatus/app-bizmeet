import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps, type TextStyle } from 'react-native';

import { interFontFamily } from '@/constants/theme';

/**
 * `TextInput` de React Native con la `fontFamily` de Inter resuelta automáticamente a partir
 * de `fontWeight` — mismo criterio centralizado que `ThemedText` (ver `interFontFamily` en
 * theme.ts). Los inputs de `@expo/ui` (`FormInput`) no pasan por acá: ese fix vive en
 * `form-input.tsx` mismo, porque es una vista nativa distinta (SwiftUI/Jetpack Compose).
 */
export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput({ style, ...rest }, ref) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const { fontWeight, ...restStyle } = flat;

  return <TextInput ref={ref} style={[restStyle, { fontFamily: interFontFamily(fontWeight) }]} {...rest} />;
});
