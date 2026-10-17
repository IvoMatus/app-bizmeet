import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
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
      <ThemedText type="subtitle">Bienvenido de vuelta</ThemedText>
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
