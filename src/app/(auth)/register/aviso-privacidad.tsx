import { useClerk } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { PrivacyConsent } from '@/components/register/privacy-consent';

/** Antes del paso 1: aviso de privacidad y consentimiento expreso (T1.5, 86bccd1yw).
 * Con `?completar=1` (sesión sin perfil, ver AuthGuard) "atrás" cierra la sesión: si no,
 * AuthGuard lo volvería a traer aquí.
 * ponytail: el consentimiento no se persiste — el backend no tiene dónde guardarlo todavía
 * (contrato pedido a backend-dev); hoy solo bloquea el avance del registro. */
export default function AvisoPrivacidadScreen() {
  const { completar } = useLocalSearchParams<{ completar?: string }>();
  const { signOut } = useClerk();

  return (
    <AuthScreenShell
      onBack={async () => {
        if (!completar) return router.back();
        await signOut();
        router.replace('/(auth)/welcome');
      }}>
      <PrivacyConsent
        onAccept={() => router.push(completar ? '/(auth)/register/step-1?completar=1' : '/(auth)/register/step-1')}
      />
    </AuthScreenShell>
  );
}
