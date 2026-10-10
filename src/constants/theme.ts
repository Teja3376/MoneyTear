/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: "#FFFFFF",
    background: "#101010",
    card: "#181818",
    backgroundElement: "#181818",
    backgroundSelected: "#202020",
    textSecondary: "#A3A3A3",
    primary: "#0D518C",
    primaryForeground: "#FFFFFF",
    primaryDisabled: "#0D518CB3",
    primaryMuted: "#0D518CB3",
    primary70: "#0D518CB3",
    border: "#2A2A2A",
    input: "#2A2A2A",
    handle: "#3A3A3C",
    ring: "#0D518C",
    error: "#FF6B6B",
  },
  dark: {
    text: "#FFFFFF",
    background: "#101010",
    card: "#181818",
    backgroundElement: "#181818",
    backgroundSelected: "#202020",
    textSecondary: "#A3A3A3",
    primary: "#0D518C",
    primaryForeground: "#FFFFFF",
    primaryDisabled: "#0D518CB3",
    primaryMuted: "#0D518CB3",
    primary70: "#0D518CB3",
    border: "#2A2A2A",
    input: "#2A2A2A",
    handle: "#3A3A3C",
    ring: "#0D518C",
    error: "#FF6B6B",
  },
} as const;

export const theme = Colors.dark;

// Direct color tokens matching global.css for convenient imports in any component
export const {
  background,
  card,
  backgroundElement,
  backgroundSelected,
  primary,
  primaryForeground,
  primaryDisabled,
  primaryMuted,
  primary70,
  text,
  textSecondary,
  border,
  input,
  handle,
  ring,
  error,
} = Colors.dark;

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
