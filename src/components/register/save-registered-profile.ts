import type { RegisterPersonalData } from '@/app/(auth)/register/_layout';
import { createUserProfile, uploadProfilePhoto } from '@/utils/api';

/**
 * Crea el perfil de BizMeet con los datos del paso 1 y sube la foto si la hay. Lo usan el alta
 * por correo (paso 3a, después de verificar el código) y el completado de perfil de una cuenta
 * que ya existe en Clerk sin perfil (alta con Google) — ver paso 1 en modo `completar`.
 */
export async function saveRegisteredProfile(clerkUserId: string, data: RegisterPersonalData, token: string): Promise<void> {
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
}
