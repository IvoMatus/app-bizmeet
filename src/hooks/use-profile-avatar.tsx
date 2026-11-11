import { useAuth, useUser } from '@clerk/expo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { fetchUserProfile } from '@/utils/api';

const ProfileAvatarContext = createContext<ImageSourcePropType>(MOCK_PROFILE.avatarUri);

/**
 * Pide la foto de perfil real una sola vez por sesión (Clerk + api-bizmeet) y la comparte con
 * el nav bar y el topbar compartidos (ver app-tabs.tsx y perfil/_layout.tsx) — evita repetir
 * el mismo fetch en cada lugar de la app que necesita mostrar el avatar del usuario.
 */
export function ProfileAvatarProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [avatar, setAvatar] = useState<ImageSourcePropType>(MOCK_PROFILE.avatarUri);

  // ponytail: deps en `user?.id`, no en `user` — Clerk puede emitir un objeto `user` nuevo con
  // los mismos datos (misma identidad), y este provider envuelve toda la app: depender de la
  // referencia completa reabre el fetch en loop en cada emisión. El `id` es el único campo del
  // que depende la llamada.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    getToken()
      .then((token) => (token ? fetchUserProfile(userId, token) : null))
      .then((profile) => {
        if (profile?.fotoPerfilUrl) setAvatar({ uri: profile.fotoPerfilUrl });
      })
      .catch(() => {
        // ponytail: si falla, se queda con el avatar mock; no bloquea la navegación.
      });
  }, [user?.id, getToken]);

  return <ProfileAvatarContext.Provider value={avatar}>{children}</ProfileAvatarContext.Provider>;
}

export function useProfileAvatar() {
  return useContext(ProfileAvatarContext);
}
