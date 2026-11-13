import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';

import type { AvisoPrivacidad } from '@/utils/api';

export type RegisterPersonalData = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: Date;
  pais: string;
  estado: string;
  comuna: string;
  idiomas: string[];
  curp: string;
  /** E.164, combined from codigoPais + celular in step 1. */
  phoneNumber: string;
  /** Local file URI picked in step 1; uploaded to the backend once the profile exists (step 3b). */
  fotoPerfilUri?: string;
  /** Foto de la identificación oficial (paso 1); se sube después de crear el perfil. */
  documentoIdentidadUri?: string;
};

type RegisterFormContextValue = {
  personalData: RegisterPersonalData | null;
  setPersonalData: (data: RegisterPersonalData) => void;
  /** Lo fija la pantalla del aviso de privacidad al aceptar; POST /users lo exige. */
  avisoPrivacidad: AvisoPrivacidad | null;
  setAvisoPrivacidad: (aviso: AvisoPrivacidad) => void;
};

const RegisterFormContext = createContext<RegisterFormContextValue | null>(null);

/** Carries step 1's personal data forward to step 2, where the Clerk account is created. */
export function useRegisterForm() {
  const ctx = useContext(RegisterFormContext);
  if (!ctx) throw new Error('useRegisterForm must be used within the (auth)/register flow');
  return ctx;
}

export default function RegisterLayout() {
  const [personalData, setPersonalData] = useState<RegisterPersonalData | null>(null);
  const [avisoPrivacidad, setAvisoPrivacidad] = useState<AvisoPrivacidad | null>(null);

  return (
    <RegisterFormContext.Provider value={{ personalData, setPersonalData, avisoPrivacidad, setAvisoPrivacidad }}>
      <Stack screenOptions={{ headerShown: false }} />
    </RegisterFormContext.Provider>
  );
}
