import type { ConversacionEnBandeja } from '@/utils/api';

/**
 * Params de `/conversacion/[id]`. `id` es el de la conversación o `nueva` (desde "Contactar", con
 * `dest*` + el preview). La cabecera (empresa/persona/fotos) viaja en la ruta: el contrato no tiene
 * un GET de una conversación sola. Strings vacíos = sin dato.
 */
export type ConversationParams = {
  id: string;
  empresa?: string;
  verificada?: string;
  persona?: string;
  logo?: string;
  foto?: string;
  destUserId?: string;
  destCompanyId?: string;
  requiereCupo?: string;
  saldo?: string;
};

/** "Persona • Cargo" (lo que haya; `cargo` hoy siempre viene null). */
export function personaLine(nombre: string | null | undefined, cargo: string | null | undefined): string {
  return [nombre, cargo].filter(Boolean).join(' • ');
}

export function conversationParams({ id, contraparte }: ConversacionEnBandeja): ConversationParams {
  return {
    id,
    empresa: contraparte.empresa?.name ?? 'Empresa no disponible',
    verificada: contraparte.empresa?.verified ? '1' : '',
    persona: personaLine(contraparte.nombre, contraparte.cargo),
    logo: contraparte.empresa?.logoUrl ?? '',
    foto: contraparte.fotoUrl ?? '',
  };
}
