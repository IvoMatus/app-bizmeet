import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { OtpVerificationStep } from '@/components/register/otp-verification-step';
import { StepProgress } from '@/components/register/step-progress';
import { showAlert } from '@/components/ui/app-alert';
import { getClerkErrorMessage } from '@/utils/clerk-error';
import { createUserProfile, uploadProfilePhoto } from '@/utils/api';

import { useRegisterForm } from './_layout';

export default function Step3aScreen() {
  const { signUp } = useSignUp();
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
            await createUserProfile({
              clerkUserId: signUp.createdUserId,
              nombre: personalData.nombre,
              apellidoPaterno: personalData.apellidoPaterno,
              apellidoMaterno: personalData.apellidoMaterno,
              fechaNacimiento: personalData.fechaNacimiento.toISOString(),
              pais: personalData.pais,
              estado: personalData.estado,
              comuna: personalData.comuna,
              phoneNumber: personalData.phoneNumber,
              idiomas: personalData.idiomas,
              curp: personalData.curp,
            });

            if (personalData.fotoPerfilUri) {
              try {
                await uploadProfilePhoto(signUp.createdUserId, personalData.fotoPerfilUri);
              } catch {
                // ponytail: photo is optional cosmetics, don't block registration over it.
                // User can re-upload later from their profile once that screen exists.
              }
            }
          } catch (profileError) {
            // ponytail: account + session already exist at this point; don't strand the user
            // over a profile-save failure, just surface it. No retry/backfill flow yet.
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
        footer="¿No recibiste el correo? Revisa tu carpeta de spam o contacta soporte"
      />
    </AuthScreenShell>
  );
}
