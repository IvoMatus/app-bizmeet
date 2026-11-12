import { reportAuthOutcome } from '@/hooks/use-auth-token';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Intercepta cada fetch de la app para que `useAuthToken` sepa si el backend aceptó el token,
// sin que los ~18 call-sites tengan que reportarlo a mano. Guard contra Fast Refresh: sin él,
// cada recarga en caliente de este módulo envolvería `fetch` de nuevo sobre el wrapper anterior.
const g = globalThis as typeof globalThis & { __bizmeetFetchPatched?: boolean };
if (!g.__bizmeetFetchPatched) {
  g.__bizmeetFetchPatched = true;
  const originalFetch: typeof globalThis.fetch = globalThis.fetch;
  globalThis.fetch = (async (...args: Parameters<typeof globalThis.fetch>) => {
    const response = await originalFetch(...args);
    // Solo nos interesa si NUESTRA API rechazó el token — el patch es sobre `global.fetch`
    // completo, así que también pasan por acá la telemetría de Clerk, Spaces, etc. Sin este
    // filtro, un 4xx/5xx de cualquier otro dominio (p.ej. clerk-telemetry.com, que no afecta
    // la sesión) se contaba como rechazo de auth real y disparaba sign-out sin relación con
    // el token.
    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url;
    const isOurApi = !!API_URL && url.startsWith(API_URL);
    if (isOurApi) {
      reportAuthOutcome(response.status);
    }
    // ponytail: diagnóstico temporal — loguea el body real de cualquier respuesta no-ok, O un
    // 2xx con body vacío (el caso que de verdad hace explotar `response.json()` en el camino
    // feliz, que el chequeo `!response.ok` de arriba no cubre) — sin consumir el stream que usa
    // el código real (clona antes de leer). Sacar una vez confirmada la causa del "JSON Parse
    // error"; no corre en release (`__DEV__` es `false`).
    if (__DEV__ && isOurApi) {
      response
        .clone()
        .text()
        .then((text: string) => {
          if (!response.ok) {
            console.warn('[api][diag] respuesta no-ok', url, response.status, JSON.stringify(text));
          } else if (text.length === 0) {
            console.warn('[api][diag] respuesta 2xx con body VACÍO — acá es donde explota response.json()', url, response.status);
          }
        })
        .catch((e: unknown) => console.warn('[api][diag] no se pudo clonar/leer el body', url, response.status, e));
    }
    return response;
  }) as typeof globalThis.fetch;
}

// Guard compartido: confirmado en emulador que GET /companies/mine puede devolver 200 con body
// vacío, y `response.json()` revienta ("Unexpected end of input") en el camino feliz de
// cualquiera de los ~15 call-sites de este archivo que hacen `return response.json()` sin medir
// el body primero. Un solo patch sobre `Response.prototype.json` cubre a todos sin tocarlos uno
// por uno: 2xx/204 con body vacío → `null` en vez de tirar. NO va detrás de `__DEV__` — es el
// fix real (backend-dev lo está arreglando del lado API, esto es la red de contención del lado
// app mientras tanto, y para cualquier otro endpoint que haga lo mismo).
const gj = globalThis as typeof globalThis & { __bizmeetJsonPatched?: boolean };
if (!gj.__bizmeetJsonPatched) {
  gj.__bizmeetJsonPatched = true;
  const originalJson = Response.prototype.json;
  Response.prototype.json = function (this: Response, ...args: Parameters<typeof originalJson>) {
    return this.clone()
      .text()
      .then((text: string) => {
        if (text.length === 0) {
          if (__DEV__) console.warn('[api][diag] body vacío, devolviendo null en vez de reventar', this.url, this.status);
          return null;
        }
        return originalJson.apply(this, args);
      });
  };
}

export type CreateUserProfileInput = {
  clerkUserId: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  pais: string;
  estado: string;
  comuna: string;
  phoneNumber: string;
  idiomas: string[];
  curp: string;
};

