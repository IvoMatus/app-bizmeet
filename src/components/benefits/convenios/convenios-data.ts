import { PLAN_LABEL } from '@/components/company/company-card';
import {
  fetchConvenio,
  fetchConvenios,
  revelarConvenio,
  type CompanyPlanCode,
  type Convenio,
  type NivelConvenio,
  type RevelarConvenioResult,
} from '@/utils/api';

/**
 * Respaldo mientras el seed de convenios no corra contra la base: mismos datos que
 * `convenio.seed.ts` de api-bizmeet. Diferencias a propósito, para ver todos los estados en la
 * app: Google Cloud trae imagen/logo (el seed no) y M365 viene `bloqueado`.
 * TODO(backend): borrar el mock (y el respaldo de `loadConvenios`) cuando el seed esté corrido.
 */
const MOCK_CONVENIOS: Convenio[] = [
  {
    id: 'mock-gcp',
    proveedor: 'Google',
    nombre: 'Google Cloud & Workspace',
    subtitulo: 'Enterprise Edition & AI Stack',
    descripcion: 'Descuento en Google Workspace Enterprise y créditos de Google Cloud para cargas de IA.',
    puntos: ['Workspace Enterprise con Gemini incluido', 'USD 10,000 en créditos de Google Cloud', 'Onboarding con un especialista'],
    condiciones: 'Válido para Miembros Premium y Titulares',
    categoria: 'Tecnología & SaaS',
    etiquetaPartner: 'PARTNER PLATINUM',
    destacado: '35% OFF PRIMER AÑO',
    tipo: 'PROMOCIONAL',
    nivel: 'PREMIUM',
    imagenUrl: 'https://picsum.photos/seed/bizmeet-gcp/800/400',
    logoUrl: 'https://picsum.photos/seed/bizmeet-gcp-logo/96',
    vigenciaHasta: '2027-12-31T00:00:00.000Z',
    accion: 'CODIGO',
    bloqueado: false,
    descripcionLarga:
      'Acelera la transformación digital de tu empresa con la infraestructura de Google Cloud y la suite colaborativa de ' +
      'Google Workspace Enterprise. Los miembros de BizAInet acceden a precios preferentes durante el primer año, créditos ' +
      'para desplegar cargas de IA con Vertex AI y Gemini, y acompañamiento de un especialista certificado en la migración.',
    etiquetas: ['INFRAESTRUCTURA & AI', 'B2B TIER-1'],
    destacados: [
      { icono: 'cloud', label: 'Créditos de Bienvenida', valor: '$10,000 USD' },
      { icono: 'percent', label: 'Descuento Workspace', valor: '35% primer año' },
      { icono: 'headset', label: 'Soporte Técnico', valor: 'Prioritario 24/7' },
    ],
    elegibilidad: [
      { titulo: 'Plan Corporativo:', texto: 'Disponible para empresas con plan Premium activo en BizAInet.' },
      { titulo: 'Cuentas nuevas:', texto: 'Aplica a organizaciones sin facturación previa en Google Cloud.' },
      { titulo: 'Un canje por empresa:', texto: 'El beneficio se asocia al RFC de la empresa activa.' },
    ],
    pasos: [
      { titulo: 'Generar cupón BizAInet', texto: 'Toca "Revelar código" para obtener tu token exclusivo de miembro.' },
      { titulo: 'Activar en Google Cloud', texto: 'Copia el token y pégalo en la consola de Google Cloud, en Facturación > Créditos.' },
      { titulo: 'Contratar Workspace', texto: 'Ingresa el mismo token al contratar Workspace Enterprise para aplicar el 35% de descuento.' },
    ],
  },
  {
    id: 'mock-skills',
    proveedor: 'Google',
    nombre: 'Google Skills',
    subtitulo: 'Cursos gratuitos de IA y productividad',
    descripcion: 'Rutas de aprendizaje gratuitas con certificado para capacitar a tu equipo en IA generativa.',
    puntos: ['Certificados oficiales', 'Contenido en español', 'A tu ritmo'],
    condiciones: 'Válido para todos los planes de pago',
    categoria: 'Tecnología & SaaS',
    destacado: 'GRATIS',
    tipo: 'BENEFICIO',
    nivel: 'BASICO',
    vigenciaHasta: '2027-06-30T00:00:00.000Z',
    accion: 'ENLACE',
    bloqueado: false,
  },
  {
    id: 'mock-m365',
    proveedor: 'Microsoft',
    nombre: 'Microsoft 365 Business',
    subtitulo: 'Business Standard + Copilot',
    descripcion: 'Licencias de Microsoft 365 Business Standard con descuento para todo tu equipo.',
    puntos: ['Correo con dominio propio', 'Teams y OneDrive de 1 TB', 'Copilot a prueba por 3 meses'],
    condiciones: 'Válido para planes Empresa y Premium',
    categoria: 'Tecnología & SaaS',
    destacado: '20% OFF',
    tipo: 'PROMOCIONAL',
    nivel: 'MEDIO',
    vigenciaHasta: '2027-03-31T00:00:00.000Z',
    accion: 'CODIGO',
    bloqueado: true,
  },
  {
    id: 'mock-cemex',
    proveedor: 'Cemex',
    nombre: 'Materiales de construcción',
    subtitulo: 'Catálogo Construrama',
    descripcion: 'Descuento en cemento, concreto y agregados en la red de distribuidores Construrama.',
    puntos: ['Entrega en obra', 'Precio preferente por volumen', 'Crédito empresarial'],
    condiciones: 'Válido para planes Empresa y Premium',
    categoria: 'Materiales',
    destacado: '10% EN CATÁLOGO',
    tipo: 'PROMOCIONAL',
    nivel: 'MEDIO',
    vigenciaHasta: '2027-12-31T00:00:00.000Z',
    accion: 'ENLACE',
    bloqueado: false,
  },
  {
    id: 'mock-homedepot',
    proveedor: 'The Home Depot',
    nombre: 'Asesoría técnica de obra',
    subtitulo: 'Programa Pro',
    descripcion: 'Asesoría gratuita de un especialista para cotizar y planear los materiales de tu proyecto.',
    puntos: ['Cotización sin costo', 'Visita técnica', 'Seguimiento del pedido'],
    condiciones: 'Válido para todos los planes de pago',
    categoria: 'Materiales',
    tipo: 'BENEFICIO',
    nivel: 'BASICO',
    vigenciaHasta: '2027-12-31T00:00:00.000Z',
    accion: 'CODIGO',
    bloqueado: false,
  },
];

