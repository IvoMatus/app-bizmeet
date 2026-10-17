type ClerkLikeError = { message?: string; longMessage?: string };

/** User-facing message from a Clerk Future-API error result (`{ error }`), with a generic fallback. */
export function getClerkErrorMessage(error: ClerkLikeError | null | undefined): string {
  return error?.longMessage ?? error?.message ?? 'Ocurrió un error inesperado.';
}
