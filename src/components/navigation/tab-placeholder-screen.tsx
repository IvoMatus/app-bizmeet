import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/** Página vacía de un destino de la barra inferior: solo título, sin contenido todavía.
 * El topbar compartido (ver app-tabs.tsx) ya cubre el safe-area superior. */
export function TabPlaceholderScreen({ title }: { title: string }) {
  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <ThemedText type="subtitle" accessibilityRole="header">
          {title}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});