/** Vista Perfil que devuelve GET /users/:clerkUserId (mismo shape que la respuesta del PATCH). */
export type UserProfileView = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fotoPerfilUrl: string | null;
  celular: string;
  pais: string;
  estado: string;
  comuna: string;
  idiomas: string[];
  /** Solo lectura: el backend la ignora si se manda en el PATCH. */
  curp: string;
  /** Solo lectura, ISO 8601: la edad la calcula la app (ver `profile-data.ts`). */
  fechaNacimiento: string;
  /** No tipado como union estricta: el backend puede sumar valores sin avisar al front. */
  experiencia: string;
};

/** Trae el perfil del usuario logueado desde api-bizmeet. */
export async function fetchUserProfile(clerkUserId: string, token: string): Promise<UserProfileView> {
  const response = await fetch(`${API_URL}/users/${clerkUserId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el perfil (${response.status}).`);
  }
  return response.json();
}

/** Todo opcional: mandar solo los campos que cambiaron. El celular viaja como `phoneNumber` acá
 * pero vuelve como `celular` en la respuesta (mismo shape que `UserProfileView`). `curp` y
 * `fechaNacimiento` no se pueden editar — no están en este tipo a propósito. `null` o `""` en
 * cualquier campo da 400, salvo `apellidoMaterno` que sí acepta `""`. */
export type UpdateUserProfileInput = Partial<{
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  pais: string;
  estado: string;
  comuna: string;
  phoneNumber: string;
  idiomas: string[];
}>;

/** PATCH /users/:clerkUserId. 403 si no es el perfil propio, 404 si no existe. */
export async function updateUserProfile(
  clerkUserId: string,
  patch: UpdateUserProfileInput,
  token: string,
): Promise<UserProfileView> {
  const response = await fetch(`${API_URL}/users/${clerkUserId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo guardar el perfil (${response.status}).`);
  }
  return response.json();
}

/** Creates the BizMeet user profile in api-bizmeet, linked by Clerk's user id. */
export async function createUserProfile(input: CreateUserProfileInput, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo guardar el perfil (${response.status}).`);
  }
}

export type CreateCompanyInput = {
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica?: 'JURIDICA' | 'NATURAL';
  /** v4: solo planes pagados al crear — "Red Privada" llega por invitación de un Partner. */
  plan: 'EMPRENDIMIENTO' | 'EMPRESA' | 'PREMIUM';
};

/** Creates a company in api-bizmeet. The creator (from `token`) is set as its Administrador. */
export async function createCompany(input: CreateCompanyInput, token: string): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo crear la empresa (${response.status}).`);
  }
  return response.json();
}

/** Código de plan que puede tener una empresa (confirmado con backend-dev: `plan` viaja como
 * string plano, no como objeto — `PERFIL_BASICO` no aplica, eso es "sin empresa"). */
export type CompanyPlanCode = 'RED_PRIVADA' | 'EMPRENDIMIENTO' | 'EMPRESA' | 'PREMIUM';

/** Empresa tal como la devuelve api-bizmeet (GET /companies/mine). */
export type CompanyView = {
  id: string;
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  plan: CompanyPlanCode;
  verified: boolean;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
};

export type MyCompany = { company: CompanyView; rol: 'ADMINISTRADOR' | 'INVITADO' };

export type CompanyDocument = { tipo: string };

/** GET /companies/:id para quien NO es miembro: solo campos públicos. */
export type CompanyDetailPublica = {
  id: string;
  name: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  plan: CompanyPlanCode;
  verified: boolean;
  esMiembro: false;
};

/** GET /companies/:id para un miembro activo: datos fiscales, documentos y permisos. Para
 * precio/cupos del plan, cruzar `plan` contra el catálogo de `fetchPlans`. */
export type CompanyDetailMiembro = Omit<CompanyDetailPublica, 'esMiembro'> & {
  esMiembro: true;
  rol: 'ADMINISTRADOR' | 'INVITADO';
  puedeCambiarPlan: boolean;
  rfc: string;
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
  documentos: CompanyDocument[];
};

/** Empresa tal como la devuelve api-bizmeet (GET /companies/:id), discriminada por `esMiembro`. */
export type CompanyDetail = CompanyDetailPublica | CompanyDetailMiembro;

