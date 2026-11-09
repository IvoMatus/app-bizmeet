import type { SubtipoPublicacion, TipoPublicacion } from '@/utils/api';

// Taxonomía y helpers de UI para publicaciones (T3.1/T3.2). Sin datos mock: el feed, el saldo
// de cupos y el catálogo de rubros se piden siempre al backend real (ver src/utils/api.ts).

export type PostTypeChip = { key: string; label: string; tipo: TipoPublicacion; subtipo?: SubtipoPublicacion };

/** Taxonomía real de 5 chips (Figma "Filtros"/"Crear Publicación"): oferta y requerimiento
 * llevan subtipo producto/servicio o trabajo; conocimiento no lleva subtipo. */
export const POST_TYPE_CHIPS: PostTypeChip[] = [
  { key: 'oferta-producto-servicio', label: 'Ofrezco producto/servicio', tipo: 'OFERTA', subtipo: 'PRODUCTO' },
  { key: 'oferta-trabajo', label: 'Ofrezco Trabajo', tipo: 'OFERTA', subtipo: 'TRABAJO' },
  { key: 'requerimiento-producto-servicio', label: 'Busco producto/servicio', tipo: 'REQUERIMIENTO', subtipo: 'PRODUCTO' },
  { key: 'requerimiento-trabajo', label: 'Busco Trabajo', tipo: 'REQUERIMIENTO', subtipo: 'TRABAJO' },
  { key: 'conocimiento', label: 'Publicación de información', tipo: 'CONOCIMIENTO' },
];

export const POST_TYPE_LABEL: Record<TipoPublicacion, string> = {
  OFERTA: 'Oferta',
  REQUERIMIENTO: 'Requerimiento',
  CONOCIMIENTO: 'Conocimiento',
};

/** Formateo simple de fecha relativa ("Hace 2 horas", "Hace 3 días"). */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}
