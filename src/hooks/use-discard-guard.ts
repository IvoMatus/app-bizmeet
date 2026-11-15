import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { showAlert } from '@/components/ui/app-alert';

type ExitGuard = { hasUnsavedChanges: () => boolean; confirm: (onConfirm: () => void) => void };

// ponytail: singleton a nivel de módulo (mismo patrón que el cache de use-auth-token.ts), no un
// Context — es de la pantalla ENFOCADA (se registra al enfocar y se suelta al perderlo): con un
// Stack por pestaña puede haber varios formularios montados a la vez, pero solo el visible cuenta.
// Existe porque `beforeRemove` únicamente se dispara cuando el NAVEGADOR PROPIO de la pantalla
// remueve su ruta (back nativo, gesto, header, tocar la tab activa): ir a OTRA tab (ver
// bottom-tab-bar.tsx) solo cambia de foco, no remueve nada del Stack de la pestaña — por eso la
// barra inferior consulta esta guardia directamente antes de navegar.
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

  useFocusEffect(
    useCallback(() => {
      const guard: ExitGuard = {
        hasUnsavedChanges: () => hasUnsavedChangesRef.current,
        // Descartar desde la barra inferior: además de cambiar de tab, saca esta pantalla de su
        // Stack — si no, al volver a la pestaña el formulario seguiría ahí con lo "descartado".
        confirm: (onConfirm) =>
          confirmDiscard(() => {
            navigation.goBack();
            onConfirm();
          }),
      };
      activeGuard = guard;
      return () => {
        if (activeGuard === guard) activeGuard = null;
      };
    }, [navigation, confirmDiscard]),
  );

  /** Para salidas propias (ej. guardado con éxito) que no deben disparar el confirm. */
  return () => {
    allowExitRef.current = true;
  };
}
