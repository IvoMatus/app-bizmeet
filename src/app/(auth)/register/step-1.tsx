import { router } from 'expo-router';

import { AuthScreenShell } from '@/components/register/auth-screen-shell';
import { StepProgress } from '@/components/register/step-progress';
import { Step1PersonalData, type PersonalDataForm } from '@/components/register/step-1-personal-data';

import { useRegisterForm } from './_layout';

function toPhoneNumber(data: PersonalDataForm) {
  return `${data.codigoPais}${data.celular.replace(/\s+/g, '')}`;
}

export default function Step1Screen() {
  const { setPersonalData } = useRegisterForm();

  function handleSubmit(data: PersonalDataForm) {
    setPersonalData({
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
    });
    router.push('/(auth)/register/step-2');
  }

  return (
    <AuthScreenShell onBack={() => router.back()}>
      <StepProgress stepLabel="PASO 1 DE 3" progressLabel="33% completado" progress={0.33} />
      <Step1PersonalData onSubmit={handleSubmit} />
    </AuthScreenShell>
  );
}
