import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Modal, Pressable, StyleSheet, View, type Text } from 'react-native';

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
  const titleRef = useRef<Text>(null);

  useEffect(() => {
    setState = setLocalState;
    return () => {
      setState = null;
    };
  }, []);

  // RN's <Modal> — unlike the native Alert.alert this replaced — doesn't move
  // VoiceOver/TalkBack focus to its content by itself, so without this a screen
  // reader user gets no signal that an error/alert just appeared.
  useEffect(() => {
    if (!state) return;
    const tag = findNodeHandle(titleRef.current);
    if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
  }, [state]);

  if (!state) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setLocalState(null)}>
      <View style={styles.backdrop}>
        <View
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          accessibilityViewIsModal
          // ponytail: accessibilityViewIsModal is iOS-only. Trapping TalkBack on Android
          // would mean marking the rest of the screen importantForAccessibility="no-hide-descendants"
          // while this is open — a root-layout-level change, not local to this component.
        >
          <ThemedText
            ref={titleRef}
            style={[styles.title, { color: theme.textPrimary }]}
            accessibilityRole="alert"
          >
            {state.title}
          </ThemedText>
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
                accessibilityRole="button"
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
