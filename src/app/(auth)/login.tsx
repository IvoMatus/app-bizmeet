import { useSignIn } from '@clerk/expo';
import { type TextInputRef } from '@expo/ui';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
import { useAccessibilityFocusOnMount } from '@/hooks/use-accessibility-focus-on-mount';
import { getClerkErrorMessage } from '@/utils/clerk-error';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { signIn } = useSignIn();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });
  const headingRef = useAccessibilityFocusOnMount();
  const passwordRef = useRef<TextInputRef>(null);

  async function onSubmit(data: LoginForm) {
    setSubmitting(true);
    try {
      const { error } = await signIn.password({
        emailAddress: data.email,
        password: data.password,
      });
      if (error) {
        showAlert('No se pudo iniciar sesión', getClerkErrorMessage(error));
        return;
      }
      if (signIn.status !== 'complete') {
        showAlert('Inicio de sesión incompleto', 'Verifica tus datos e intenta de nuevo.');
        return;
      }
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        showAlert('No se pudo iniciar sesión', getClerkErrorMessage(finalizeError));
        return;
      }
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenShell title="Iniciar sesión" onBack={() => router.back()}>
      <ThemedText ref={headingRef} type="subtitle" accessibilityRole="header">
        Bienvenido de vuelta
      </ThemedText>
      <FormInput
        control={control}
        name="email"
        label="Correo electrónico"
        placeholder="ejemplo@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        rules={{ required: 'Requerido' }}
      />
      <FormInput
        ref={passwordRef}
        control={control}
        name="password"
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={() => handleSubmit(onSubmit)()}
        rules={{ required: 'Requerido' }}
      />
      <PrimaryButton
        label="Iniciar sesión"
        icon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
      />
    </AuthScreenShell>
  );
}
