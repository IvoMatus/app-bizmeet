import { normalizar } from '@/components/benefits/convenios/convenios-data';

/**
 * Eventos B2B (Fase 2: Zoom, QR y Stripe). No hay API todavía: todo este archivo es mock.
 * TODO(backend): cuando exista GET /eventos, mover los tipos a `utils/api.ts` y borrar `EVENTOS`.
 */

/** Define el pie de la EventoCard: GRATIS → "Inscribirme Gratis", PAGO → precio + "Comprar Entrada", RESERVA → "Reservar Lugar". */
export type AccesoEvento = 'GRATIS' | 'PAGO' | 'RESERVA';

export type EntradaEvento = {
  id: string;
  nombre: string;
  descripcion: string;
  /** MXN. 0 = gratis. */
  precio: number;
  /** Precio tachado cuando la entrada está bonificada. */
  precioLista?: number;
  /** "100% BONIFICADO", "LIBERADO". */
  etiquetaPrecio?: string;
  /** "MÁS POPULAR • BENEFICIO MIEMBRO" — además la resalta. */
  popular?: string;
  cupos: string;
  nota: string;
};

export type Evento = {
  id: string;
  titulo: string;
  /** Tramo del título en color primario (detalle). */
  tituloResaltado?: string;
  categoria: string;
  sector: string;
  modalidad: 'PRESENCIAL' | 'ONLINE';
  modalidadLabel: string;
  acceso: AccesoEvento;
  accesoLabel: string;
  /** ISO sin zona = hora local del evento. */
  fecha: string;
  lugar: string;
  /** "Modo Presencial & Transmisión Simultánea". */
  formato: string;
  /** Segunda línea de la card: asistentes, cupos, etc. */
  meta: string;
  /** Pinta `meta` en ámbar ("Últimos lugares"). */
  metaUrgente?: boolean;
  /** Lado izquierdo del pie en GRATIS/RESERVA. */
  pie?: { titulo: string; texto?: string };
  /** MXN, solo PAGO. */
  precio?: number;
  imagenUrl?: string;
  /** Solo el evento de "Destacado de la semana". */
  destacado?: { edicion: string; precioMiembro: string; precioPublico: string };
  cupos: { reservados: number; total: number };
  descripcion: string;
  beneficios: { icono: string; titulo: string; texto: string }[];
  entradas: EntradaEvento[];
};