const MOCK_SECRETOS: Record<string, RevelarConvenioResult> = {
  'mock-gcp': { codigo: 'BIZMEET-GCP35' },
  'mock-skills': { enlace: 'https://www.skills.google/' },
  'mock-m365': { codigo: 'BIZMEET-M365-20' },
  'mock-cemex': { enlace: 'https://www.construrama.com/' },
  'mock-homedepot': { codigo: 'BIZMEET-PRO' },
};

const esMock = (id: string) => id.startsWith('mock-');

/** API real; si falla o viene vacía (seed sin correr), cae al mock. */
export function loadConvenios(token: string, companyId?: string): Promise<Convenio[]> {
  return fetchConvenios(token, companyId)
    .then((lista) => (lista.length ? lista : MOCK_CONVENIOS))
    .catch((e: Error) => {
      if (__DEV__) console.warn('[convenios] API no disponible, usando mock:', e.message);
      return MOCK_CONVENIOS;
    });
}

export async function loadConvenio(id: string, token: string, companyId?: string): Promise<Convenio> {
  if (!esMock(id)) return fetchConvenio(id, token, companyId);
  const convenio = MOCK_CONVENIOS.find((c) => c.id === id);
  if (!convenio) throw new Error('Convenio no encontrado.');
  return convenio;
}

export async function revelar(convenio: Convenio, token: string, companyId?: string): Promise<RevelarConvenioResult> {
  if (!esMock(convenio.id)) return revelarConvenio(convenio.id, token, companyId);
  await new Promise((resolve) => setTimeout(resolve, 400));
  // Mismo 403 que la API real.
  if (convenio.bloqueado) throw new Error('Tu plan no incluye este convenio.');
  return MOCK_SECRETOS[convenio.id] ?? {};
}

/** Plan mínimo que destraba cada nivel — misma tabla que `bloqueado()` en api-bizmeet (RN-PLN-06). */
const PLAN_DEL_NIVEL: Record<NivelConvenio, CompanyPlanCode> = { BASICO: 'EMPRENDIMIENTO', MEDIO: 'EMPRESA', PREMIUM: 'PREMIUM' };

/** Aviso de un convenio bloqueado ("Disponible en plan Empresa"). */
export function avisoBloqueo(convenio: Convenio): string {
  if (convenio.partnerId) return 'Exclusivo de una red privada';
  return `Disponible en plan ${PLAN_LABEL[PLAN_DEL_NIVEL[convenio.nivel]]}`;
}

const DIA_MS = 24 * 60 * 60 * 1000;

/** La API lo da por vigente todo el día de `vigenciaHasta`, así que "hoy" es el último día. */
export function expiraLabel(vigenciaHasta: string): string {
  const dias = Math.ceil((Date.parse(vigenciaHasta) - Date.now()) / DIA_MS);
  if (dias <= 0) return 'Vence hoy';
  return `Expira en ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

/** Minúsculas y sin tildes, para que "tecnologia" encuentre "Tecnología". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function coincide(convenio: Convenio, q: string): boolean {
  if (!q) return true;
  return normalizar([convenio.nombre, convenio.proveedor, convenio.subtitulo, convenio.categoria, convenio.descripcion].join(' ')).includes(q);
}
