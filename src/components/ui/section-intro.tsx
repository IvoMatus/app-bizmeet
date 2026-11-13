import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/ui/eyebrow';
import { HighlightedTitle } from '@/components/ui/highlighted-title';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionIntroProps = {
  overline: string;
  title: string;
  highlight?: string;
  description: string;
  /** Métricas debajo de la bajada (StatTile...). */
  children?: ReactNode;
};

/** Encabezado de sección: overline + título con resaltado + bajada (+ métricas). */
export function SectionIntro({ overline, title, highlight, description, children }: SectionIntroProps) {
  const theme = useTheme();

  return (
    <View style={styles.intro}>
      <Eyebrow label={overline} />
      <HighlightedTitle text={title} highlight={highlight} />
      <ThemedText type="body" style={{ color: theme.textMuted }}>
        {description}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.two,
  },
});
