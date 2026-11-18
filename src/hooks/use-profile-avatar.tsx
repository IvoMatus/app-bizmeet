import { useUser } from '@clerk/expo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { useAuthToken } from '@/hooks/use-auth-token';

import { MOCK_PROFILE } from '@/components/profile/profile-data';
import { fetchUserProfile } from '@/utils/api';

type ProfileAvatar = { avatar: ImageSourcePropType; setAvatarUrl: (url: string) => void };

const ProfileAvatarContext = createContext<ProfileAvatar>({ avatar: MOCK_PROFILE.avatarUri, setAvatarUrl: () => {} });

/**
 * Pide la foto de perfil real una vez por montaje (Clerk + api-bizmeet) y la comparte con la
 * barra inferior y los topbars de las pestañas — evita repetir el mismo fetch en cada lugar.
 *
 * Va dentro de (tabs) (app-tabs.tsx), no en la raíz: en la raíz montaba antes del login y, en un
 * registro, pedía GET /users apenas Clerk creaba la sesión — antes de que el registro hiciera
 * POST /users y subiera la foto —, así que se quedaba con el avatar mock hasta reiniciar la app.
 * Dentro de (tabs) monta al entrar a la app (con el perfil ya completo) y vuelve a montar en
 * cada login.
 */
export function ProfileAvatarProvider({ children }: { children: ReactNode }) {
  const getToken = useAuthToken();
  const { user } = useUser();
  const [avatar, setAvatar] = useState<ImageSourcePropType>(MOCK_PROFILE.avatarUri);

  // ponytail: deps en `user?.id`, no en `user` — Clerk puede emitir un objeto `user` nuevo con
  // los mismos datos (misma identidad), y depender de la referencia completa reabre el fetch en
  // loop en cada emisión. El `id` es el único campo del que depende la llamada.
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

  return (
    <ProfileAvatarContext.Provider value={{ avatar, setAvatarUrl: (url) => setAvatar({ uri: url }) }}>
      {children}
    </ProfileAvatarContext.Provider>
  );
}

export function useProfileAvatar() {
  return useContext(ProfileAvatarContext).avatar;
}

/** Para quien sube una foto nueva (Editar Perfil): la barra y los topbars la muestran ya. */
export function useSetProfileAvatarUrl() {
  return useContext(ProfileAvatarContext).setAvatarUrl;
}
