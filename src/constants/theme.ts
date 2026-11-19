/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

// Bienvenida (welcome.tsx): pantalla siempre oscura sobre la foto de fondo, igual en claro y
// oscuro — por eso un solo objeto que se esparce en los dos modos. Paleta slate/sky/emerald/
// amber/purple de Tailwind del diseño; el par chip/ícono de "Rubro" y "Match" está cruzado a
// propósito (así se ve hoy).
const WelcomeColors = {
  welcomeBackground: '#020617',
  welcomeScrimTop: 'rgba(2, 6, 23, 0.6)',
  welcomeScrimMid: 'rgba(2, 6, 23, 0.4)',
  welcomeScrimClear: 'rgba(2, 6, 23, 0)',
  welcomePanelTop: 'rgba(15, 23, 42, 0.88)',
  welcomePanelBottom: 'rgba(10, 17, 32, 0.97)',
  welcomePanelBorder: 'rgba(255, 255, 255, 0.2)',
  welcomeHandle: 'rgba(255, 255, 255, 0.3)',
  welcomeLogoCard: 'rgba(15, 23, 42, 0.65)',
  welcomeLogoBorder: 'rgba(255, 255, 255, 0.12)',
  welcomeSubtitle: 'rgba(203, 213, 225, 0.8)',
  welcomeGoogleLabel: '#0f172a',
  welcomeButton: 'rgba(30, 41, 59, 0.8)',
  welcomeButtonBorder: 'rgba(255, 255, 255, 0.15)',
  welcomeKeyChip: 'rgba(255, 255, 255, 0.1)',
  welcomeText: '#e2e8f0',
  welcomeFooter: '#94a3b8',
  welcomeArrowIcon: '#7dd3fc',
  welcomeArrowChip: 'rgba(14, 165, 233, 0.2)',
  welcomeSkyIcon: '#38bdf8',
  welcomeSkySoft: 'rgba(14, 165, 233, 0.15)',
  welcomeSkyBorder: 'rgba(56, 189, 248, 0.3)',
  welcomeEmeraldIcon: '#34d399',
  welcomeEmeraldSoft: 'rgba(16, 185, 129, 0.15)',
  welcomeEmeraldBorder: 'rgba(52, 211, 153, 0.3)',
  welcomeAmberIcon: '#fbbf24',
  welcomeAmberSoft: 'rgba(245, 158, 11, 0.15)',
  welcomeAmberBorder: 'rgba(251, 191, 36, 0.3)',
  welcomePurpleIcon: '#d8b4fe',
  welcomePurpleSoft: 'rgba(168, 85, 247, 0.15)',
  welcomePurpleBorder: 'rgba(192, 132, 252, 0.3)',
} as const;

