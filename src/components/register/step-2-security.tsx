import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';

import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FormInput } from '@/components/ui/form-input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SecurityForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultValues: SecurityForm = { email: '', password: '', confirmPassword: '' };

const REQUIREMENTS = [
  'Mínimo 8 caracteres',
  'Mayúsculas',
  'Minúsculas',
  'Números',
  'Símbolos especiales (@,#,$, etc.)',
];

type Step2SecurityProps = {
  onSubmit: (data: SecurityForm) => void;
  submitting?: boolean;
};

/** Paso 2: Seguridad y contraseña. */
export function Step2Security({ onSubmit, submitting }: Step2SecurityProps) {
  const theme = useTheme();
  const { control, handleSubmit, getValues } = useForm<SecurityForm>({ defaultValues });

  return (
    <View style={styles.container}>
      <ThemedView type="cardElevated" style={styles.badge}>
        <ThemedText type="small" themeColor="accent">
          Acceso por credenciales directas BizAInet
        </ThemedText>
      </ThemedView>

      <View style={styles.headingBlock}>
        <ThemedText type="subtitle">
          Crea tu <ThemedText type="subtitle" themeColor="accent">cuenta</ThemedText>
        </ThemedText>
        <ThemedText type="default" themeColor="textMuted">
          Configura tus accesos de seguridad.
        </ThemedText>
      </View>

      <FormInput
        control={control}
        name="email"
        label="Correo electrónico"
        placeholder="ejemplo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        rules={{ required: 'Requerido' }}
      />

      <FormInput
        control={control}
        name="password"
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        rules={{ required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } }}
      />

      <ThemedView type="card" style={styles.card}>
        <ThemedText type="smallBold">Requisitos de robustez</ThemedText>
        <View style={styles.requirementsGrid}>
          {REQUIREMENTS.map((requirement) => (
            <View key={requirement} style={styles.requirementRow}>
              <SymbolView
                tintColor={theme.success}
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check' }}
                size={14}
              />
              <ThemedText type="small" themeColor="textMuted">
                {requirement}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      <FormInput
        control={control}
        name="confirmPassword"
        label="Repetir contraseña"
        placeholder="••••••••"
        secureTextEntry
        rules={{
          required: 'Requerido',
          validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
        }}
      />

      <PrimaryButton
        label="Continuar"
        icon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
      />

      <Pressable style={styles.googleLink}>
        <ThemedText type="link" themeColor="accent">
          ¿Prefieres conectar con Google? Acceso directo
        </ThemedText>
        <SymbolView
          tintColor={theme.accent}
          name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
          size={12}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  headingBlock: {
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    width: '47%',
  },
  googleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
