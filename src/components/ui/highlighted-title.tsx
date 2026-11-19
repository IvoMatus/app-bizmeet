import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type HighlightedTitleProps = {
  text: string;
  /** Fragmento de `text` que va en color primario ("Convenios **Estratégicos**"). Si no aparece, todo neutro. */
  highlight?: string;
  type?: ComponentProps<typeof ThemedText>['type'];
  style?: StyleProp<TextStyle>;
};

/** Título con un tramo resaltado en `accent` (títulos grandes, así que 3:1 alcanza). */
export function HighlightedTitle({ text, highlight, type = 'h1', style }: HighlightedTitleProps) {
  const theme = useTheme();
  const at = highlight ? text.indexOf(highlight) : -1;

  return (
    <ThemedText type={type} accessibilityRole="header" style={[{ color: theme.textPrimary }, style]}>
      {at < 0 || !highlight ? (
        text
      ) : (
        <>
          {text.slice(0, at)}
          <ThemedText type={type} style={{ color: theme.accent }}>
            {highlight}
          </ThemedText>
          {text.slice(at + highlight.length)}
        </>
      )}
    </ThemedText>
  );
}
