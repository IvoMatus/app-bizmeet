import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Destino de la barra inferior todavía sin contenido: título + aviso "En construcción".
 * El topbar compartido (ver app-tabs.tsx) ya cubre el safe-area superior. */
export function TabPlaceholderScreen({ title, description }: { title: string; description: string }) {
  const theme = useTheme();

  return (
    <ThemedView type="screenBackground" style={styles.screen}>
      <View style={styles.header}>
        <ThemedText type="subtitle" themeColor="textPrimary" accessibilityRole="header">
          {title}
        </ThemedText>
      </View>
      {/* Un solo nodo para TalkBack/VoiceOver: el ícono es decorativo. */}
      <View accessible accessibilityRole="text" accessibilityLabel={`En construcción. ${description}`} style={styles.placeholder}>
        <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
          <SymbolView name={{ ios: 'hammer.fill', android: 'construction', web: 'construction' }} tintColor={theme.accent} size={32} />
        </View>
        <ThemedText type="h3" themeColor="textPrimary" style={styles.centered}>
          En construcción
        </ThemedText>
        <ThemedText type="body" themeColor="textMuted" style={styles.centered}>
          {description}
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    // Compensa el header para que el bloque quede centrado en la pantalla, no en el espacio restante.
    paddingBottom: Spacing.six,
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
  },
  iconCircle: {
    width: Spacing.six + Spacing.four,
    height: Spacing.six + Spacing.four,
    borderRadius: (Spacing.six + Spacing.four) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
});
