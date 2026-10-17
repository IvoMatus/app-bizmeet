import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { Step2Security, type SecurityForm } from '@/components/register/step-2-security';
import { StepProgress } from '@/components/register/step-progress';
import { showAlert } from '@/components/ui/app-alert';
import { getClerkErrorMessage } from '@/utils/clerk-error';

import { useRegisterForm } from './_layout';

export default function Step2Screen() {
  const { signUp } = useSignUp();
  const { personalData } = useRegisterForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data: SecurityForm) {
    if (!personalData) return;
    setSubmitting(true);
    try {
      // ponytail: phoneNumber intentionally left out — Clerk's native phone verification
      // needs Clerk Pro. The number is saved to our own User later (step-3a); OTP provider
      // (Twilio/Meta) is pending, see ClickUp task 86bc9vcxk.
      const { error } = await signUp.password({
        emailAddress: data.email,
        password: data.password,
      });
      if (error) {
        showAlert('No se pudo crear la cuenta', getClerkErrorMessage(error));
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        showAlert('No se pudo enviar el correo de verificación', getClerkErrorMessage(sendError));
        return;
      }
      router.push('/(auth)/register/step-3a');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenShell onBack={() => router.back()}>
      <StepProgress stepLabel="PASO 2 DE 3" progressLabel="66% completado" progress={0.66} />
      <Step2Security onSubmit={handleSubmit} submitting={submitting} />
    </AuthScreenShell>
  );
}
