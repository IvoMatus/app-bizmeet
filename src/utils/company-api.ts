import type { CompanyDetailMiembro } from '@/utils/api';

// Llamadas de Editar Empresa, aparte de api.ts para no pisarse con quien edita ese archivo. Mismo
// patrón que api.ts (fetch + Bearer de Clerk; el patch global de fetch que reporta el resultado de
// auth vive en api.ts y ya está cargado por el root layout).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type GalleryPhoto = { id: string; url: string };

/** GET/PATCH /companies/:id para un miembro: la vista de miembro con el perfil comercial y el contacto.
 * ponytail: extiende CompanyDetailMiembro acá en vez de en api.ts; unificar cuando se pueda tocar ese archivo. */
export type CompanyMemberView = CompanyDetailMiembro & {
  pais: 'MX';
  logoUrl: string | null;
  queHacemos: string | null;
  ofrecemos: string[];
  buscamos: string[];
  galeria: GalleryPhoto[];
  direccionComercial: string | null;
  telefono: string | null;
  correo: string | null;
};

/** Body de PATCH /companies/:id: todo opcional; null vacía un opcional, [] vacía una lista. */
export type UpdateCompanyInput = Partial<{
  name: string;
  industry: string;
  pais: 'MX';
  rfc: string;
  direccionComercial: string | null;
  telefono: string | null;
  correo: string | null;
  queHacemos: string | null;
  ofrecemos: string[];
  buscamos: string[];
}>;

/** Error de la API con el status y los mensajes (el ValidationPipe manda `message` como string[]). */
export type ApiError = Error & { status?: number; messages?: string[] };

function apiError(status: number, message: unknown, fallback: string): ApiError {
  const messages: string[] = [message ?? fallback].flat().map(String);
  return Object.assign(new Error(messages.join(' ')), { status, messages });
}

/**
 * Error de RFC para mostrar en el campo, o undefined si el error es de otra cosa. 409 = RFC duplicado
 * (o ya verificado, al editar); 400 = formato inválido.
 * ponytail: el 400 se reconoce por el texto del ValidationPipe ("El RFC no tiene un formato válido.");
 * si el backend empieza a devolver el campo con error, usar eso.
 */
export function rfcServerError(e: unknown): string | undefined {
  const { message, status, messages = [] } = e as ApiError;
  if (status === 409) return message;
  if (status === 400) return messages.find((m) => m.includes('RFC'));
  return undefined;
}

export async function updateCompany(id: string, input: UpdateCompanyInput, token: string): Promise<CompanyMemberView> {
  const response = await fetch(`${API_URL}/companies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw apiError(response.status, body?.message, `No se pudo guardar la empresa (${response.status}).`);
  }
  return response.json();
}

/** Mensajes propios para los rechazos de subida (multer los manda en inglés). */
const UPLOAD_ERROR: Record<number, string> = {
  413: 'La imagen debe pesar 5 MB o menos.',
  415: 'La imagen debe ser JPG o PNG.',
};

/** Sube una imagen (multipart "file") con File.upload de expo-file-system, igual que uploadCompanyDocument. */
async function uploadImage<T>(path: string, image: { uri: string; mimeType?: string }, token: string): Promise<T> {
  const { File, UploadType } = await import('expo-file-system');
  const { status, body } = await new File(image.uri).upload(`${API_URL}${path}`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: image.mimeType ?? 'image/jpeg',
    headers: { Authorization: `Bearer ${token}` },
  });
  let parsed: (T & { message?: unknown }) | null = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    // body no-JSON: se usa el mensaje genérico
  }
  if (status < 200 || status >= 300 || !parsed) {
    throw apiError(status, UPLOAD_ERROR[status] ?? parsed?.message, `No se pudo subir la imagen (${status}).`);
  }
  return parsed;
}

/** POST /companies/:id/logo: JPG/PNG ≤5 MB, reemplaza el anterior. `logoUrl` firmada (15 min). */
export function uploadCompanyLogo(id: string, image: { uri: string; mimeType?: string }, token: string) {
  return uploadImage<{ logoUrl: string }>(`/companies/${id}/logo`, image, token);
}

/** POST /companies/:id/gallery: JPG/PNG ≤5 MB. Devuelve la galería completa; 409 si ya hay 5. */
export function addCompanyGalleryPhoto(id: string, image: { uri: string; mimeType?: string }, token: string) {
  return uploadImage<{ galeria: GalleryPhoto[] }>(`/companies/${id}/gallery`, image, token);
}

/** DELETE /companies/:id/gallery/:fotoId: devuelve la galería sin la foto. */
export async function removeCompanyGalleryPhoto(id: string, fotoId: string, token: string): Promise<{ galeria: GalleryPhoto[] }> {
  const response = await fetch(`${API_URL}/companies/${id}/gallery/${fotoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw apiError(response.status, body?.message, `No se pudo borrar la foto (${response.status}).`);
  }
  return response.json();
}
