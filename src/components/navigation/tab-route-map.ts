/**
 * Mapea cada ruta "hija" que cuelga del Stack raíz (fuera de (tabs)) a la key de tab que debe
 * marcarse activa en la BottomTabBar compartida (ver root `_layout.tsx`, que la renderiza como
 * sibling del Stack para estas rutas — así se mantiene el stack nativo intacto: back, historial
 * y animaciones no se tocan). Agregar una pantalla nueva fuera de (tabs) = agregar una línea
 * acá.
 *
 * La key de cada entrada es `segments.join('/')` tal como lo devuelve `useSegments()`: las
 * rutas dinámicas quedan con el patrón literal del archivo (ej. '[id]'), no con el valor
 * resuelto.
 *
 * Rutas no listadas acá (incluida toda la subrama (tabs) y (auth)) no activan esta barra: las
 * de (tabs) ya tienen la suya propia (ver app-tabs.tsx) y (auth) queda sin barra a propósito.
 */
export const CHILD_ROUTE_TAB_KEY: Record<string, string> = {
  'publicacion/crear': 'index',
  'publicacion/[id]': 'index',
  'publicacion/mis-publicaciones': 'perfil',
  'empresa/crear': 'company',
  'empresa/equipo': 'company',
  'empresa/[id]': 'company',
  'empresa/pagos': 'company',
  'empresa/plan': 'company',
  'beneficios/convenio/[id]': 'benefits',
  'beneficios/evento/[id]': 'benefits',
};