/** Catálogo de un plan pagado (GET /plans, `billing.controller.ts`). Precio en USD; `cupos` son
 * los límites mensuales reales del motor de permisos (`plan-catalog.ts`). Solo trae los planes
 * contratables (`EMPRENDIMIENTO`/`EMPRESA`/`PREMIUM`) — `RED_PRIVADA`/`PERFIL_BASICO` no aparecen. */
export type PlanCatalogEntry = {
  code: 'EMPRENDIMIENTO' | 'EMPRESA' | 'PREMIUM';
  precioUsdMes: number;
  muroCompleto: boolean;
  directorioCompleto: boolean;
  comentar: boolean;
  recibirConversaciones: boolean;
  aparecerEnDirectorio: boolean;
  prioritarias: boolean;
  cupos: {
    publicacionesPorTipoMes: number;
    iniciarConversacionesMes: number;
    sugerenciasMes: number;
    contactos: number;
  };
};

/** GET /plans — catálogo de planes contratables, con precio y cupos reales (pantalla "Elegir plan"). */
export async function fetchPlans(token: string): Promise<PlanCatalogEntry[]> {
  const response = await fetch(`${API_URL}/plans`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el catálogo de planes (${response.status}).`);
  }
  return response.json();
}

/** Trae el detalle de una empresa por id. */
export async function fetchCompany(id: string, token: string): Promise<CompanyDetail> {
  const response = await fetch(`${API_URL}/companies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar la empresa (${response.status}).`);
  }
  return response.json();
}

export type CompanyContext = {
  /** Estado real de la empresa (T2.3, campo nuevo a nivel raíz). `contexto.bloqueada` es otra
   * cosa (deriva de reglas de negocio existentes) — no asumir que son sinónimos; con
   * `SKIP_STRIPE=true` esto no cambia nada en dev, pero cuando Stripe esté activo
   * `estado: 'PENDIENTE_PAGO'` implica `contexto.plan === 'PERFIL_BASICO'` aunque el plan
   * elegido (guardado en `company.plan`) sea otro. */
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
  contexto: { tipoEmpresa: string; plan: unknown; rol: string; bloqueada: boolean };
  alcance: unknown;
  /** Período de los cupos mensuales ('YYYY-MM') con el que se calcularon `derechos`. */
  periodo: string;
  derechos: Record<string, { permitida: boolean; motivo?: string; saldo: number | null }>;
};

/** GET /companies/:id/context — incluye `estado` a nivel raíz (T2.3) y `contexto.bloqueada`
 * (campo aparte, no confundir: ver comentario de `CompanyContext`). */
export async function fetchCompanyContext(companyId: string, token: string): Promise<CompanyContext> {
  const response = await fetch(`${API_URL}/companies/${companyId}/context`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el contexto de la empresa (${response.status}).`);
  }
  return response.json();
}

/** Trae las empresas del usuario logueado, con su rol de membership en cada una. */
export async function fetchMyCompanies(token: string): Promise<MyCompany[]> {
  const response = await fetch(`${API_URL}/companies/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudieron cargar tus empresas (${response.status}).`);
  }
  // Body vacío (ver guard de Response.prototype.json más arriba) → sin empresas, no un error.
  return (await response.json()) ?? [];
}

// --- Publicaciones (T3.1/T3.2, módulo `post` de api-bizmeet) ---

export type TipoPublicacion = 'OFERTA' | 'REQUERIMIENTO' | 'CONOCIMIENTO';
export type SubtipoPublicacion = 'SERVICIO' | 'PRODUCTO' | 'TRABAJO';

/** `url` solo viene en `GET /posts/feed` y `GET /posts/:id` (firmada, vence a los 15 min — no
 * cachear el valor, volver a pedir el post/feed en vez de reusarla). `POST /posts` no la manda
 * ni la espera: ahí `adjuntos` va solo con `{ tipo, key }`. */
export type AdjuntoView = { tipo: 'IMAGEN' | 'VIDEO'; key: string; url?: string };

/** `rubros` son códigos del catálogo SCIAN (ver `fetchRubros`), no texto libre. */
export type RubroCodigo = string;

