import { useUser } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useAuthToken } from '@/hooks/use-auth-token';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { saveRegisteredProfile } from '@/components/register/save-registered-profile';
import { StepProgress } from '@/components/register/step-progress';
import { Step1PersonalData, type PersonalDataForm } from '@/components/register/step-1-personal-data';
import { showAlert } from '@/components/ui/app-alert';

import { useRegisterForm, type RegisterPersonalData } from './_layout';

function toPhoneNumber(data: PersonalDataForm) {
  return `${data.codigoPais}${data.celular.replace(/\s+/g, '')}`;
}

function toPersonalData(data: PersonalDataForm): RegisterPersonalData {
  return {
    nombre: data.nombre,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    fechaNacimiento: data.fechaNacimiento,
    pais: data.pais,
    estado: data.estado,
    comuna: data.comuna,
    idiomas: data.idiomas,
    curp: data.curp,
    phoneNumber: toPhoneNumber(data),
    fotoPerfilUri: data.fotoPerfilUri,
  };
}

/**
 * Paso 1 del registro. Con `?completar=1` (cuenta de Clerk ya creada sin perfil de BizMeet, p. ej.
 * alta con Google; ver AuthGuard en app/_layout.tsx) no hay pasos 2/3: guarda el perfil acá mismo
 * y va directo al paso final.
 */
export default function Step1Screen() {
  const { setPersonalData } = useRegisterForm();
  const { completar } = useLocalSearchParams<{ completar?: string }>();
  const { user } = useUser();
  const getToken = useAuthToken();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data: PersonalDataForm) {
    const personalData = toPersonalData(data);
    if (!completar) {
      setPersonalData(personalData);
      router.push('/(auth)/register/step-2');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token || !user) throw new Error('No se pudo obtener la sesión.');
      await saveRegisteredProfile(user.id, personalData, token);
      router.replace('/(auth)/register/step-4');
    } catch (e) {
      showAlert('No se pudo guardar tu perfil', e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenShell onBack={() => router.back()}>
      {completar ? (
        <StepProgress stepLabel="COMPLETA TU PERFIL" progressLabel="Último paso" progress={0.9} />
      ) : (
        <StepProgress stepLabel="PASO 1 DE 3" progressLabel="33% completado" progress={0.33} />
      )}
      <Step1PersonalData
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={completar ? 'Finalizar registro' : undefined}
        initialValues={completar ? { nombre: user?.firstName ?? '', apellidoPaterno: user?.lastName ?? '' } : undefined}
      />
    </AuthScreenShell>
  );
}
