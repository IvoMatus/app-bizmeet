type ClerkLikeError = { code?: string; message?: string; longMessage?: string };

/** Mensajes conocidos de Clerk traducidos al español, por código estable de error. */
const ERROR_MESSAGES_ES: Record<string, string> = {
  form_password_incorrect: 'La contraseña es incorrecta. Inténtalo de nuevo o usa otro método.',
  form_identifier_not_found: 'No encontramos una cuenta con ese correo.',
  form_password_pwned:
    'Esta contraseña apareció en una filtración de datos. Por tu seguridad, elige otra.',
  form_password_validation_failed: 'La contraseña no cumple los requisitos de seguridad.',
  form_code_incorrect: 'El código ingresado es incorrecto.',
  identifier_already_signed_in: 'Ya iniciaste sesión con esta cuenta.',
  too_many_requests: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
};

/** User-facing message from a Clerk Future-API error result (`{ error }`), con traducción al español cuando el código es conocido. */
export function getClerkErrorMessage(error: ClerkLikeError | null | undefined): string {
  if (!error) return 'Ocurrió un error inesperado.';
  const known = error.code ? ERROR_MESSAGES_ES[error.code] : undefined;
  return known ?? error.longMessage ?? error.message ?? 'Ocurrió un error inesperado.';
}

/** Estados de `signIn.status` (Clerk Future API) distintos de 'complete' que no son un error de credenciales. */
const SIGN_IN_STATUS_MESSAGES_ES: Record<string, string> = {
  needs_second_factor: 'Necesitas completar la verificación en dos pasos para continuar.',
  needs_new_password: 'Necesitas definir una nueva contraseña para continuar.',
  needs_client_trust: 'Estás iniciando sesión desde un dispositivo nuevo. Verifica tu identidad para continuar.',
  needs_identifier: 'Ingresa tu correo electrónico para continuar.',
  needs_first_factor: 'Completa la verificación para continuar.',
  needs_protect_check: 'Necesitamos verificar que eres una persona real para continuar.',
};

/** Mensaje específico según el `signIn.status` cuando el sign-in no terminó en 'complete' pero tampoco hubo error. */
export function getSignInIncompleteMessage(status: string | null | undefined): string {
  return (
    (status ? SIGN_IN_STATUS_MESSAGES_ES[status] : undefined) ??
    'No se pudo completar el inicio de sesión. Verifica tus datos e intenta de nuevo.'
  );
}
