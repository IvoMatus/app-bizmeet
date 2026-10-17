import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const LENGTH = 6;

type OtpInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

/**
 * 6-digit OTP entry: six single-char boxes with auto-advance/auto-back and paste support.
 * ponytail: no primitive for this in `ui/` — plain controlled TextInputs, per task instructions.
 */
export function OtpInput({ value, onChange }: OtpInputProps) {
  const theme = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  const setDigit = (index: number, text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    const next = [...value];

    if (!digits) {
      next[index] = '';
      onChange(next);
      return;
    }

    let lastIndex = index;
    for (const digit of digits) {
      if (lastIndex >= LENGTH) break;
      next[lastIndex] = digit;
      lastIndex++;
    }
    onChange(next);
    inputs.current[Math.min(lastIndex, LENGTH - 1)]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: LENGTH }).map((_, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={value[index] ?? ''}
          onChangeText={(text) => setDigit(index, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          style={[
            styles.box,
            {
              backgroundColor: theme.card,
              borderColor: value[index] ? theme.accent : theme.border,
              color: theme.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    width: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
});
