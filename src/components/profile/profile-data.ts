import type { ImageSourcePropType } from 'react-native';

import type { UserProfileView } from '@/utils/api';

// Mock tipado de Perfil (usado por editar y la barra de otras pestañas) + mapper del usuario logueado.

export type ProfileData = {
  fullName: string;
  role: string;
  membership: string;
  aiVerifiedScore: string;
  birthDateLabel: string;
  ageLabel: string;
  contactLanguage: string;
  contactLanguageDetail: string;
  residence: { country: string; countryCode: string; detail: string };
  phone: string;
  email: string;
  passwordChangedLabel: string;
  passwordMask: string;
  passwordStrengthLabel: string;
  kycDocumentName: string;
  kycSummary: string;
  kycAccuracy: string;
  avatarUri: ImageSourcePropType;
  companyLogoUri: number;
  unreadNotifications: boolean;
};

const NO_DATA = '—';

/**
 * Arma la vista Perfil del usuario logueado: nombre, celular y foto vienen de api-bizmeet;
 * correo y foto de respaldo de Clerk. Lo que aún no tiene fuente queda en "—".
 */
export function buildProfileData(api: UserProfileView, clerk: { email?: string; imageUrl: string }): ProfileData {
  return {
    fullName: [api.nombre, api.apellidoPaterno, api.apellidoMaterno].filter(Boolean).join(' '),
    role: NO_DATA,
    membership: NO_DATA,
    aiVerifiedScore: NO_DATA,
    birthDateLabel: NO_DATA,
    ageLabel: NO_DATA,
    contactLanguage: NO_DATA,
    contactLanguageDetail: NO_DATA,
    residence: { country: NO_DATA, countryCode: NO_DATA, detail: NO_DATA },
    phone: api.celular || NO_DATA,
    email: clerk.email ?? NO_DATA,
    passwordChangedLabel: NO_DATA,
    passwordMask: '••••••••••',
    passwordStrengthLabel: NO_DATA,
    kycDocumentName: NO_DATA,
    kycSummary: NO_DATA,
    kycAccuracy: '',
    avatarUri: { uri: api.fotoPerfilUrl ?? clerk.imageUrl },
    companyLogoUri: MOCK_PROFILE.companyLogoUri,
    unreadNotifications: false,
  };
}

export type EditProfileForm = {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  position: string;
  birthDate: string;
  languages: string;
  countryLabel: string;
  state: string;
  municipality: string;
  phone: string;
  curp: string;
  email: string;
  passwordMask: string;
  passwordStrengthLabel: string;
  twoFactorLabel: string;
  twoFactorEnabled: boolean;
};

export const MOCK_PROFILE: ProfileData = {
  fullName: 'Alejandro Hernández Castillo',
  role: 'Director de Operaciones & Estrategia',
  membership: 'SOCIO ACTIVO • PLAN BÁSICO',
  aiVerifiedScore: 'IA Verified 99.8%',
  birthDateLabel: '14 Mayo, 1988',
  ageLabel: '35 años',
  contactLanguage: 'Español',
  contactLanguageDetail: 'Inglés (Avanzado C1)',
  residence: { country: 'México', countryCode: 'MX', detail: 'México, CDMX • Miguel Hidalgo' },
  phone: '+52 55 1234 5678',
  email: 'alejandro.hernandez@empresa.com',
  passwordChangedLabel: 'Cambio: Hace 2 días',
  passwordMask: '••••••••••',
  passwordStrengthLabel: 'Robustez Máxima',
  kycDocumentName: 'INE_Alejandro_Hernandez.pdf',
  kycSummary: 'Fotografía de INE / Pasaporte aprobada mediante el algoritmo biométrico BizAInet con',
  kycAccuracy: '99.8% de precisión.',
  avatarUri: require('../../../assets/figma/perfil/shared/avatar-alejandro.jpg'),
  companyLogoUri: require('../../../assets/figma/perfil/shared/empresa-activa-logo.jpg'),
  unreadNotifications: true,
};

export const MOCK_EDIT_PROFILE: EditProfileForm = {
  firstName: 'Alejandro',
  paternalLastName: 'Hernández',
  maternalLastName: 'Castillo',
  position: 'Director de Operaciones & Estrategia',
  birthDate: '14 de Mayo, 1988',
  languages: 'Español (Nativo) / Inglés (C1)',
  countryLabel: 'México (MX)',
  state: 'CDMX',
  municipality: 'Miguel Hidalgo',
  phone: '55 1234 5678',
  curp: 'ABCD850101HDFRRN09',
  email: 'alejandro.hernandez@empresa.com',
  passwordMask: '••••••••••',
  passwordStrengthLabel: 'Robusta (Nivel 4/4)',
  twoFactorLabel: 'Activo con Google / Biz Authenticator',
  twoFactorEnabled: true,
};
