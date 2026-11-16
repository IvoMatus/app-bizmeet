// ponytail: diagnóstico del arranque en frío (filtrar la terminal de Expo por "[boot]"). Solo
// __DEV__ y solo los primeros 2 min desde que carga este módulo — después del arranque los
// fetch dejan de loguearse. Sacar cuando se cierre el diagnóstico del arranque lento.
const t0 = Date.now();
const BOOT_WINDOW_MS = 120_000;

/** `[boot] +<ms desde que cargó el JS de la app> <mensaje>`. */
export function bootLog(...args: unknown[]) {
  if (!__DEV__) return;
  const elapsed = Date.now() - t0;
  if (elapsed > BOOT_WINDOW_MS) return;
  console.log(`[boot] +${elapsed}ms`, ...args);
}

/** Para medir duraciones: `const end = bootTimer(); … bootLog('x', end())` → "123ms". */
export function bootTimer() {
  const start = Date.now();
  return () => `${Date.now() - start}ms`;
}
