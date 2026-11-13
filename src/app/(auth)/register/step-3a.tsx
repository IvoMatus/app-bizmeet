import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { OtpVerificationStep } from '@/components/register/otp-verification-step';
import { saveRegisteredProfile } from '@/components/register/save-registered-profile';
import { StepProgress } from '@/components/register/step-progress';
import { showAlert } from '@/components/ui/app-alert';
import { getClerkErrorMessage } from '@/utils/clerk-error';

import { useRegisterForm } from './_layout';

export default function Step3aScreen() {
  const { signUp } = useSignUp();
  const getToken = useAuthToken();
  const { personalData } = useRegisterForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleVerify(code: string) {
    setSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        showAlert('Código incorrecto', getClerkErrorMessage(error));
        return;
      }
      // ponytail: phone verification (Twilio/Meta OTP) is pending — see ClickUp 86bc9vcxk.
      // Email is the only Clerk verification left, so signUp completes right here.
      if (signUp.status === 'complete') {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          showAlert('No se pudo completar el registro', getClerkErrorMessage(finalizeError));
          return;
        }
        if (personalData && signUp.createdUserId) {
          try {
            const token = await getToken();
            if (!token) throw new Error('No se pudo obtener la sesión recién creada.');

            await saveRegisteredProfile(signUp.createdUserId, personalData, token);
          } catch (profileError) {
            // La cuenta y la sesión ya existen: no dejamos al usuario trabado, solo avisamos. Al
            // salir del registro, AuthGuard (app/_layout.tsx) ve que falta el perfil y lo manda a
            // completarlo (aviso de privacidad + paso 1 en modo `completar`).
            showAlert(
              'Cuenta creada, pero no se pudo guardar tu perfil',
              profileError instanceof Error ? profileError.message : 'Ocurrió un error inesperado.'
            );
          }
        }
      }
      router.push('/(auth)/register/step-4');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      showAlert('No se pudo reenviar el código', getClerkErrorMessage(error));
    }
  }

  return (
    <AuthScreenShell onBack={() => router.back()}>
      <StepProgress stepLabel="PASO 3 DE 3" progressLabel="Verificación de correo" progress={0.95} />
      <OtpVerificationStep
        icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
        titlePrefix="Verifica tu"
        titleHighlight="correo"
        subtitle="Ingresa el código de 6 dígitos que enviamos a tu bandeja de entrada corporativa."
        target={signUp.emailAddress ?? ''}
        targetActionLabel="Editar"
        onTargetAction={() => router.back()}
        secureChannelLabel="Canal seguro cifrado BizAInet"
        resendLabel="Reenviar código ahora"
        onResend={handleResend}
        ctaLabel="Finalizar registro"
        onSubmit={handleVerify}
        submitting={submitting}
        footer="¿No recibiste el correo? Revisa tu carpeta de spam o contacta a soporte"
      />
    </AuthScreenShell>
  );
}
