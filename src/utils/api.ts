const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

/** Vista Perfil que devuelve GET /users/:clerkUserId (sin CURP ni fecha de nacimiento). */
export type UserProfileView = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fotoPerfilUrl: string | null;
  celular: string;
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

/** Empresa tal como la devuelve api-bizmeet (GET /companies/mine). */
export type CompanyView = {
  id: string;
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  plan: { type: 'EMPRENDIMIENTO' | 'EMPRESA' | 'PREMIUM' };
  verified: boolean;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
};

export type MyCompany = { company: CompanyView; rol: 'ADMINISTRADOR' | 'INVITADO' };

export type CompanyPlanDetail = {
  type: 'EMPRENDIMIENTO' | 'EMPRESA' | 'PREMIUM';
  priceMxn: number;
  maxChatsPerMonth: number;
  maxWallPosts: number;
  maxActiveMatches: number;
  eventDiscount: number;
};

export type CompanyDocument = { tipo: string; key: string };

/** Empresa tal como la devuelve api-bizmeet (GET /companies/:id), con el plan y documentos completos. */
export type CompanyDetail = {
  id: string;
  name: string;
  rfc: string;
  industry: string;
  tipo: 'CLUB' | 'CLIENTE' | 'PARTNER';
  formaJuridica: 'JURIDICA' | 'NATURAL' | null;
  plan: CompanyPlanDetail;
  verified: boolean;
  documentos: CompanyDocument[];
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'BLOQUEADA';
};

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
  return response.json();
}

// --- Publicaciones (T3.1/T3.2, módulo `post` de api-bizmeet) ---

export type TipoPublicacion = 'OFERTA' | 'REQUERIMIENTO' | 'CONOCIMIENTO';
export type SubtipoPublicacion = 'SERVICIO' | 'PRODUCTO' | 'TRABAJO';

export type AdjuntoView = { tipo: 'IMAGEN' | 'VIDEO'; key: string };

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

/**
 * GET /posts/:id — detalle de una publicación.
 * TODO: confirmar con backend-dev — `post.controller.ts` hoy solo expone `GET /posts/feed`;
 * esta ruta todavía no existe (404 esperado hasta que se implemente).
 */
export async function fetchPost(id: string, token: string): Promise<PostView> {
  const response = await fetch(`${API_URL}/posts/${id}`, {
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
  return { tipo: parsed.tipo, key: parsed.key };
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
