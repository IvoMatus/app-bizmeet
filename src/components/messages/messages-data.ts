/**
 * Params de `/conversacion/[id]`. Una conversación existente lleva solo `id` (la cabecera viene en
 * GET /conversations/:id/messages). `id = nueva` (desde "Contactar") lleva el destinatario, el
 * preview y la cabecera armada con los datos del post. Strings vacíos = sin dato.
 */
export type ConversationParams = {
  id: string;
  destUserId?: string;
  destCompanyId?: string;
  requiereCupo?: string;
  saldo?: string;
  empresa?: string;
  verificada?: string;
  persona?: string;
  foto?: string;
};

/** "Persona • Cargo" (lo que haya; `cargo` hoy siempre viene null). */
export function personaLine(nombre: string | null | undefined, cargo: string | null | undefined): string {
  return [nombre, cargo].filter(Boolean).join(' • ');
}
