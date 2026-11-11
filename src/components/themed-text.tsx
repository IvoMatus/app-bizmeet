import { forwardRef } from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, interFontFamily, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'smallBold' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

// forwardRef so callers can attach a ref to move accessibility focus to this text
// (e.g. useAccessibilityFocusOnMount) — a plain function component can't take a ref.
export const ThemedText = forwardRef<Text, ThemedTextProps>(function ThemedText(
  { style, type = 'default', themeColor, ...rest },
  ref
) {
  const theme = useTheme();

  // Combina el estilo base del `type` con cualquier override suelto del `style` del consumidor
  // (p.ej. `style={{ fontWeight: '700' }}`) para resolver la `fontFamily` de Inter una sola vez
  // acá — ver `interFontFamily` en theme.ts. `code` usa su propia mono y no pasa por Inter.
  const flat = (StyleSheet.flatten([styles[type], style]) ?? {}) as TextStyle;
  let finalStyle: TextStyle = flat;
  if (type !== 'code') {
    const { fontWeight, ...restStyle } = flat;
    finalStyle = { ...restStyle, fontFamily: interFontFamily(fontWeight) };
  }

  return (
    <Text
      ref={ref}
      style={[{ color: theme[themeColor ?? 'text'] }, finalStyle]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  // h1/h2 sin dato de Figma confirmado todavía — escala provisoria, consistente con el peso de
  // h3 (sí confirmado: Inter 800/ExtraBold, 20/25). Ajustar tamaño/peso si aparece el frame real.
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 800,
  },
  h3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: 800,
  },
  // Cuerpo de texto (Figma: Inter Regular, 14/22.8) — descripción de publicación, etc.
  body: {
    fontSize: 14,
    lineHeight: 22.8,
    fontWeight: 400,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