/** Shape real de `Post` (ver api-bizmeet/src/modules/post/domain/entities/post.entity.ts). */
export type PostView = {
  id: string;
  autorUserId: string;
  companyId: string;
  tipo: TipoPublicacion;
  subtipo: SubtipoPublicacion | null;
  rubros: RubroCodigo[];
  titulo: string;
  descripcion: string;
  adjuntos: AdjuntoView[];
  estado: 'PUBLICADA' | 'OCULTA' | 'ELIMINADA';
  createdAt: string;
  /** `GET /posts/feed` en vista COMPLETA ya trae esto embebido — evita el N+1 de pedir
   * `GET /companies/:id` por cada autor distinto del feed (ver `post-card.tsx`). */
  empresa: { id: string; name: string; tipo: 'CLUB' | 'CLIENTE' | 'PARTNER'; verified: boolean };
};

/** RN-PUB-06: lo único que ve el perfil básico de un requerimiento. */
export type PostSinDetalleView = {
  id: string;
  tipo: TipoPublicacion;
  subtipo: SubtipoPublicacion | null;
  titulo: string;
  rubros: RubroCodigo[];
  createdAt?: string;
};

export type FeedView =
  | { vista: 'COMPLETA'; items: PostView[]; nextCursor: string | null }
  | { vista: 'SIN_DETALLE'; items: PostSinDetalleView[]; nextCursor: string | null; cta: 'CREAR_EMPRESA' };

export type FeedParams = { companyId?: string; rubro?: string; cursor?: string; limit?: number };

/** GET /posts/feed — único endpoint de publicaciones implementado hoy en api-bizmeet. */
export async function fetchPostsFeed(params: FeedParams, token: string): Promise<FeedView> {
  const qs = new URLSearchParams();
  if (params.companyId) qs.set('companyId', params.companyId);
  if (params.rubro) qs.set('rubro', params.rubro);
  if (params.cursor) qs.set('cursor', params.cursor);
  qs.set('limit', String(params.limit ?? 20));

  const response = await fetch(`${API_URL}/posts/feed?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el muro (${response.status}).`);
  }
  return response.json();
}

/** Mismo envoltorio que `FeedView`, para un solo post en vez de una lista (RN-PUB-07). */
export type PostDetailView =
  | { vista: 'COMPLETA'; post: PostView }
  | { vista: 'SIN_DETALLE'; post: PostSinDetalleView; cta: 'CREAR_EMPRESA' };

/**
 * GET /posts/:id — detalle de una publicación. RN-PUB-07: la API comparte el filtro de
 * `GET /posts/feed` — sin `companyId` (lector sin empresa activa) trata al lector como perfil
 * básico y devuelve `vista: 'SIN_DETALLE'` para cualquier publicación que no sea REQUERIMIENTO
 * (404 a propósito, no un bug). Mandar siempre la misma empresa activa que usa `fetchPostsFeed`.
 */
export async function fetchPost(id: string, token: string, companyId?: string): Promise<PostDetailView> {
  const qs = companyId ? `?companyId=${companyId}` : '';
  const response = await fetch(`${API_URL}/posts/${id}${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar la publicación (${response.status}).`);
  }
  return response.json();
}

export type CreatePostInput = {
  companyId: string;
  tipo: TipoPublicacion;
  subtipo?: SubtipoPublicacion;
  /** Códigos del catálogo SCIAN (ver `fetchRubros`). v4: sin tope, pero no se repiten; cada
   * rubro consume su propio cupo (RN-PUB-01/DC-01) — "hasta 3 rubros" del plan v3 quedó obsoleto. */
  rubros: RubroCodigo[];
  titulo: string;
  descripcion: string;
  adjuntos?: AdjuntoView[];
};

/**
 * POST /posts — contrato confirmado por backend-dev. RN-PUB-01: el servidor valida y descuenta
 * el cupo (uno por rubro) en una sola operación. 201 con la publicación completa (mismo shape
 * que un ítem `vista: 'COMPLETA'` del feed). 400 datos inválidos (incl. `rubros` con código
 * inexistente o repetido), 403 empresa bloqueada o plan no la incluye, 409 sin cupo suficiente.
 */
