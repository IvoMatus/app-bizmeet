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

  useEffect(() => {
    if (!user) return;
    getToken()
      .then((token) => (token ? fetchUserProfile(user.id, token) : null))
      .then((profile) => {
        if (profile?.fotoPerfilUrl) setAvatar({ uri: profile.fotoPerfilUrl });
      })
      .catch(() => {
        // ponytail: si falla, se queda con el avatar mock; no bloquea la navegación.
      });
  }, [user, getToken]);

  return <ProfileAvatarContext.Provider value={avatar}>{children}</ProfileAvatarContext.Provider>;
}

export function useProfileAvatar() {
  return useContext(ProfileAvatarContext);
}