const EVENTOS: Evento[] = [
  {
    id: 'cumbre-liderazgo-2026',
    titulo: 'Cumbre Anual de Liderazgo & Minería Sostenible 2026',
    tituloResaltado: 'Liderazgo & Minería',
    categoria: 'EXCLUSIVO / NETWORKING',
    sector: 'SECTOR CONSTRUCCIÓN, ENERGÍA & MINERÍA',
    modalidad: 'PRESENCIAL',
    modalidadLabel: 'PRESENCIAL',
    acceso: 'RESERVA',
    accesoLabel: 'GRATIS SOCIOS PRO',
    fecha: '2026-12-14T09:00:00',
    lugar: 'Hotel Ritz-Carlton CDMX',
    formato: 'Modo Presencial & Transmisión Simultánea',
    meta: '147 asistentes confirmados',
    imagenUrl: 'https://picsum.photos/seed/bizmeet-cumbre/800/450',
    destacado: { edicion: 'Edición Especial', precioMiembro: '$0 MXN (Incluido)', precioPublico: 'MXN 200' },
    cupos: { reservados: 147, total: 200 },
    descripcion:
      'Únete a los directores ejecutivos y líderes más influyentes del sector. Exploraremos las últimas tendencias en ' +
      'electromovilidad pesada, plantas solares industriales y alianzas estratégicas B2B.',
    beneficios: [
      { icono: 'catering', titulo: 'Catering Gourmet Incluido', texto: 'Desayuno buffet y Almuerzo formal de negocios de alto nivel' },
      { icono: 'certificado', titulo: 'Certificación Digital Verificada', texto: 'Credencial criptográfica inmutable en Blockchain BizAInet' },
      { icono: 'networking', titulo: 'Acceso a Sala VIP & Networking', texto: 'Mesas redondas bilaterales de negociación con panelistas clave' },
    ],
    entradas: [
      {
        id: 'general',
        nombre: 'Entrada General',
        descripcion: 'Para público general o perfiles sin suscripción empresarial activa',
        precio: 200,
        cupos: '53 / 200 cupos disponibles',
        nota: 'Acreditación General',
      },
      {
        id: 'socio',
        nombre: 'Acceso Socio Pro / Premium',
        descripcion: 'Experiencia VIP presencial sin costo adicional para socios activos',
        precio: 0,
        precioLista: 200,
        etiquetaPrecio: '100% BONIFICADO',
        popular: 'MÁS POPULAR • BENEFICIO MIEMBRO',
        cupos: '12 / 50 cupos VIP disponibles',
        nota: 'FAST-PASS INCLUIDO',
      },
      {
        id: 'virtual',
        nombre: 'Pase Virtual / Streaming HD',
        descripcion: 'Transmisión 4K con interacción en vivo y preguntas a panelistas',
        precio: 0,
        etiquetaPrecio: 'LIBERADO',
        cupos: 'Acceso online ilimitado con acreditación',
        nota: 'Link 24h previas',
      },
    ],
  },
  {
    id: 'masterclass-gemelos-digitales',
    titulo: 'Masterclass: Automatización Industrial con IA & Gemelos Digitales',
    tituloResaltado: 'IA & Gemelos Digitales',
    categoria: 'FORMACIÓN / MASTERCLASS',
    sector: 'SECTOR MANUFACTURA & INDUSTRIA 4.0',
    modalidad: 'ONLINE',
    modalidadLabel: 'ONLINE / EN VIVO',
    acceso: 'GRATIS',
    accesoLabel: 'LIBERADO • GRATIS PARA TODOS',
    fecha: '2026-11-28T16:00:00',
    lugar: 'Transmisión en vivo',
    formato: 'Online en vivo con certificado',
    meta: '420 asistentes registrados',
    pie: { titulo: 'Transmisión HD', texto: 'Incluye certificado' },
    cupos: { reservados: 420, total: 1000 },
    descripcion:
      'Una sesión práctica sobre cómo llevar la planta a un gemelo digital: sensores, modelos predictivos y automatización ' +
      'con IA aplicada a procesos industriales reales.',
    beneficios: [
      { icono: 'certificado', titulo: 'Certificado de Participación', texto: 'Credencial digital verificable al finalizar la sesión' },
      { icono: 'grabacion', titulo: 'Grabación Disponible', texto: 'Acceso a la grabación completa durante 30 días' },
    ],
    entradas: [
      {
        id: 'online',
        nombre: 'Acceso Online',
        descripcion: 'Transmisión en vivo con chat de preguntas',
        precio: 0,
        etiquetaPrecio: 'LIBERADO',
        cupos: '580 / 1000 lugares disponibles',
        nota: 'Link 24h previas',
      },
    ],
  },
  {
    id: 'foro-infraestructura-renovable',
    titulo: 'Foro Bilateral de Infraestructura y Energía Renovable',
    tituloResaltado: 'Energía Renovable',
    categoria: 'FORO / BILATERAL',
    sector: 'SECTOR ENERGÍA & INFRAESTRUCTURA',
    modalidad: 'PRESENCIAL',
    modalidadLabel: 'PRESENCIAL',
    acceso: 'PAGO',
    accesoLabel: 'PAGADO PARA TODOS • MXN 500',
    fecha: '2026-12-05T10:00:00',
    lugar: 'Santiago, Chile • Torre Titanium',
    formato: 'Modo Presencial',
    meta: '88 / 100 cupos (Últimos lugares)',
    metaUrgente: true,
    precio: 500,
    cupos: { reservados: 88, total: 100 },
    descripcion:
      'Encuentro bilateral entre desarrolladores, financiadores y operadores de proyectos de energía renovable e ' +
      'infraestructura en Latinoamérica.',
    beneficios: [
      { icono: 'networking', titulo: 'Rondas de Negocio', texto: 'Agenda de reuniones 1 a 1 con inversionistas y operadores' },
      { icono: 'catering', titulo: 'Coffee Break & Almuerzo', texto: 'Incluidos durante toda la jornada' },
    ],
    entradas: [
      {
        id: 'general',
        nombre: 'Entrada General',
        descripcion: 'Acceso completo a paneles y rondas de negocio',
        precio: 500,
        cupos: '12 / 100 cupos disponibles',
        nota: 'IVA incluido',
      },
    ],
  },
  {
    id: 'mesa-ciberseguridad-fintech',
    titulo: 'Mesa Redonda: Ciberseguridad & Cumplimiento Fintech B2B',
    tituloResaltado: 'Ciberseguridad',
    categoria: 'MESA REDONDA / PRIVADA',
    sector: 'SECTOR FINTECH & SERVICIOS FINANCIEROS',
    modalidad: 'ONLINE',
    modalidadLabel: 'ONLINE INTERACTIVO',
    acceso: 'RESERVA',
    accesoLabel: 'GRATIS PLAN PRO / MXN 150 BÁSICO',
    fecha: '2026-12-10T18:00:00',
    lugar: 'Zoom Privado Encriptado',
    formato: 'Online interactivo, cupos limitados',
    meta: 'Zoom Privado Encriptado • Cupos VIP',
    pie: { titulo: 'Validación Instantánea Pro' },
    cupos: { reservados: 32, total: 40 },
    descripcion:
      'Conversación a puerta cerrada con oficiales de cumplimiento y CISOs de fintechs reguladas sobre los nuevos ' +
      'requisitos de seguridad para pagos B2B.',
    beneficios: [{ icono: 'seguridad', titulo: 'Sala Privada', texto: 'Sesión cerrada bajo reglas de Chatham House' }],
    entradas: [
      {
        id: 'pro',
        nombre: 'Socio Plan Pro',
        descripcion: 'Incluido en tu membresía Pro o Premium',
        precio: 0,
        precioLista: 150,
        etiquetaPrecio: '100% BONIFICADO',
        popular: 'BENEFICIO MIEMBRO',
        cupos: '8 / 40 cupos disponibles',
        nota: 'Validación instantánea',
      },
      {
        id: 'basico',
        nombre: 'Plan Básico',
        descripcion: 'Para perfiles con plan Emprendimiento o sin plan',
        precio: 150,
        cupos: '8 / 40 cupos disponibles',
        nota: 'Acreditación General',
      },
    ],
  },
];