export const Colors = {
  // T1.7 (AA): error/textMuted/warning/eyebrow/warningText ajustados (mismo tono, apenas más
  // oscuros en claro / más claros en oscuro) para llegar a 4.5:1 como texto sobre todos los fondos
  // de la app (screenBackground/card/cardElevated/surface/surfaceInset y sus *Soft).
  // ponytail: `accent` y `success` en claro siguen sin llegar a 4.5:1 como texto chico — son
  // colores de marca que también rellenan botones/chips con texto blanco; cambiarlos es decisión
  // de diseño. Para texto chico acento ya existe `accentText`.
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    error: '#cc2a1e',
    // Registration/onboarding ("BizAINet" fintech) palette — derived light equivalents of the
    // dark-only Figma design (see dark below), kept on the same cyan/navy brand hue.
    screenBackground: '#f4f9fc',
    card: '#eef6fa',
    cardElevated: '#e2eef5',
    accent: '#1d96ac',
    accentStrong: '#0c6e7f',
    textMuted: '#526e87',
    success: '#2abb22',
    successStrong: '#1f8f19',
    warning: '#936019',
    border: 'rgba(29, 150, 172, 0.18)',
    // Perfil (Figma "Ver/Editar Perfil", modo claro)
    textPrimary: '#0c1d32',
    surface: '#ffffff',
    surfaceBorder: '#e1e8f0',
    surfaceInset: '#f4f7fa',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    eyebrow: '#1b7c16',
    successSurface: '#ddf5db',
    successBorder: 'rgba(42, 187, 34, 0.3)',
    buttonDark: '#0c1d32',
    onButtonDark: '#ffffff',
    accentSoft: 'rgba(29, 150, 172, 0.15)',
    // Texto acento chico sobre card/surface (subtítulos, botón outline): `accent` no llega a 4.5:1
    // sobre fondo claro, así que en claro es `accentStrong` y en oscuro `accent`.
    accentText: '#0c6e7f',
    // Mis Empresas (Figma "Mis Empresas - Listado Corporativo", modo claro)
    offerSoft: 'rgba(12, 110, 127, 0.1)',
    offerIconSoft: 'rgba(12, 110, 127, 0.2)',
    seekSoft: 'rgba(31, 143, 25, 0.1)',
    seekIconSoft: 'rgba(31, 143, 25, 0.2)',
    // Equipo y Contactos / Invitaciones Corporativas (Figma 2006:5286 / 2046:847, modo claro):
    // ámbar y rojo "pendiente/cancelar" del diseño no coinciden con `warning`/`error` de arriba
    // (son tonos Tailwind amber-500/600/100/200/50 y red-600, no los de BizAInet) — nuevos
    // tokens en vez de hex sueltos en los componentes. El verde "Propietario"/"EMPRESA
    // TITULAR" del mismo frame (#10b981) SÍ se normalizó a `success` (decisión de diseño,
    // ver commit) en lugar de agregarse como token aparte.
    warningAccent: '#f59e0b',
    warningText: '#9e5703',
    warningSoft: '#fef3c7',
    warningBorder: '#fde68a',
    warningSurface: '#fffbeb',
    errorSoft: '#fef2f2',
    errorBorder: '#fca5a5',
    // Muro/Inicio (Figma 2043:1778 claro / 2043:3343 oscuro): fondo de la tarjeta de post y texto
    // de cuerpo (descripción, etiqueta secundaria) — azul intermedio entre textPrimary y textMuted.
    feedCard: '#ffffff',
    textBody: '#3a5878',
    // Color de la sombra de la tarjeta del feed (opacidad 0.05 y radio 2 en el estilo).
    cardShadow: '#000000',
    // Badge "+N" sobre la media del feed: fondo y texto (Figma: negro 60% / #05101E al 80%).
    mediaScrim: 'rgba(0, 0, 0, 0.6)',
    onMedia: '#ffffff',
    // Fondo de pantalla al 80%: contador "1/3" de la galería y overlay de subida/error de la
    // miniatura de adjunto.
    screenOverlay: 'rgba(244, 249, 252, 0.8)',
    // Fondo detrás de modales y bottom sheets.
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    // ThemedText type="linkPrimary".
    linkPrimary: '#3c87f7',
    // Relleno acento con texto `onButtonDark` (burbuja enviada del chat, segmento activo de
    // SegmentedControl). `accent` (3.5:1 claro / 2:1 oscuro) y `accentStrong` oscuro (3.5:1) no
    // llegan a AA con blanco para 14px: se usa el `accentStrong` claro en los dos modos (5.9:1).
    accentSolid: '#0c6e7f',
    // Texto de StatusPill "success" sobre `successSurface`: `success` da 2.2:1 en claro; mismo
    // verde que `eyebrow` (4.6:1) pero token propio — `eyebrow` es el rótulo de sección.
    successText: '#1b7c16',
    // Overlay animado del splash (animated-icon.tsx): igual al backgroundColor de
    // expo-splash-screen en app.json — si cambia uno, cambiar el otro.
    splashBackground: '#208AEF',
    ...WelcomeColors,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    error: '#fa7f76',
    // Registration/onboarding ("BizAINet" fintech) palette — pixel-matched to the Figma design.
    screenBackground: '#011523',
    card: '#0c1d32',
    cardElevated: '#16324f',
    accent: '#5bc6d8',
    accentStrong: '#1d96ac',
    textMuted: '#7f9bb5',
    success: '#57e247',
    successStrong: '#2abb22',
    warning: '#e9a83b',
    border: 'rgba(91, 198, 216, 0.18)',
    // Perfil (Figma "Ver/Editar Perfil", modo oscuro)
    textPrimary: '#d1e5f9',
    surface: '#16324f',
    surfaceBorder: '#27496d',
    surfaceInset: '#0c1d32',
    navBackground: 'rgba(8, 29, 43, 0.95)',
    eyebrow: '#5ed356',
    successSurface: 'rgba(42, 187, 34, 0.15)',
    successBorder: 'rgba(42, 187, 34, 0.3)',
    buttonDark: '#15406a',
    onButtonDark: '#ffffff',
    accentSoft: 'rgba(91, 198, 216, 0.15)',
    accentText: '#5bc6d8',
    // Mis Empresas (Figma "Mis Empresas - Listado Corporativo", modo oscuro)
    offerSoft: 'rgba(29, 150, 172, 0.1)',
    offerIconSoft: 'rgba(29, 150, 172, 0.2)',
    seekSoft: 'rgba(42, 187, 34, 0.1)',
    seekIconSoft: 'rgba(42, 187, 34, 0.2)',
    // ponytail: no hay frame dark en el brief (2006:5874 / 2046:292 no se pudieron leer) —
    // derivados del mismo hue ambar/rojo sobre fondo oscuro en vez de pixel-matched. Ajustar
    // si aparece el screenshot real.
    warningAccent: '#e9a83b',
    warningText: '#f5c767',
    warningSoft: 'rgba(233, 168, 59, 0.18)',
    warningBorder: 'rgba(233, 168, 59, 0.35)',
    warningSurface: 'rgba(233, 168, 59, 0.12)',
    errorSoft: 'rgba(249, 112, 102, 0.12)',
    errorBorder: 'rgba(249, 112, 102, 0.35)',
    feedCard: '#0d2130',
    textBody: '#afc3d6',
    cardShadow: '#000000',
    mediaScrim: 'rgba(5, 16, 30, 0.8)',
    onMedia: '#ffffff',
    screenOverlay: 'rgba(1, 21, 35, 0.8)',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    linkPrimary: '#3c87f7',
    accentSolid: '#0c6e7f',
    // = `success` (8.7:1 sobre successSurface): en oscuro no cambia nada.
    successText: '#57e247',
    splashBackground: '#208AEF',
    ...WelcomeColors,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * `@expo-google-fonts/inter` empaqueta cada peso como su propia `fontFamily` estática
 * (`Inter_700Bold`, no "Inter" + `fontWeight: 700`) — a diferencia de una fuente variable,
 * Android no la sintetiza a partir de un solo archivo cuando ve un `fontWeight` suelto. Este
 * mapa centraliza peso→familia para que `ThemedText` lo resuelva una sola vez (ver
 * `interFontFamily`), en vez de que cada pantalla declare su propio `fontFamily` a mano.
 */
export const InterWeight: Record<string, string> = {
  '400': 'Inter_400Regular',
  normal: 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  bold: 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
};

/** Resuelve la `fontFamily` de Inter para un `fontWeight` dado (número o string). Sin peso o
 * peso no mapeado: cae a Medium, el peso "neutro" del resto de la escala (`default`/`small`). */
export function interFontFamily(weight?: TextStyle['fontWeight']): string {
  return InterWeight[String(weight ?? '500')] ?? InterWeight['500'];
}
