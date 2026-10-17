import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
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
 * and a keyboard-avoiding scroll area so fields near the bottom (e.g. "repetir contraseña")
 * don't end up hidden behind the keyboard.
 */
export function AuthScreenShell({ onBack, title, children }: AuthScreenShellProps) {
  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <RegisterHeader title={title} onBack={onBack} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
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
