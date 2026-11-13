import { useClerk } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { AVISO_PRIVACIDAD_VERSION, PrivacyConsent } from '@/components/register/privacy-consent';

import { useRegisterForm } from './_layout';

/** Antes del paso 1: aviso de privacidad y consentimiento expreso (T1.5, 86bccd1yw).
 * Con `?completar=1` (sesión sin perfil, ver AuthGuard) "atrás" cierra la sesión: si no,
 * AuthGuard lo volvería a traer aquí.
 * Al aceptar guarda versión + fecha en el contexto del registro: viajan en POST /users
 * (`avisoPrivacidad`, obligatorio). */
export default function AvisoPrivacidadScreen() {
  const { completar } = useLocalSearchParams<{ completar?: string }>();
  const { signOut } = useClerk();
  const { setAvisoPrivacidad } = useRegisterForm();

  return (
    <AuthScreenShell
      onBack={async () => {
        if (!completar) return router.back();
        await signOut();
        router.replace('/(auth)/welcome');
      }}>
      <PrivacyConsent
        onAccept={() => {
          setAvisoPrivacidad({ version: AVISO_PRIVACIDAD_VERSION, aceptadoEn: new Date().toISOString() });
          router.push(completar ? '/(auth)/register/step-1?completar=1' : '/(auth)/register/step-1');
        }}
      />
    </AuthScreenShell>
  );
}
