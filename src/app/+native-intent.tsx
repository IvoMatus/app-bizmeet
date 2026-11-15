/**
 * Regreso de Stripe con la app abierta: `plan.tsx` lo recibe de `openAuthSessionAsync` y ya hace
 * `router.replace` a billing-return (con `companyId`) dentro del Stack de su pestaña. En Android el
 * mismo deep link también llega a expo-router, que lo abriría OTRA vez — y como es una ruta
 * compartida, en (company) (match alfabético de un link sin grupo), aunque el pago se haya
 * iniciado desde el Muro: doble pantalla. Con la app abierta se ignora acá; en frío (app cerrada
 * mientras se pagaba) sí se abre, con Mis Empresas debajo (anchor de (company)).
 * expo-web-browser escucha el link por su cuenta, así que esto no le corta el resultado a plan.tsx.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  return !initial && path.includes('empresa/billing-return') ? null : path;
}
