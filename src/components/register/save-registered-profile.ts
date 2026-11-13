import type { RegisterPersonalData } from '@/app/(auth)/register/_layout';
import { createUserProfile, uploadIdentityDocument, uploadProfilePhoto, type AvisoPrivacidad } from '@/utils/api';

/**
 * Crea el perfil de BizMeet con los datos del paso 1 + el consentimiento del aviso de privacidad,
 * y después sube la foto y la identificación oficial si las hay. Lo usan el alta por correo (paso 3a,
 * después de verificar el código) y el completado de perfil de una cuenta que ya existe en Clerk sin
 * perfil (alta con Google) — ver paso 1 en modo `completar`.
 *
 * Si falla crear el perfil, tira. Si falla subir la identificación, el perfil queda creado y devuelve
 * el motivo para avisarle al usuario (la puede volver a subir desde su Perfil). La foto es opcional y
 * no avisa.
 */
export async function saveRegisteredProfile(
  clerkUserId: string,
  data: RegisterPersonalData,
  avisoPrivacidad: AvisoPrivacidad,
  token: string,
): Promise<{ identificacionError: string | null }> {
  await createUserProfile(
    {
      clerkUserId,
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      fechaNacimiento: data.fechaNacimiento.toISOString(),
      pais: data.pais,
      estado: data.estado,
      comuna: data.comuna,
      phoneNumber: data.phoneNumber,
      idiomas: data.idiomas,
      curp: data.curp,
      avisoPrivacidad,
    },
    token,
  );

  if (data.fotoPerfilUri) {
    try {
      await uploadProfilePhoto(clerkUserId, data.fotoPerfilUri, token);
    } catch {
      // ponytail: la foto es opcional; no bloquea el alta. Se puede volver a subir desde Editar perfil.
    }
  }

  if (!data.documentoIdentidadUri) return { identificacionError: null };
  try {
    await uploadIdentityDocument(clerkUserId, data.documentoIdentidadUri, token);
    return { identificacionError: null };
  } catch (e) {
    return { identificacionError: e instanceof Error ? e.message : 'No se pudo subir la identificación.' };
  }
}

/** Texto del aviso cuando el perfil se creó pero la identificación no se pudo subir. */
export function identificacionPendienteMensaje(motivo: string) {
  return `${motivo} Tu cuenta ya está creada: puedes subir tu identificación desde tu Perfil.`;
}
