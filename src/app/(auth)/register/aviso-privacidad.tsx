import { router } from 'expo-router';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { PrivacyConsent } from '@/components/register/privacy-consent';

/** Antes del paso 1: aviso de privacidad y consentimiento expreso (T1.5, 86bccd1yw).
 * ponytail: el consentimiento no se persiste — el backend no tiene dónde guardarlo todavía
 * (contrato pedido a backend-dev); hoy solo bloquea el avance del registro. */
export default function AvisoPrivacidadScreen() {
  return (
    <AuthScreenShell onBack={() => router.back()}>
      <PrivacyConsent onAccept={() => router.push('/(auth)/register/step-1')} />
    </AuthScreenShell>
  );
}