export async function createPost(input: CreatePostInput, token: string): Promise<PostView> {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo crear la publicación (${response.status}).`);
  }
  return response.json();
}

export type CupoDecision = { permitida: boolean; saldo: number; limite: number; motivo?: string };
export type PostQuotaView = { periodo: string; cupos: Record<TipoPublicacion, CupoDecision> };

/** GET /posts/quota?companyId= — contrato confirmado por backend-dev (RN-PUB-03). */
export async function fetchPostQuota(companyId: string, token: string): Promise<PostQuotaView> {
  const response = await fetch(`${API_URL}/posts/quota?companyId=${companyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el saldo de publicaciones (${response.status}).`);
  }
  return response.json();
}

/** Nodo del catálogo SCIAN (PA-10). Solo primer nivel por ahora (`padre` siempre `null`). */
export type Rubro = { codigo: RubroCodigo; nombre: string; padre: RubroCodigo | null };

/** GET /catalogs/rubros — contrato confirmado por backend-dev (PA-10, 20 sectores). */
export async function fetchRubros(token: string): Promise<Rubro[]> {
  const response = await fetch(`${API_URL}/catalogs/rubros`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el catálogo de rubros (${response.status}).`);
  }
  return response.json();
}

/** POST /posts/media — multipart (campo "file" + companyId); JPG/PNG/WebP ≤10MB, MP4/MOV ≤50MB. */
export async function uploadPostMedia(companyId: string, uri: string, mimeType: string, token: string): Promise<AdjuntoView> {
  // Mismo motivo que uploadProfilePhoto: fetch/Blob no es confiable sobre file:// en Expo 57+.
  const { File, UploadType } = await import('expo-file-system');
  const file = new File(uri);
  const { status, body } = await file.upload(`${API_URL}/posts/media`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType,
    parameters: { companyId },
    headers: { Authorization: `Bearer ${token}` },
  });
  let parsed: (AdjuntoView & { url?: string; message?: string }) | null;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = null;
  }
  if (status < 200 || status >= 300 || !parsed) {
    throw new Error(parsed?.message ?? `No se pudo subir el archivo (${status}).`);
  }
  return { tipo: parsed.tipo, key: parsed.key, url: parsed.url };
}

// --- Notificaciones (T2.5, módulo `notification` de api-bizmeet) ---

export type NotificationItemType = 'invitation' | 'payment' | 'team';
export type NotificationItemStatus = 'pending' | 'success' | 'error';

/** GET /notifications — item tal como lo devuelve el backend. `title`/`body` ya vienen armados
 * server-side; `actionLabel`/`actionRoute` NO existen ahí a propósito (el backend no se acopla
 * a la navegación del front) — se arman en `notifications-data.ts`. */
export type NotificationItemView = {
  id: string;
  type: NotificationItemType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  status?: NotificationItemStatus;
  companyId: string;
  invitationId?: string;
};

export type NotificationsPage = { items: NotificationItemView[]; nextCursor: string | null };

/** GET /notifications?cursor=&limit= — más nuevas primero; sin más páginas si `items.length < limit`. */
export async function fetchNotifications(token: string, params: { cursor?: string; limit?: number } = {}): Promise<NotificationsPage> {
  const limit = params.limit ?? 20;
  const qs = new URLSearchParams();
  if (params.cursor) qs.set('cursor', params.cursor);
  qs.set('limit', String(limit));

  const response = await fetch(`${API_URL}/notifications?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudieron cargar las notificaciones (${response.status}).`);
  }
  const items: NotificationItemView[] = await response.json();
  return { items, nextCursor: items.length < limit ? null : (items[items.length - 1]?.id ?? null) };
}

// --- Equipo e Invitaciones (T2.2, módulos `membership`/`invitation` de api-bizmeet) ---

/** Rol real de empresa. El backend NO tiene roles de negocio (Comercial/Operativo/etc.),
 * solo estos dos — ver `permission-engine.ts` en api-bizmeet. */
export type RolEmpresa = 'ADMINISTRADOR' | 'INVITADO';

