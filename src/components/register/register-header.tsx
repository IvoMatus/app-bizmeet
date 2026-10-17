import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RegisterHeaderProps = {
  onBack: () => void;
  title?: string;
};

/** Fixed back-button header shared by the registration steps and the login screen. */
export function RegisterHeader({ onBack, title = 'Account Setup' }: RegisterHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        hitSlop={Spacing.two}
        style={[styles.backButton, { backgroundColor: theme.card }]}>
        <SymbolView
          tintColor={theme.text}
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={18}
        />
      </Pressable>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
