/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    error: '#D92D20',
    // Registration/onboarding ("BizAINet" fintech) palette — derived light equivalents of the
    // dark-only Figma design (see dark below), kept on the same cyan/navy brand hue.
    screenBackground: '#f4f9fc',
    card: '#eef6fa',
    cardElevated: '#e2eef5',
    accent: '#1d96ac',
    accentStrong: '#0c6e7f',
    textMuted: '#54708a',
    success: '#2abb22',
    successStrong: '#1f8f19',
    warning: '#b9791f',
    border: 'rgba(29, 150, 172, 0.18)',
    // Perfil (Figma "Ver/Editar Perfil", modo claro)
    textPrimary: '#0c1d32',
    surface: '#ffffff',
    surfaceBorder: '#e1e8f0',
    surfaceInset: '#f4f7fa',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    eyebrow: '#1e8a19',
    successSurface: '#ddf5db',
    successBorder: 'rgba(42, 187, 34, 0.3)',
    buttonDark: '#0c1d32',
    onButtonDark: '#ffffff',
    accentSoft: 'rgba(29, 150, 172, 0.15)',
    // Mis Empresas (Figma "Mis Empresas - Listado Corporativo", modo claro)
    offerSoft: 'rgba(12, 110, 127, 0.1)',
    offerIconSoft: 'rgba(12, 110, 127, 0.2)',
    seekSoft: 'rgba(31, 143, 25, 0.1)',
    seekIconSoft: 'rgba(31, 143, 25, 0.2)',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    error: '#F97066',
    // Registration/onboarding ("BizAINet" fintech) palette — pixel-matched to the Figma design.
    screenBackground: '#011523',
    card: '#0c1d32',
    cardElevated: '#16324f',
    accent: '#5bc6d8',
    accentStrong: '#1d96ac',
    textMuted: '#7e9ab5',
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
    // Mis Empresas (Figma "Mis Empresas - Listado Corporativo", modo oscuro)
    offerSoft: 'rgba(29, 150, 172, 0.1)',
    offerIconSoft: 'rgba(29, 150, 172, 0.2)',
    seekSoft: 'rgba(42, 187, 34, 0.1)',
    seekIconSoft: 'rgba(42, 187, 34, 0.2)',
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
