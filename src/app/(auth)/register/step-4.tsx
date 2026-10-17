import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Step4Success } from '@/components/register/step-4-success';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function Step4Screen() {
  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Step4Success
            // TODO: route into the company/premium enrollment flow once it exists.
            onUpgrade={() => router.replace('/')}
            // TODO: route into the app's authenticated home once onboarding is wired end-to-end.
            onContinueBasic={() => router.replace('/')}
          />
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
    paddingVertical: Spacing.six,
  },
});