export type FiltroEvento = 'TODOS' | 'PRESENCIAL' | 'ONLINE' | 'GRATIS';

export const FILTROS_EVENTO: { codigo: Exclude<FiltroEvento, 'TODOS'>; nombre: string }[] = [
  { codigo: 'PRESENCIAL', nombre: 'Presencial' },
  { codigo: 'ONLINE', nombre: 'Online / Virtual' },
  { codigo: 'GRATIS', nombre: 'Gratuitos' },
];

function coincideFiltro(evento: Evento, filtro: string): boolean {
  if (filtro === 'PRESENCIAL' || filtro === 'ONLINE') return evento.modalidad === filtro;
  // "Gratuitos": gratis para todos, o con alguna entrada sin costo.
  if (filtro === 'GRATIS') return evento.acceso === 'GRATIS' || evento.entradas.some((e) => e.precio === 0);
  return true;
}

export function buscarEventos(filtro: string, query: string): Evento[] {
  const q = normalizar(query.trim());
  return EVENTOS.filter((e) => coincideFiltro(e, filtro) && (!q || normalizar(`${e.titulo} ${e.lugar} ${e.sector}`).includes(q)));
}

export function eventoPorId(id: string): Evento | undefined {
  return EVENTOS.find((e) => e.id === id);
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** "09:00 hrs". */
export function horaLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} hrs`;
}

/** "14 Dic • 09:00 hrs". */
export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} • ${horaLabel(iso)}`;
}

/** Partes de la caja de fecha del detalle: DIC / 14 / 2026. */
export function partesFecha(iso: string) {
  const d = new Date(iso);
  return { mes: MESES[d.getMonth()].toUpperCase(), dia: String(d.getDate()), anio: String(d.getFullYear()) };
}

/** "MXN 200", o "GRATIS" si es 0. */
export function precioLabel(mxn: number): string {
  return mxn === 0 ? 'GRATIS' : `MXN ${mxn}`;
}
