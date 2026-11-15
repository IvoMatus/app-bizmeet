import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterHeader } from '@/components/register/register-header';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type AuthScreenShellProps = {
  onBack: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Shared shell for the login/register screens: themed background, back-button header,
 * and a scroll area. Keyboard avoidance lives in the root `_layout.tsx` (one
 * KeyboardAvoidingView for the whole app) — don't nest another one here or the padding doubles.
 */
export function AuthScreenShell({ onBack, title, children }: AuthScreenShellProps) {
  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <RegisterHeader title={title} onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
