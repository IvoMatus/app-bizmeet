import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { showAlert } from '@/components/ui/app-alert';

type ExitGuard = { hasUnsavedChanges: () => boolean; confirm: (onConfirm: () => void) => void };

// ponytail: singleton a nivel de módulo (mismo patrón que el cache de use-auth-token.ts), no un
// Context — solo una pantalla a la vez puede tener cambios sin guardar que proteger. Existe
// porque `beforeRemove` únicamente se dispara cuando el NAVEGADOR PROPIO de la pantalla remueve
// su ruta (back nativo, gesto, header): un tab distinto del mismo <Tabs> (ver bottom-tab-bar.tsx)
// solo cambia de foco, no remueve nada del stack anidado de "editar" — por eso la barra inferior
// consulta esta guardia directamente antes de navegar, en vez de depender de ese evento.
let activeGuard: ExitGuard | null = null;

/** Llamado por BottomTabBar antes de navegar: si hay una guardia activa con cambios sin guardar,
 * confirma con el usuario; si no, deja pasar la navegación sin preguntar. */
export function confirmExitIfNeeded(onConfirm: () => void) {
  if (activeGuard?.hasUnsavedChanges()) {
    activeGuard.confirm(onConfirm);
  } else {
    onConfirm();
  }
}

/**
 * Guard de salida: si hay cambios sin guardar e intentan salir de la pantalla —header, gesto
 * nativo de volver, back de Android, o la barra inferior (vía `confirmExitIfNeeded` arriba)—
 * intercepta con un confirm en vez de perder el progreso. Sin cambios, deja salir sin preguntar.
 */
export function useDiscardGuard(
  hasUnsavedChanges: boolean,
  opts?: { title?: string; message?: string },
) {
  const navigation = useNavigation();
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const allowExitRef = useRef(false);
  const title = opts?.title ?? '¿Descartar cambios?';
  const message = opts?.message ?? 'Perderás los cambios no guardados.';

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const confirmDiscard = useCallback(
    (onConfirm: () => void) => {
      showAlert(title, message, [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            allowExitRef.current = true;
            onConfirm();
          },
        },
      ]);
    },
    [title, message],
  );

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (allowExitRef.current || !hasUnsavedChangesRef.current) return;
        e.preventDefault();
        confirmDiscard(() => navigation.dispatch(e.data.action));
      }),
    [navigation, confirmDiscard],
  );

  useEffect(() => {
    activeGuard = { hasUnsavedChanges: () => hasUnsavedChangesRef.current, confirm: confirmDiscard };
    return () => {
      if (activeGuard?.confirm === confirmDiscard) activeGuard = null;
    };
  }, [confirmDiscard]);

  /** Para salidas propias (ej. guardado con éxito) que no deben disparar el confirm. */
  return () => {
    allowExitRef.current = true;
  };
}
