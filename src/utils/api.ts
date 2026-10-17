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
export async function fetchUserProfile(clerkUserId: string): Promise<UserProfileView> {
  const response = await fetch(`${API_URL}/users/${clerkUserId}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el perfil (${response.status}).`);
  }
  return response.json();
}

/** Creates the BizMeet user profile in api-bizmeet, linked by Clerk's user id. */
export async function createUserProfile(input: CreateUserProfileInput): Promise<void> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo guardar el perfil (${response.status}).`);
  }
}

/** Uploads the profile photo picked in step 1. The backend user profile must already exist. */
export async function uploadProfilePhoto(clerkUserId: string, uri: string, mimeType?: string): Promise<void> {
  const formData = new FormData();
  // React Native's fetch accepts this shape for a file part, even though it isn't a real Blob.
  formData.append('file', {
    uri,
    name: uri.split('/').pop() ?? 'photo.jpg',
    type: mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/users/${clerkUserId}/photo`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo subir la foto de perfil (${response.status}).`);
  }
}
