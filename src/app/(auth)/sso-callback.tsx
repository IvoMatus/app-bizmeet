import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

/**
 * Destino del redirect de Clerk tras el login con Google (`appbizmeet://sso-callback`, default de
 * `useSSO`). En Android ese deep link también llega a expo-router: sin esta ruta caería en
 * "unmatched route". Vive en (auth) para que AuthGuard decida a dónde sigue (Muro o completar perfil).
 */
export default function SsoCallbackScreen() {
  const theme = useTheme();
  return (
    <ThemedView type="screenBackground" style={styles.center}>
      <ActivityIndicator color={theme.accent} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
