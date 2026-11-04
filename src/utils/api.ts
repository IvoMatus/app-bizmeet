const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type CreateUserProfileInput = {
  clerkUserId: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  pais: string;
  estado: string;
  comuna: string;
  phoneNumber: string;
  idiomas: string[];
  curp: string;
};

/** Vista Perfil que devuelve GET /users/:clerkUserId (sin CURP ni fecha de nacimiento). */
export type UserProfileView = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fotoPerfilUrl: string | null;
  celular: string;
};

/** Trae el perfil del usuario logueado desde api-bizmeet. */
export async function fetchUserProfile(clerkUserId: string, token: string): Promise<UserProfileView> {
  const response = await fetch(`${API_URL}/users/${clerkUserId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el perfil (${response.status}).`);
  }
  return response.json();
}

/** Creates the BizMeet user profile in api-bizmeet, linked by Clerk's user id. */
export async function createUserProfile(input: CreateUserProfileInput, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo guardar el perfil (${response.status}).`);
  }
}

export type CreateCompanyInput = {
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica?: 'JURIDICA' | 'NATURAL';
  planType: 'BASICO' | 'EMPRESA' | 'PREMIUM';
};

/** Creates a company in api-bizmeet. The creator (from `token`) is set as its Administrador. */
export async function createCompany(input: CreateCompanyInput, token: string): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo crear la empresa (${response.status}).`);
  }
  return response.json();
}

/** Empresa tal como la devuelve api-bizmeet (GET /companies/mine). */
export type CompanyView = {
  id: string;
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  plan: { type: 'BASICO' | 'EMPRESA' | 'PREMIUM' };
  verified: boolean;
};

export type MyCompany = { company: CompanyView; rol: 'ADMINISTRADOR' | 'INVITADO' };

export type CompanyPlanDetail = {
  type: 'BASICO' | 'EMPRESA' | 'PREMIUM';
  priceMxn: number;
  maxChatsPerMonth: number;
  maxWallPosts: number;
  maxActiveMatches: number;
  eventDiscount: number;
};

export type CompanyDocument = { tipo: string; key: string };

/** Empresa tal como la devuelve api-bizmeet (GET /companies/:id), con el plan y documentos completos. */
export type CompanyDetail = {
  id: string;
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  plan: CompanyPlanDetail;
  verified: boolean;
  documentos: CompanyDocument[];
};

/** Trae el detalle de una empresa por id. */
export async function fetchCompany(id: string, token: string): Promise<CompanyDetail> {
  const response = await fetch(`${API_URL}/companies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar la empresa (${response.status}).`);
  }
  return response.json();
}

/** Trae las empresas del usuario logueado, con su rol de membership en cada una. */
export async function fetchMyCompanies(token: string): Promise<MyCompany[]> {
  const response = await fetch(`${API_URL}/companies/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudieron cargar tus empresas (${response.status}).`);
  }
  return response.json();
}

/** Uploads the profile photo picked in step 1. The backend user profile must already exist. */
export async function uploadProfilePhoto(clerkUserId: string, uri: string, token: string, mimeType?: string): Promise<void> {
  const formData = new FormData();
  // React Native's fetch accepts this shape for a file part, even though it isn't a real Blob.
  formData.append('file', {
    uri,
    name: uri.split('/').pop() ?? 'photo.jpg',
    type: mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/users/${clerkUserId}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo subir la foto de perfil (${response.status}).`);
  }
}