/** GET /companies/:id/members. Ojo: no trae `email` — el backend no lo expone en esta vista. */
export type MiembroView = { userId: string; rol: RolEmpresa; nombre: string | null };

export async function fetchCompanyMembers(companyId: string, token: string): Promise<MiembroView[]> {
  const response = await fetch(`${API_URL}/companies/${companyId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cargar el equipo (${response.status}).`);
  }
  return response.json();
}

export async function updateCompanyMemberRole(
  companyId: string,
  userId: string,
  rol: RolEmpresa,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/companies/${companyId}/members/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rol }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cambiar el rol (${response.status}).`);
  }
}

export async function removeCompanyMember(companyId: string, userId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/companies/${companyId}/members/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo quitar al colaborador (${response.status}).`);
  }
}

export type EstadoInvitacion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA';

/** GET /companies/:id/invitations — vigentes de la empresa (solo Administrador). */
export type CompanyInvitationView = {
  id: string;
  companyId: string;
  correo: string;
  rol: RolEmpresa;
  invitadaPor: string;
  estado: EstadoInvitacion;
  venceEn: string;
};

export async function fetchCompanyInvitations(companyId: string, token: string): Promise<CompanyInvitationView[]> {
  const response = await fetch(`${API_URL}/companies/${companyId}/invitations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudieron cargar las invitaciones (${response.status}).`);
  }
  return response.json();
}

/** POST /companies/:id/invitations — 409 si la empresa llegó al límite de contactos del plan. */
export async function inviteCompanyMember(
  companyId: string,
  correo: string,
  rol: RolEmpresa,
  token: string,
): Promise<CompanyInvitationView> {
  const response = await fetch(`${API_URL}/companies/${companyId}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ correo, rol }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo enviar la invitación (${response.status}).`);
  }
  return response.json();
}

export async function cancelCompanyInvitation(companyId: string, invitationId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/companies/${companyId}/invitations/${invitationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo cancelar la invitación (${response.status}).`);
  }
}

/** GET /invitations/mine — invitaciones recibidas por cualquiera de mis correos verificados. */
export type MyInvitationView = {
  id: string;
  companyId: string;
  companyName: string | null;
  rol: RolEmpresa;
  venceEn: string;
};

export async function fetchMyInvitations(token: string): Promise<MyInvitationView[]> {
  const response = await fetch(`${API_URL}/invitations/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudieron cargar tus invitaciones (${response.status}).`);
  }
  return response.json();
}

export async function acceptMyInvitation(invitationId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/invitations/${invitationId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo aceptar la invitación (${response.status}).`);
  }
}

export async function rejectMyInvitation(invitationId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/invitations/${invitationId}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo rechazar la invitación (${response.status}).`);
  }
}

/** Respuesta de subir la foto de perfil. El backend puede devolver la URL final en Spaces o body vacío. */
export type UploadProfilePhotoResult = { fotoPerfilUrl?: string };

/** Sube/reemplaza la foto de perfil (DO Spaces del lado backend). El perfil del usuario debe existir ya. */
export async function uploadProfilePhoto(
  clerkUserId: string,
  uri: string,
  token: string,
  mimeType?: string,
): Promise<UploadProfilePhotoResult> {
  // `fetch(uri).blob()` sobre un archivo local (file:// o content://) no es confiable con el
  // fetch nuevo de Expo (SDK 54+): en algunos dispositivos devuelve el texto "File not found"
  // en vez del contenido real, sin tirar error. `File.upload` de expo-file-system lee el
  // archivo nativamente y hace el multipart él mismo, sin pasar por fetch/Blob.
  const { File, UploadType } = await import('expo-file-system');
  const file = new File(uri);
  const { status, body } = await file.upload(`${API_URL}/users/${clerkUserId}/photo`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: mimeType ?? 'image/jpeg',
    headers: { Authorization: `Bearer ${token}` },
  });
  let parsed: UploadProfilePhotoResult & { message?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = {};
  }
  if (status < 200 || status >= 300) {
    throw new Error(parsed.message ?? `No se pudo subir la foto de perfil (${status}).`);
  }
  return parsed;
}
