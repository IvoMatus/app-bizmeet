import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertState = { title: string; message?: string; buttons: AppAlertButton[] } | null;

let setState: ((state: AlertState) => void) | null = null;

/** Drop-in replacement for RN's `Alert.alert(title, message?, buttons?)`, themed. */
export function showAlert(title: string, message?: string, buttons: AppAlertButton[] = [{ text: 'OK' }]) {
  setState?.({ title, message, buttons });
}

/** Mount once near the root (e.g. RootLayout) so any screen can call `showAlert`. */
export function AppAlertHost() {
  const theme = useTheme();
  const [state, setLocalState] = useState<AlertState>(null);

  useEffect(() => {
    setState = setLocalState;
    return () => {
      setState = null;
    };
  }, []);

  if (!state) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setLocalState(null)}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText style={[styles.title, { color: theme.textPrimary }]}>{state.title}</ThemedText>
          {state.message ? (
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              {state.message}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            {state.buttons.map((button, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setLocalState(null);
                  button.onPress?.();
                }}
                style={styles.button}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: button.style === 'destructive' ? theme.error : theme.accent }}
                >
                  {button.text}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
});
