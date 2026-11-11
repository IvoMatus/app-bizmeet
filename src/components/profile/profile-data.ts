import type { ImageSourcePropType } from 'react-native';

import type { UserProfileView } from '@/utils/api';

// Vista Perfil del usuario logueado (real, api-bizmeet) + mapper del form de Editar Perfil.

const NO_DATA = '—';

// MVP de un solo país/estado — mismo catálogo hardcodeado que step-1-personal-data.tsx (registro)
// hasta que haya más de una opción real y convenga traerlo de un catálogo del backend.
const COUNTRY_LABELS: Record<string, string> = { MX: 'México' };
const STATE_LABELS: Record<string, string> = { CDMX: 'Ciudad de México' };
// Único valor confirmado del contrato (`experiencia: "PERFIL_BASICO" | ...`) — el resto del
// enum no está documentado todavía; sin mapa, se muestra el código crudo (fallback abajo).
const EXPERIENCE_LABELS: Record<string, string> = { PERFIL_BASICO: 'Perfil Básico' };

const birthDateFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

function formatBirthDate(iso: string): string {
  return birthDateFormatter.format(new Date(iso));
}

function calculateAge(iso: string): number {
  const birth = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthdayThisYear =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthdayThisYear) age -= 1;
  return age;
}

export type ProfileData = {
  fullName: string;
  /** Cargo / posición ejecutiva: no existe en el modelo de User — vacío a propósito, el hero lo
   * oculta en vez de mostrar "—" (ver profile-hero.tsx). */
  role: string;
  membership: string;
  birthDateLabel: string;
  ageLabel: string;
  contactLanguage: string;
  contactLanguageDetail: string;
  residence: { country: string; countryCode: string; detail: string };
  phone: string;
  curp: string;
  email: string;
  kycDocumentName: string;
  kycSummary: string;
  kycAccuracy: string;
  avatarUri: ImageSourcePropType;
  companyLogoUri: number;
  unreadNotifications: boolean;
};

/**
 * Arma la vista Perfil del usuario logueado con lo que ya devuelve api-bizmeet (nombre, foto,
 * celular, fecha de nacimiento + edad calculada, idiomas, residencia, CURP, experiencia) + correo
 * de Clerk. Cargo y KYC todavía no tienen fuente propia (KYC queda en "—"; cargo vacío, ver
 * `role`). Contraseña/robustez/2FA se sacaron del todo del Perfil — son de Clerk, no de
 * api-bizmeet (misma decisión que en editar.tsx, ya confirmada).
 */
export function buildProfileData(api: UserProfileView, clerk: { email?: string; imageUrl: string }): ProfileData {
  const idiomas = api.idiomas ?? [];
  const countryLabel = COUNTRY_LABELS[api.pais] ?? api.pais;
  const stateLabel = STATE_LABELS[api.estado] ?? api.estado;

  return {
    fullName: [api.nombre, api.apellidoPaterno, api.apellidoMaterno].filter(Boolean).join(' '),
    role: '',
    membership: EXPERIENCE_LABELS[api.experiencia] ?? api.experiencia,
    birthDateLabel: api.fechaNacimiento ? formatBirthDate(api.fechaNacimiento) : NO_DATA,
    ageLabel: api.fechaNacimiento ? `${calculateAge(api.fechaNacimiento)} años` : NO_DATA,
    contactLanguage: idiomas[0] ?? NO_DATA,
    contactLanguageDetail: idiomas.slice(1).join(' / ') || NO_DATA,
    residence: {
      country: countryLabel,
      countryCode: api.pais || NO_DATA,
      detail: api.pais ? `${countryLabel}, ${stateLabel} • ${api.comuna}` : NO_DATA,
    },
    phone: api.celular || NO_DATA,
    curp: api.curp || NO_DATA,
    email: clerk.email ?? NO_DATA,
    kycDocumentName: NO_DATA,
    kycSummary: NO_DATA,
    kycAccuracy: '',
    avatarUri: { uri: api.fotoPerfilUrl ?? clerk.imageUrl },
    companyLogoUri: MOCK_PROFILE.companyLogoUri,
    unreadNotifications: MOCK_PROFILE.unreadNotifications,
  };
}

export type EditProfileForm = {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  countryLabel: string;
  state: string;
  municipality: string;
  phone: string;
  languagesLabel: string;
  curp: string;
  birthDateLabel: string;
  ageLabel: string;
  email: string;
};

/** Mapea el perfil real al form de Editar Perfil. `countryLabel`/`languagesLabel` quedan de solo
 * lectura acá: país e idiomas todavía no tienen picker (ver `SelectField`, sin UI interactiva) —
 * y `curp`/fecha de nacimiento tampoco se editan porque el backend los ignora si se mandan. */
export function buildEditProfileForm(api: UserProfileView, email: string): EditProfileForm {
  const idiomas = api.idiomas ?? [];
  return {
    firstName: api.nombre,
    paternalLastName: api.apellidoPaterno,
    maternalLastName: api.apellidoMaterno ?? '',
    countryLabel: COUNTRY_LABELS[api.pais] ?? api.pais,
    state: api.estado,
    municipality: api.comuna,
    phone: api.celular,
    languagesLabel: idiomas.join(' / ') || NO_DATA,
    curp: api.curp,
    birthDateLabel: api.fechaNacimiento ? formatBirthDate(api.fechaNacimiento) : NO_DATA,
    ageLabel: api.fechaNacimiento ? `${calculateAge(api.fechaNacimiento)} años` : NO_DATA,
    email,
  };
}

/** Chrome compartido sin fuente propia todavía (fuera de alcance de este cambio): logo de la
 * empresa activa y el punto de notificaciones sin leer. Ver app-tabs.tsx, perfil/_layout.tsx y
 * RootBottomTabBar en el root _layout.tsx. */
export const MOCK_PROFILE = {
  avatarUri: require('../../../assets/figma/perfil/shared/avatar-alejandro.jpg') as ImageSourcePropType,
  companyLogoUri: require('../../../assets/figma/perfil/shared/empresa-activa-logo.jpg') as number,
  unreadNotifications: true,
};
