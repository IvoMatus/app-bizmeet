import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';

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
};

type RegisterFormContextValue = {
  personalData: RegisterPersonalData | null;
  setPersonalData: (data: RegisterPersonalData) => void;
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

  return (
    <RegisterFormContext.Provider value={{ personalData, setPersonalData }}>
      <Stack screenOptions={{ headerShown: false }} />
    </RegisterFormContext.Provider>
  );
}
